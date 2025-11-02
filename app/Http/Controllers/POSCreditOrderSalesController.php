<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPayment;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSCreditOrderSalesController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', now()->endOfMonth()->toDateString());
        $itemTypeFilter = $request->input('item_type', 'all');
        $locationId = $request->input('location_id', 'all');

    
        $query = InstallmentOrder::query()
            ->where('is_voided', false)
            ->where('transaction_date', '<=', $dateTo);
       

       

        if ($locationId !== 'all') {
            $query->where('location_id', $locationId);
        }

        if ($itemTypeFilter !== 'all') {
            $query->whereHas('installment_order_item.item', function($q) use ($itemTypeFilter) {
                $q->where('item_type', $itemTypeFilter);
            });
        }
  

        $orders = $query->with(['installment_order_payments', 'installment_order_item.item'])->get();

        $today = now();

        // Calculate receivables by aging
        $receivables = [
            'current' => 0,
            '30_days' => 0,
            '60_days' => 0,
            '90_days' => 0,
            '90_plus_days' => 0,
            'total' => 0,
        ];

        // Calculate actual collections by aging
        $collections = [
            'current' => 0,
            '30_days' => 0,
            '60_days' => 0,
            '90_days' => 0,
            '90_plus_days' => 0,
            'total' => 0,
        ];

        // Accounts per item type
        $accountsByItemType = [
            'furniture' => ['count' => 0, 'amount' => 0],
            'appliances' => ['count' => 0, 'amount' => 0],
            'gadgets' => ['count' => 0, 'amount' => 0],
        ];

        // Collections per item type
        $collectionsByItemType = [
            'furniture' => 0,
            'appliances' => 0,
            'gadgets' => 0,
        ];

        // Advance payments per item type
        $advanceByItemType = [
            'furniture' => 0,
            'appliances' => 0,
            'gadgets' => 0,
        ];

        $totalPNV = 0;
        $totalRemainingBalance = 0;
        $collectibleBalance = 0;
        $defaultedBalance = 0;
        $totalDownPayment = 0;
        $totalLCP = 0;
        $totalAmountDue = 0;
        $totalAmountPaid = 0;
        $totalAdvancedPayments = 0;

        foreach ($orders as $order) {
            $itemType = $order->installment_order_item->item->item_type ?? 'furniture';

            $totalAdvancedPayments += $order->total_advanced_payment;

            $totalPNV += $order->total_pnv;
            $totalLCP += $order->loan_contract_price * $order->lcp_markup_rate + floatval($order->lcp_additional_charge);
            $totalDownPayment += $order->down_payment;

            // Calculate total amount due and paid for this order
            $orderAmountDue = 0;
            $orderAmountPaid = 0;

            foreach ($order->installment_order_payments as $payment) {
                $orderAmountDue += $payment->amount_due;
                $orderAmountPaid += $payment->amount_paid;
                
                $balance = $payment->amount_due - $payment->amount_paid;
                
                // Only count if there's a balance
                if ($balance > 0) {
                    $dueDate = Carbon::parse($payment->due_date);
                    $daysOverdue = $today->diffInDays($dueDate, false);
                    
                    // Receivables by aging
                    if ($daysOverdue >= 0) {
                        $receivables['current'] += $balance;
                    } elseif ($daysOverdue >= -30) {
                        $receivables['30_days'] += $balance;
                    } elseif ($daysOverdue >= -60) {
                        $receivables['60_days'] += $balance;
                    } elseif ($daysOverdue >= -90) {
                        $receivables['90_days'] += $balance;
                    } else {
                        $receivables['90_plus_days'] += $balance;
                    }
                    
                    $receivables['total'] += $balance;
                }

                // Collections by aging (payments made)
                if ($payment->amount_paid > 0) {
                    $dueDate = Carbon::parse($payment->due_date);
                    $daysOverdue = $today->diffInDays($dueDate, false);
                    
                    if ($daysOverdue >= 0) {
                        $collections['current'] += $payment->amount_paid;
                    } elseif ($daysOverdue >= -30) {
                        $collections['30_days'] += $payment->amount_paid;
                    } elseif ($daysOverdue >= -60) {
                        $collections['60_days'] += $payment->amount_paid;
                    } elseif ($daysOverdue >= -90) {
                        $collections['90_days'] += $payment->amount_paid;
                    } else {
                        $collections['90_plus_days'] += $payment->amount_paid;
                    }
                    
                    $collections['total'] += $payment->amount_paid;
                    $collectionsByItemType[$itemType] += $payment->amount_paid;
                }

                // Check for advance payments (paid before due date)
                if ($payment->paid_date && $payment->amount_paid > 0) {
                    $paidDate = Carbon::parse($payment->paid_date);
                    $dueDate = Carbon::parse($payment->due_date);
                    
                    if ($paidDate->lessThan($dueDate)) {
                        $advanceByItemType[$itemType] += $payment->amount_paid;
                    }
                }
            }

            $totalAmountDue += $orderAmountDue;
            $totalAmountPaid += $orderAmountPaid;
            
            $orderRemainingBalance = $orderAmountDue - $orderAmountPaid;
            $totalRemainingBalance += $orderRemainingBalance;

            // Separate collectible vs defaulted balances
            if ($order->is_defaulted) {
                $defaultedBalance += $orderRemainingBalance;
            } else {
                $collectibleBalance += $orderRemainingBalance;
            }

            // Accounts per item type
            $accountsByItemType[$itemType]['count']++;
            $accountsByItemType[$itemType]['amount'] += $orderAmountDue;
        }

        // Collection performance
        $collectionRate = $totalAmountDue > 0 ? ($totalAmountPaid / $totalAmountDue) * 100 : 0;
        
        // Active accounts
        $activeAccounts = $orders->where('is_completed', false)->where('is_defaulted', false)->count();

        $completedAccounts = $orders->where('is_completed', true)->count();
        $defaultedAccounts = $orders->where('is_defaulted', true)->count();


        return Inertia::render('POSCreditOrderSales/Index', [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'item_type' => $itemTypeFilter,
                'location_id' => $locationId,
            ],
            'locations' => Location::select('id', 'name')->get(),
            'summary' => [
                'total_lcp' => round($totalLCP, 2),
                'total_down_payment' => round($totalDownPayment, 2),
                'total_pnv' => round($totalPNV, 2),
                'total_amount_due' => round($totalAmountDue, 2),
                'total_amount_paid' => round($totalAmountPaid, 2) - $totalAdvancedPayments,
                'total_remaining_balance' => round($totalRemainingBalance,
                 2),
                 'total_advanced_payment' => $totalAdvancedPayments,
                'collectible_balance' => round($collectibleBalance, 2),
                'defaulted_balance' => round($defaultedBalance, 2),
                'total_orders' => $orders->count(),
                'active_accounts' => $activeAccounts,
                'completed_accounts' => $completedAccounts,
                'defaulted_accounts' => $defaultedAccounts,
            ],
            'receivables' => [
                'current' => round($receivables['current'], 2),
                '30_days' => round($receivables['30_days'], 2),
                '60_days' => round($receivables['60_days'], 2),
                '90_days' => round($receivables['90_days'], 2),
                '90_plus_days' => round($receivables['90_plus_days'], 2),
                'total' => round($receivables['total'], 2),
            ],
            'collections' => [
                'current' => round($collections['current'], 2),
                '30_days' => round($collections['30_days'], 2),
                '60_days' => round($collections['60_days'], 2),
                '90_days' => round($collections['90_days'], 2),
                '90_plus_days' => round($collections['90_plus_days'], 2),
                'total' => round($collections['total'], 2),
            ],
            'accounts_by_item_type' => [
                'furniture' => [
                    'count' => $accountsByItemType['furniture']['count'],
                    'amount' => round($accountsByItemType['furniture']['amount'], 2),
                ],
                'appliances' => [
                    'count' => $accountsByItemType['appliances']['count'],
                    'amount' => round($accountsByItemType['appliances']['amount'], 2),
                ],
                'gadgets' => [
                    'count' => $accountsByItemType['gadgets']['count'],
                    'amount' => round($accountsByItemType['gadgets']['amount'], 2),
                ],
            ],
            'collections_by_item_type' => [
                'furniture' => round($collectionsByItemType['furniture'], 2),
                'appliances' => round($collectionsByItemType['appliances'], 2),
                'gadgets' => round($collectionsByItemType['gadgets'], 2),
            ],
            'advance_by_item_type' => [
                'furniture' => round($advanceByItemType['furniture'], 2),
                'appliances' => round($advanceByItemType['appliances'], 2),
                'gadgets' => round($advanceByItemType['gadgets'], 2),
            ],
            'rebate_by_item_type' => [
                'furniture' => 0,
                'appliances' => 0,
                'gadgets' => 0,
            ],
            'collection_performance' => [
                'collection_rate' => round($collectionRate, 2),
                'target_rate' => 85.00,
                'variance' => round($collectionRate - 85.00, 2),
            ],
        ]);
    }
}