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
    $query = InstallmentOrder::with(['customer', 'user', 'location', 'installment_order_item.item'])
        ->latest('transaction_date');

    // ============================================
    // COMMON FILTERS (Available in both Simple and Advanced modes)
    // ============================================

    /**
     * Search Filter
     * Searches by order number or customer name
     */
    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
              ->orWhereHas('customer', function($customerQuery) use ($search) {
                  $customerQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
              });
        });
    }

    /**
     * Date Range Filter
     * Filters orders between date_from and date_to based on transaction_date
     */
    if ($request->filled('date_from')) {
        $query->whereDate('transaction_date', '>=', $request->input('date_from'));
    }

    if ($request->filled('date_to')) {
        $query->whereDate('transaction_date', '<=', $request->input('date_to'));
    }

    /**
     * Location Filter
     * Filters orders by branch/location
     */
    if ($request->filled('location_id') && $request->location_id !== 'all') {
        $query->where('location_id', $request->location_id);
    }

    /**
     * Status Filter
     * Filters by order status: active, complete, voided, defaulted
     */
    if ($request->filled('status') && $request->status !== 'all') {
        $query->when($request->status === 'active', fn($q) => $q->where('is_voided', false)
                ->where('is_defaulted', false)
                ->where('is_completed', false))
            ->when($request->status === 'voided', fn($q) => $q->where('is_voided', true))
            ->when($request->status === 'defaulted', fn($q) => $q->where('is_defaulted', true))
            ->when($request->status === 'complete', fn($q) => $q->where('is_completed', true));
    }

    /**
     * Item Type Filter
     * Filters by product category: appliances, furniture, gadgets
     */
    if ($request->filled('item_type') && $request->item_type !== 'all') {
        $query->whereHas('installment_order_item.item', function ($q) use ($request) {
            $q->where('item_type', $request->item_type);
        });
    }

    // ============================================
    // ADVANCED FILTERS (Only when advanced_filter is provided)
    // ============================================

    /**
     * Advanced Loan Analytics Filter
     * These filters help identify problematic loans and payment patterns
     */
    if ($request->filled('advanced_filter') && $request->advanced_filter !== 'all') {
        $today = now();
        $advancedFilter = $request->advanced_filter;

        // Only apply to active orders (not voided, defaulted, or completed)
        $query->where('is_voided', false)
            ->where('is_defaulted', false)
            ->where('is_accelerated', false)
            ->where('is_completed', false);

        switch ($advancedFilter) {
            /**
             * 30 Days Aging
             * Shows orders with payments overdue between 30-59 days
             * Logic: Has at least one payment where due_date is 30-59 days in the past and not fully paid
             */
            case '30_days_aging':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(30))
                        ->where('due_date', '>', $today->copy()->subDays(60));
                });
                break;

            /**
             * 60 Days Aging
             * Shows orders with payments overdue between 60-89 days
             * Logic: Has at least one payment where due_date is 60-89 days in the past and not fully paid
             */
            case '60_days_aging':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(60))
                        ->where('due_date', '>', $today->copy()->subDays(90));
                });
                break;

            /**
             * 90+ Days Aging
             * Shows orders with payments overdue 90 or more days
             * Logic: Has at least one payment where due_date is 90+ days in the past and not fully paid
             * These are high-risk accounts that may need collection action
             */
            case '90_days_aging':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<=', $today->copy()->subDays(90));
                });
                break;

            /**
             * Due Loans
             * Shows orders with payments due within the next 7 days
             * Logic: Has at least one payment where due_date is within 7 days and not yet fully paid
             * Useful for proactive customer reminders
             */
            case 'due_loans':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '>=', $today)
                        ->where('due_date', '<=', $today->copy()->addDays(29));
                });
                break;

            /**
             * Missed Repayments
             * Shows orders with at least one overdue payment
             * Logic: Has at least one payment where due_date has passed and not fully paid
             * Identifies customers who have missed at least one payment
             */
            case 'missed_repayments':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<', $today);
                });
                break;

            /**
             * Loans in Arrears
             * Shows orders with 2 or more consecutive missed payments
             * Logic: Has at least 2 consecutive payments that are overdue and unpaid
             * These are serious delinquencies that need immediate attention
             */
            case 'loans_in_arrears':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->select('installment_order_id')
                        ->whereRaw('amount_paid < amount_due')
                        ->where('due_date', '<', $today)
                        ->groupBy('installment_order_id')
                        ->havingRaw('COUNT(*) >= 2');
                });
                break;

            /**
             * No Repayments
             * Shows orders where no payments have been made at all
             * Logic: All payments have amount_paid = 0
             * Identifies customers who haven't started paying despite having an active loan
             */
            case 'no_repayments':
                $query->whereDoesntHave('installment_order_payments', function ($q) {
                    $q->where('amount_paid', '>', 0);
                });
                break;

            /**
             * Past Maturity Dates
             * Shows orders where the final payment due date has passed but loan is not completed
             * Logic: The last payment's due_date is in the past and order is still not marked as completed
             * These loans should have been fully paid but aren't
             */
            case 'past_maturity':
                $query->whereHas('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('installment_number = (
                        SELECT MAX(installment_number) 
                        FROM installment_order_payments AS iop 
                        WHERE iop.installment_order_id = installment_order_payments.installment_order_id
                    )')
                    ->where('due_date', '<', $today)
                    ->whereRaw('amount_paid < amount_due');
                });
                break;
        }
    }

    // ============================================
    // PAGINATION & RESPONSE
    // ============================================

    /**
     * Paginate results and return to frontend
     * withQueryString() preserves all filter parameters in pagination links
     */
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
            'paid_date' => ['required', 'date'],
            'collection_receipt_number' => ['required', 'string']
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
                $remainingDue = ($payment->amount_due - $payment->rebate_amount) - $currentAmountPaid;

                if ($remainingPayment >= $remainingDue) {
                    // Fully pay this installment
                    $payment->update([
                        'amount_paid' => $payment->amount_due - $payment->rebate_amount,
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
                        'collection_receipt_number' => $validated['collection_receipt_number']
                    ]);

                    $remainingPayment -= $remainingDue;
                } else {
                    // Partial payment for this installment
                    $newTotalPaid = $currentAmountPaid + $remainingPayment;
                    $status = $newTotalPaid >= $payment->amount_due - $payment->rebate_amount ? 'paid' : 'partial';

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
                        'collection_receipt_number' => $validated['collection_receipt_number']
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

    public function rebate(Request $request)
    {
        $validated = $request->validate([
            'installment_order_payment_id' => 'required',
            'rebate_amount' => 'required',
            'rebate_reason' => 'required'
        ]);
        $payment = InstallmentOrderPayment::findOrFail($validated['installment_order_payment_id']);
        $payment->update([
            'rebate_amount' => $payment->rebate_amount += $validated['rebate_amount'],
            'rebate_reason' => $validated['rebate_reason']
        ]);

        return back()->with('success', 'Rebate added successfully.');
    }

    public function accelerate(Request $request)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'acceleration_discount' => ['required'],
            'amount_paid' => ['required'],
            'reason_for_acceleration' => ['required', 'string'],
             'payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'paid_date' => ['required', 'date'],
            'collection_receipt_number' => ['required', 'string'],
        ]);

        DB::beginTransaction();

        try {
            $installmentOrder = InstallmentOrder::findOrFail($validated['installment_order_id']);
            $remainingPayment = $validated['amount_paid'];

            $installmentOrder->update([
                'acceleration_date' => now(),
                'is_accelerated' => true,
                'reason_for_acceleration' => $validated['reason_for_acceleration'],
                'acceleration_discount' => $validated['acceleration_discount']
            ]); 

            // Start from the current installment and move forward
            $payments = $installmentOrder->installment_order_payments()
                ->whereIn('status', ['pending', 'partial'])
                ->orderBy('installment_number')
                ->get();

            foreach ($payments as $payment) {
                // Skip if no remaining payment
                if ($remainingPayment <= 0) break;

                $currentAmountPaid = $payment->amount_paid ?? 0;
                $remainingDue = ($payment->amount_due - $payment->rebate_amount) - $currentAmountPaid;

                if ($remainingPayment >= $remainingDue) {
                    // Fully pay this installment
                    $payment->update([
                        'amount_paid' => $payment->amount_due - $payment->rebate_amount,
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
                        'collection_receipt_number' => $validated['collection_receipt_number']
                    ]);

                    $remainingPayment -= $remainingDue;
                } else {
                    // Partial payment for this installment
                    $newTotalPaid = $currentAmountPaid + $remainingPayment;
                    $status = $newTotalPaid >= $payment->amount_due - $payment->rebate_amount ? 'paid' : 'partial';

                    $payment->update([
                        'amount_paid' => $newTotalPaid,
                        'status' => 'paid',
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
                        'collection_receipt_number' => $validated['collection_receipt_number']
                    ]);

                    $remainingPayment = 0;
                }
            }

            // Mark order as completed if all payments are paid
            $unpaidCount = $installmentOrder->installment_order_payments()
                ->where('status', '!=', 'paid')
                ->count();

            $installmentOrder->update(['is_completed' => true]);

            DB::commit();

            return back()->with('success', 'Loan accelerated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Payment processing failed: ' . $e->getMessage()]);
        }
    }
}
