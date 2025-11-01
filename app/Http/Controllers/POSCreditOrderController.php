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
    $query = InstallmentOrder::with(['user', 'location', 'installment_order_item.item'])->latest();

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

    // Aging Filter (only applies to active orders)
    if ($request->filled('aging') && $request->aging !== 'all') {
        $query->where('is_voided', false)->where('is_defaulted', false);
        
        $agingValue = $request->aging;
        
        if ($agingValue === 'current') {
            // Current month
            $query->whereMonth('transaction_date', now()->month)
                  ->whereYear('transaction_date', now()->year);
        } elseif ($agingValue === 'new_releases') {
            // Last 30 days
            $query->whereDate('transaction_date', '>=', now()->subDays(30));
        } else {
            // Aging by months (1-12)
            $monthsAgo = (int) $agingValue;
            $startDate = now()->subMonths($monthsAgo)->startOfMonth();
            $endDate = now()->subMonths($monthsAgo)->endOfMonth();
            
            $query->whereDate('transaction_date', '>=', $startDate)
                  ->whereDate('transaction_date', '<=', $endDate);
        }
    }

    // Item Type Filter (appliances, furniture, gadgets)
    if ($request->filled('item_type') && $request->item_type !== 'all') {
        $query->whereHas('installment_order_item.item', function($q) use ($request) {
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
    

    public function show($order_number){
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

    $payment = InstallmentOrderPayment::findOrFail($validated['installment_order_payment_id']);
    
    DB::beginTransaction();

    // Get current amount paid
    $currentAmountPaid = $payment->amount_paid ?? 0;
    
    // Calculate new total amount paid
    $newAmountPaid = $currentAmountPaid + $validated['amount_paid'];
    
    // Validate that new amount doesn't exceed amount due
    if ($newAmountPaid > $payment->amount_due) {
        return back()->withErrors([
            'amount_paid' => 'Payment amount exceeds remaining balance.'
        ])->withInput();
    }
    
    // Determine payment status
    $status = 'partial';
    if ($newAmountPaid >= $payment->amount_due) {
        $status = 'paid';
    }
    
    // Update payment record
    $payment->update([
        'amount_paid' => $newAmountPaid,
        'payment_method' => $validated['payment_method'],
        'reference_number' => $validated['reference_number'],
        'paid_date' => $validated['paid_date'],
        'status' => $status
    ]);
    
    // Optional: Create a payment history/log entry
    InstallmentOrderPaymentHistory::create([
        'payment_id' => $payment->id,
        'amount' => $validated['amount_paid'],
        'payment_method' => $validated['payment_method'],
        'reference_number' => $validated['reference_number'],
        'paid_date' => $validated['paid_date'],
        'user_id' => Auth::id()
    ]);
    
    // Check if all payments are completed to mark order as completed
    $installmentOrder = InstallmentOrder::find($validated['installment_order_id']);
    $allPaymentsPaid = $installmentOrder->installment_order_payments()
        ->where('status', '!=', 'paid')
        ->where('status', '!=', 'completed')
        ->count() === 0;
    
    if ($allPaymentsPaid) {
        $installmentOrder->update(['is_completed' => true]);
    }

    DB::commit();

    return back()->with('success', 'Payment recorded successfully!');
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
            'deafult_date' => now(),
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
