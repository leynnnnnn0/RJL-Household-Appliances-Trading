<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPayment;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Illuminate\Container\Attributes\Auth as AttributesAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSCreditOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = InstallmentOrder::with(['user', 'location', 'installment_order_item.item'])->latest('transaction_date');

        // Search by order number
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('order_number', 'like', "%{$search}%");
        }

        // Date From
        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->input('date_from'));
        }

        // Date To
        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->input('date_to'));
        }

        // Location Filter
        if ($request->filled('location_id') && $request->location_id !== 'all') {
            $query->where('location_id', $request->location_id);
        }

        // Employee/User Filter
        if ($request->filled('employee_id') && $request->employee_id !== 'all') {
            $query->where('user_id', $request->employee_id);
        }

        // Status Filter (defaulted, voided, active)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->when($request->status === 'active', fn($q) => $q->where('is_voided', false)->where('is_defaulted', false)->where('is_completed', false))
                ->when($request->status === 'voided', fn($q) => $q->where('is_voided', true))
                ->when($request->status === 'defaulted', fn($q) => $q->where('is_defaulted', true))
                ->when($request->status == 'complete', fn($q) => $q->where('is_completed', true));
        }

        // Aging Filter (based on overdue payments)
        if ($request->filled('aging') && $request->aging !== 'all') {
            $query->where('is_voided', false)
                ->where('is_defaulted', false)
                ->where('is_completed', false);

            $agingValue = $request->aging;
            $today = now();

            if ($agingValue === '1') {
                // 1-30 days overdue
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today)
                        ->where('due_date', '>=', $today->copy()->subDays(30));
                });
            } elseif ($agingValue === '2') {
                // 31-60 days overdue
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(31))
                        ->where('due_date', '>=', $today->copy()->subDays(60));
                });
            } elseif ($agingValue === '3') {
                // 61-90 days overdue
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(61))
                        ->where('due_date', '>=', $today->copy()->subDays(90));
                });
            } elseif ($agingValue === '4') {
                // 91+ days overdue
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(91));
                });
            } elseif ($agingValue === 'current') {
                // Current - no overdue payments (all payments either paid or not yet due)
                $query->whereDoesntHave('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<', $today);
                });
            } elseif ($agingValue === 'new_releases') {
                // New releases - orders created in last 7 days
                $query->whereDate('transaction_date', '>=', $today->copy()->subDays(7));
            }
        }

        // Item Type Filter (appliances, furniture, gadgets)
        if ($request->filled('item_type') && $request->item_type !== 'all') {
            $query->whereHas('installment_order_item.item', function ($q) use ($request) {
                $q->where('item_type', $request->item_type);
            });
        }

        $transactions = $query->paginate(8)->withQueryString();

        return Inertia::render('POSCreditOrder/Index', [
            'transactions' => $transactions,
            'locations' => Location::dropdown(),
            'employees' => User::dropdown(),
        ]);
    }

    public function show($order_number)
    {
        $transction = InstallmentOrder::with(['customer', 'location', 'user', 'voider', 'installment_order_item.item', 'installment_order_payments.installment_order_payment_history.user'])
            ->where('order_number', $order_number)->firstOrFail();

        $paymentHistory = $transction->installment_order_payments
            ->flatMap(function ($payment) {
                return $payment->installment_order_payment_history;
            });

        return Inertia::render('POSCreditOrder/Show', [
            'transaction' => $transction,
            'paymentHistory' => $paymentHistory
        ]);
    }

    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'installment_order_payment_id' => ['required', 'exists:installment_order_payments,id'],
            'installment_order_id' => ['required', 'exists:installment_orders,id'],
            'installment_number' => ['required', 'integer'],
            'amount_due' => ['required', 'numeric', 'min:0'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'paid_date' => ['required', 'date']
        ]);

        DB::beginTransaction();

        try {
            $installmentOrder = InstallmentOrder::findOrFail($validated['installment_order_id']);
            $remainingPayment = $validated['amount_paid'];
            $currentPayment = InstallmentOrderPayment::findOrFail($validated['installment_order_payment_id']);

            // Start from the current installment and move forward
            $payments = $installmentOrder->installment_order_payments()
                ->whereIn('status', ['pending', 'partial'])
                ->orderBy('installment_number')
                ->get();

            foreach ($payments as $payment) {
                // Skip if no remaining payment
                if ($remainingPayment <= 0) break;

                $currentAmountPaid = $payment->amount_paid ?? 0;
                $remainingDue = $payment->amount_due - $currentAmountPaid;

                if ($remainingPayment >= $remainingDue) {
                    // Fully pay this installment
                    $payment->update([
                        'amount_paid' => $payment->amount_due,
                        'status' => 'paid',
                        'payment_method' => $validated['payment_method'],
                        'reference_number' => $validated['reference_number'],
                        'paid_date' => $validated['paid_date'],
                    ]);

                    // Create payment history
                    InstallmentOrderPaymentHistory::create([
                        'payment_id' => $payment->id,
                        'amount' => $remainingDue,
                        'payment_method' => $validated['payment_method'],
                        'reference_number' => $validated['reference_number'],
                        'paid_date' => $validated['paid_date'],
                        'user_id' => Auth::id(),
                    ]);

                    $remainingPayment -= $remainingDue;
                } else {
                    // Partial payment for this installment
                    $newTotalPaid = $currentAmountPaid + $remainingPayment;
                    $status = $newTotalPaid >= $payment->amount_due ? 'paid' : 'partial';

                    $payment->update([
                        'amount_paid' => $newTotalPaid,
                        'status' => $status,
                        'payment_method' => $validated['payment_method'],
                        'reference_number' => $validated['reference_number'],
                        'paid_date' => $validated['paid_date'],
                    ]);

                    InstallmentOrderPaymentHistory::create([
                        'payment_id' => $payment->id,
                        'amount' => $remainingPayment,
                        'payment_method' => $validated['payment_method'],
                        'reference_number' => $validated['reference_number'],
                        'paid_date' => $validated['paid_date'],
                        'user_id' => Auth::id(),
                    ]);

                    $remainingPayment = 0;
                }
            }

            // Mark order as completed if all payments are paid
            $unpaidCount = $installmentOrder->installment_order_payments()
                ->where('status', '!=', 'paid')
                ->count();

            if ($unpaidCount === 0) {
                $installmentOrder->update(['is_completed' => true]);
            }

            DB::commit();

            return back()->with('success', 'Payment recorded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Payment processing failed: ' . $e->getMessage()]);
        }
    }


    public function void(Request $request, $id)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'reason_for_cancellation' => 'required|string'
        ]);
        $transaction = InstallmentOrder::with('installment_order_item.item')->findOrFail($id);

        DB::beginTransaction();
        $transaction->update([
            'is_voided' => true,
            'reason_for_cancellation' => $validated['reason_for_cancellation'],
            'void_date' => now(),
            'voider_id' => Auth::id()
        ]);

        $item = $transaction->installment_order_item->item;
        $item->update([
            'date_out' => null
        ]);

        $item->save();
        DB::commit();

        return back()->with('success', 'Order Voided');
    }

    public function default(Request $request, $id)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'default_reason' => 'required|string'
        ]);
        $transaction = InstallmentOrder::with('installment_order_item.item')->findOrFail($id);

        DB::beginTransaction();
        $transaction->update([
            'is_defaulted' => true,
            'default_reason' => $validated['default_reason'],
            'default_date' => now(),
            'defaulter_id' => Auth::id()
        ]);

        $item = $transaction->installment_order_item->item;
        $item->update([
            'date_out' => null
        ]);

        $item->save();
        DB::commit();

        return back()->with('success', 'Order Voided');
    }
}
