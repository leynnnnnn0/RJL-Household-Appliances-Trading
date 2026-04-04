<?php

namespace App\Http\Controllers;

use App\Models\Branch;
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
        $query = InstallmentOrder::with(['customer', 'user', 'location', 'installment_order_items.item', 'installment_order_payments'])
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
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
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
            $query->where('branch_id', $request->location_id);
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
            $query->whereHas('installment_order_items.item', function ($q) use ($request) {
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
                 * 1-30 Days Aging
                 */
                case '1_30_days_aging':
                    $query->whereHas('installment_order_payments', function ($q) use ($today) {
                        $q->whereRaw('amount_paid < (amount_due - rebate_amount)')
                            ->where('due_date', '<', $today)
                            ->where('due_date', '>=', $today->copy()->subDays(30))
                            ->whereRaw('id = (
                  SELECT id 
                  FROM installment_order_payments AS iop 
                  WHERE iop.installment_order_id = installment_order_payments.installment_order_id 
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                  ORDER BY iop.due_date ASC 
                  LIMIT 1
              )');
                    });
                    break;

                /**
                 * 31-60 Days Aging
                 */
                case '31_60_days_aging':
                    $query->whereHas('installment_order_payments', function ($q) use ($today) {
                        $q->whereRaw('amount_paid < (amount_due - rebate_amount)')
                            ->where('due_date', '<', $today->copy()->subDays(30))
                            ->where('due_date', '>=', $today->copy()->subDays(60))
                            ->whereRaw('id = (
                  SELECT id 
                  FROM installment_order_payments AS iop 
                  WHERE iop.installment_order_id = installment_order_payments.installment_order_id 
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                  ORDER BY iop.due_date ASC 
                  LIMIT 1
              )');
                    });
                    break;

                /**
                 * 61-90 Days Aging
                 */
                case '61_90_days_aging':
                    $query->whereHas('installment_order_payments', function ($q) use ($today) {
                        $q->whereRaw('amount_paid < (amount_due - rebate_amount)')
                            ->where('due_date', '<', $today->copy()->subDays(60))
                            ->where('due_date', '>=', $today->copy()->subDays(90))
                            ->whereRaw('id = (
                  SELECT id 
                  FROM installment_order_payments AS iop 
                  WHERE iop.installment_order_id = installment_order_payments.installment_order_id 
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                  ORDER BY iop.due_date ASC 
                  LIMIT 1
              )');
                    });
                    break;

                /**
                 * 90+ Days Aging
                 */
                case '90+_days_aging':
                    $query->whereHas('installment_order_payments', function ($q) use ($today) {
                        $q->whereRaw('amount_paid < (amount_due - rebate_amount)')
                            ->where('due_date', '<=', $today->copy()->subDays(90))
                            ->whereRaw('id = (
                  SELECT id 
                  FROM installment_order_payments AS iop 
                  WHERE iop.installment_order_id = installment_order_payments.installment_order_id 
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                  ORDER BY iop.due_date ASC 
                  LIMIT 1
              )');
                    });
                    break;

                /**
                 * Due Loans
                 */
                case 'due_loans':
                    $query->whereHas('installment_order_payments', function ($q) use ($today) {
                        $q->whereRaw('amount_paid < (amount_due - rebate_amount)')
                            ->where('due_date', $today->copy()->format('Y-m-d'))
                            ->whereRaw('id = (
                  SELECT id 
                  FROM installment_order_payments AS iop 
                  WHERE iop.installment_order_id = installment_order_payments.installment_order_id 
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                  ORDER BY iop.due_date ASC 
                  LIMIT 1
              )');
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
            'locations' => Branch::dropdown(),
            'employees' => User::dropdown(),
        ]);
    }


    public function show($order_number)
    {
        $transction = InstallmentOrder::with(['remarks.user', 'customer', 'location', 'user', 'voider', 'branch','installment_order_items.item', 'installment_order_payments.installment_order_payment_history.user'])
            ->where('order_number', $order_number)->firstOrFail();

        $paymentHistory = $transction->installment_order_payments
            ->flatMap(function ($payment) {
                return $payment->installment_order_payment_history;
            });

        return Inertia::render('POSCreditOrder/Show', [
            'transaction' => $transction,
            'paymentHistory' => $paymentHistory,
            'branches' => \App\Models\Branch::dropdown(),
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
            'collection_receipt_number' => ['required', 'string'],
            'branch_id' => ['required', 'exists:branches,id']
        ]);


        DB::beginTransaction();

        try {
            $installmentOrder = InstallmentOrder::findOrFail($validated['installment_order_id']);
            $remainingPayment = $validated['amount_paid'];
            $currentPayment = InstallmentOrderPayment::findOrFail($validated['installment_order_payment_id']);

            // Start from the current installment and move forward
            $payments = $installmentOrder->installment_order_payments()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
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
                        'collection_receipt_number' => $validated['collection_receipt_number'],
                        'branch_id' => $validated['branch_id']
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
                        'collection_receipt_number' => $validated['collection_receipt_number'],
                        'branch_id' => $validated['branch_id']
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
        $transaction = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

        DB::beginTransaction();
        $transaction->update([
            'is_voided' => true,
            'reason_for_cancellation' => $validated['reason_for_cancellation'],
            'void_date' => now(),
            'voider_id' => Auth::id()
        ]);

        $transaction->installment_order_items->map(function ($item) {
            $item->item->update([
                'date_out' => null
            ]);
        });




        DB::commit();

        return back()->with('success', 'Order Voided');
    }

    public function default(Request $request, $id)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'default_reason' => 'required|string'
        ]);
        $transaction = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

        DB::beginTransaction();
        $transaction->update([
            'is_defaulted' => true,
            'default_reason' => $validated['default_reason'],
            'default_date' => now(),
            'defaulter_id' => Auth::id()
        ]);

        $transaction->installment_order_items->map(function ($item) {
            $item->item->update([
                'date_out' => null
            ]);
        });


        DB::commit();

        return back()->with('success', 'Order Voided');
    }

    public function reactivate(Request $request, $id)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'reactivation_reason' => 'required|string'
        ]);

        $transaction = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

        DB::beginTransaction();
        $transaction->update([
            'is_defaulted' => false,
            'is_reactivated' => true,
            'reactivation_reason' => $validated['reactivation_reason'],
            'reactivation_date' => now(),
            'reactivator_id' => Auth::id()
        ]);


        $transaction->installment_order_items->map(function ($item) use ($transaction) {
            $item->item->update([
                'date_out' => $transaction->transaction_date
            ]);
        });


        DB::commit();

        return back()->with('success', 'Order Reactivated');
    }


    public function rebate(Request $request)
    {
        $validated = $request->validate([
            'installment_order_payment_id' => 'required',
            'rebate_amount' => 'required|numeric|min:0',
            'rebate_reason' => 'required|string'
        ]);

        DB::beginTransaction();

        try {
            $payment = InstallmentOrderPayment::findOrFail($validated['installment_order_payment_id']);

            // Update rebate amount
            $newRebateAmount = $payment->rebate_amount + $validated['rebate_amount'];

            // Calculate new status based on amount paid vs amount due (after rebate)
            $effectiveAmountDue = $payment->amount_due - $newRebateAmount;
            $amountPaid = $payment->amount_paid ?? 0;

            // Determine new status
            if ($amountPaid >= $effectiveAmountDue) {
                $newStatus = 'paid';
            } elseif ($amountPaid > 0) {
                $newStatus = 'partial';
            } else {
                $newStatus = $payment->status; // Keep existing status if no payment made
            }

            $payment->update([
                'rebate_amount' => $newRebateAmount,
                'rebate_reason' => $validated['rebate_reason'],
                'status' => $newStatus
            ]);

            // Check if all payments are now paid and update order completion status
            $installmentOrder = InstallmentOrder::with('installment_order_payments')->findOrFail($payment->installment_order_id);
            $unpaidCount = $installmentOrder->installment_order_payments()
                ->where('status', '!=', 'paid')
                ->count();

            if ($unpaidCount === 0 && !$installmentOrder->is_completed) {
                $installmentOrder->update(['is_completed' => true]);
            }

            DB::commit();

            return back()->with('success', 'Rebate added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Rebate processing failed: ' . $e->getMessage()]);
        }
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
            'branch_id' => ['required']
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
                ->whereIn('status', ['pending', 'partial', 'overdue'])
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
                        'collection_receipt_number' => $validated['collection_receipt_number'],
                        'branch_id' => $validated['branch_id']
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
                        'collection_receipt_number' => $validated['collection_receipt_number'],
                        'branch_id' => $validated['branch_id']
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

    public function updatePaymentHistory(Request $request, $historyId)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'paid_date' => ['required', 'date'],
            'collection_receipt_number' => ['required', 'string'],
            'branch_id' => ['required', 'exists:branches,id']
        ]);

        DB::beginTransaction();

        try {
            $paymentHistory = InstallmentOrderPaymentHistory::findOrFail($historyId);
            $payment = InstallmentOrderPayment::findOrFail($paymentHistory->payment_id);
            $installmentOrder = InstallmentOrder::findOrFail($payment->installment_order_id);

            // Calculate the difference in payment amount
            $oldAmount = $paymentHistory->amount;
            $newAmount = $validated['amount'];
            $amountDifference = $newAmount - $oldAmount;

            // Update the payment history record
            $paymentHistory->update([
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'paid_date' => $validated['paid_date'],
                'collection_receipt_number' => $validated['collection_receipt_number'],
                'branch_id' => $validated['branch_id']
            ]);

            // Adjust the payment's amount_paid
            $newTotalPaid = $payment->amount_paid + $amountDifference;

            // Calculate new status
            $effectiveAmountDue = $payment->amount_due - $payment->rebate_amount;

            if ($newTotalPaid >= $effectiveAmountDue) {
                $newStatus = 'paid';
            } elseif ($newTotalPaid > 0) {
                $newStatus = 'partial';
            } else {
                $newStatus = now()->gt($payment->due_date) ? 'overdue' : 'pending';
            }

            $payment->update([
                'amount_paid' => $newTotalPaid,
                'status' => $newStatus,
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'paid_date' => $validated['paid_date'],
            ]);

            // Recalculate order completion status
            $unpaidCount = $installmentOrder->installment_order_payments()
                ->where('status', '!=', 'paid')
                ->count();

            $installmentOrder->update(['is_completed' => $unpaidCount === 0]);

            DB::commit();

            return back()->with('success', 'Payment record updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Update failed: ' . $e->getMessage()]);
        }
    }

    public function deletePaymentHistory(Request $request, $historyId)
    {
        DB::beginTransaction();

        try {
            $paymentHistory = InstallmentOrderPaymentHistory::findOrFail($historyId);
            $payment = InstallmentOrderPayment::findOrFail($paymentHistory->payment_id);
            $installmentOrder = InstallmentOrder::findOrFail($payment->installment_order_id);

            // Subtract the payment amount from the installment payment
            $newTotalPaid = $payment->amount_paid - $paymentHistory->amount;

            // Calculate new status
            $effectiveAmountDue = $payment->amount_due - $payment->rebate_amount;

            if ($newTotalPaid >= $effectiveAmountDue) {
                $newStatus = 'paid';
            } elseif ($newTotalPaid > 0) {
                $newStatus = 'partial';
            } else {
                $newStatus = now()->gt($payment->due_date) ? 'overdue' : 'pending';
            }

            $payment->update([
                'amount_paid' => max(0, $newTotalPaid), // Ensure it doesn't go negative
                'status' => $newStatus,
            ]);

            // Delete the payment history record
            $paymentHistory->delete();

            // Recalculate order completion status
            $unpaidCount = $installmentOrder->installment_order_payments()
                ->where('status', '!=', 'paid')
                ->count();

            $installmentOrder->update(['is_completed' => $unpaidCount === 0]);

            DB::commit();

            return back()->with('success', 'Payment record deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Delete failed: ' . $e->getMessage()]);
        }
    }
}
