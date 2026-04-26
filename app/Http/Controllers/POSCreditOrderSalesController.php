<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrder;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCreditOrderSalesController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = Carbon::parse($request->input('date_from', now()->startOfMonth()))
            ->startOfDay();
        $dateTo = Carbon::parse($request->input('date_to', now()->endOfMonth()))
            ->endOfDay();
        $itemTypeFilter = $request->input('item_type', 'all');
        $locationId     = $request->input('location_id', 'all');

        // All non-voided orders up to dateTo
        $query = InstallmentOrder::query()
            ->where('is_voided', false)
            ->where('transaction_date', '<=', $dateTo);

        if ($locationId !== 'all') {
            $query->where('branch_id', $locationId);
        }

        if ($itemTypeFilter !== 'all') {
            $query->whereHas('installment_order_items.item', function ($q) use ($itemTypeFilter) {
                $q->where('item_type', $itemTypeFilter);
            });
        }

        $orders = $query->with(['installment_order_payments', 'installment_order_items.item'])->get();

        $today = now();

        // PNV helper — mirrors the SQL CASE logic
        $pnvOf = function ($order): float {
            if ($order->promisory_note_value_interest < 0.01) {
                return (float) $order->loan_contract_price - (float) $order->down_payment;
            }
            return ((float) $order->promisory_note_value * (float) $order->promisory_note_value_interest)
                + (float) $order->promisory_note_value_interest_additional_charge;
        };

        // ── Portfolio Overview (all statuses) ──────────────────────────────
        $totalActivePnv         = 0;
        $totalCompletedPnv      = 0;
        $totalDefaultedPnv      = 0;
        $totalActiveAccounts    = 0;
        $totalCompletedAccounts = 0;
        $totalDefaultedAccounts = 0;
        $totalLCP               = 0;
        $totalDownPayment       = 0;
        $totalAdvancedPayments  = 0;
        $totalRebate            = 0;
        $totalPenalty           = 0;

        // ── Active-only aggregates ─────────────────────────────────────────
        // Expected = dues scheduled within date range (active accounts)
        $expectedInPeriod       = 0;
        // Actual collected within date range (payment date falls in range)
        $actualCollectedInPeriod = 0;

        // Receivables aging (outstanding balance, active only)
        $receivables = ['current' => 0, '30_days' => 0, '60_days' => 0, '90_days' => 0, '90_plus_days' => 0, 'total' => 0];

        // Collections aging (payments made, active only, by due date bucket)
        $collections = ['current' => 0, '30_days' => 0, '60_days' => 0, '90_days' => 0, '90_plus_days' => 0, 'total' => 0];

        // Expected vs Actual by month (last 6 months for trend chart)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i);
            $key = $m->format('Y-m');
            $monthlyTrend[$key] = ['month' => $m->format('M Y'), 'expected' => 0, 'collected' => 0];
        }

        // Item type aggregates (active only)
        $accountsByItemType    = [
            'furniture'  => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
            'appliances' => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
            'gadgets'    => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
        ];

        $totalAmountDue        = 0;
        $totalAmountPaid       = 0;
        $totalRemainingBalance = 0;
        $collectibleBalance    = 0;
        $defaultedBalance      = 0;

        foreach ($orders as $order) {
            $itemType = $order->installment_order_items->first()?->item?->item_type ?? 'gadgets';
            $isActive = !$order->is_completed && !$order->is_defaulted;

            $pnv = $pnvOf($order);

            // Portfolio counts
            if ($isActive) {
                $totalActivePnv += $pnv;
                $totalActiveAccounts++;
            } elseif ($order->is_completed) {
                $totalCompletedPnv += $pnv;
                $totalCompletedAccounts++;
            } elseif ($order->is_defaulted) {
                $totalDefaultedPnv += $pnv;
                $totalDefaultedAccounts++;
            }

            $totalAdvancedPayments += $order->total_advanced_payment;
            $totalLCP += $order->loan_contract_price * $order->lcp_markup_rate + floatval($order->lcp_additional_charge);
            $totalDownPayment += $order->down_payment;

            $orderAmountDue  = 0;
            $orderAmountPaid = 0;

            foreach ($order->installment_order_payments as $payment) {
                $orderAmountDue  += $payment->amount_due;
                $orderAmountPaid += $payment->amount_paid;

                if ($payment->rebate_amount > 0) {
                    $totalRebate += $payment->rebate_amount;
                }

                $dueDate     = Carbon::parse($payment->due_date);
                $daysOverdue = $today->diffInDays($dueDate, false); // positive = future, negative = past

                // ── Active-only section ────────────────────────────────────
                if ($isActive) {

                    // EXPECTED in period: payments whose due_date falls within date range
                    if ($dueDate->between($dateFrom, $dateTo)) {
                        $expectedInPeriod += $payment->amount_due;
                        $accountsByItemType[$itemType]['expected'] += $payment->amount_due;
                    }

                    // ACTUAL collected in period: payments where paid_date falls within date range
                    if ($payment->paid_date) {
                        $paidDate = Carbon::parse($payment->paid_date);
                        if ($paidDate->between($dateFrom, $dateTo) && $payment->amount_paid > 0) {
                            $actualCollectedInPeriod += $payment->amount_paid;
                            $accountsByItemType[$itemType]['collected'] += $payment->amount_paid;
                        }
                    }

                    // Monthly trend (by due date bucket, last 6 months)
                    $dueDateKey = $dueDate->format('Y-m');
                    if (isset($monthlyTrend[$dueDateKey])) {
                        $monthlyTrend[$dueDateKey]['expected'] += $payment->amount_due;
                        $monthlyTrend[$dueDateKey]['collected'] += $payment->amount_paid;
                    }

                    // Receivables aging (outstanding balance)
                    $balance = $payment->amount_due - $payment->amount_paid;
                    if ($balance > 0) {
                        if ($daysOverdue >= 0)       $receivables['current']      += $balance;
                        elseif ($daysOverdue >= -30)  $receivables['30_days']      += $balance;
                        elseif ($daysOverdue >= -60)  $receivables['60_days']      += $balance;
                        elseif ($daysOverdue >= -90)  $receivables['90_days']      += $balance;
                        else                          $receivables['90_plus_days'] += $balance;
                        $receivables['total'] += $balance;
                        $accountsByItemType[$itemType]['balance'] += $balance;
                    }

                    // Collections aging (by due date bucket)
                    if ($payment->amount_paid > 0) {
                        if ($daysOverdue >= 0)       $collections['current']      += $payment->amount_paid;
                        elseif ($daysOverdue >= -30)  $collections['30_days']      += $payment->amount_paid;
                        elseif ($daysOverdue >= -60)  $collections['60_days']      += $payment->amount_paid;
                        elseif ($daysOverdue >= -90)  $collections['90_days']      += $payment->amount_paid;
                        else                          $collections['90_plus_days'] += $payment->amount_paid;
                        $collections['total'] += $payment->amount_paid;
                    }

                    // Item type PNV (active only)
                    $accountsByItemType[$itemType]['pnv'] = ($accountsByItemType[$itemType]['pnv'] ?? 0) + 0; // set once below
                }
            }

            $totalAmountDue  += $orderAmountDue;
            $totalAmountPaid += $orderAmountPaid;

            $orderRemainingBalance  = $orderAmountDue - $orderAmountPaid;
            $totalRemainingBalance += $orderRemainingBalance;

            if ($order->is_defaulted) {
                $defaultedBalance += $orderRemainingBalance;
            } else {
                $collectibleBalance += $orderRemainingBalance;
            }

            if ($isActive) {
                $accountsByItemType[$itemType]['count']++;
                $accountsByItemType[$itemType]['pnv'] += $pnv;
            }
        }

        $totalPnv = $totalActivePnv + $totalCompletedPnv + $totalDefaultedPnv;

        // Collection rate: actual collected in period vs expected in period
        $periodCollectionRate = $expectedInPeriod > 0
            ? round(($actualCollectedInPeriod / $expectedInPeriod) * 100, 2)
            : 0;

        // Overall collection rate (all time, active accounts)
        $overallCollectionRate = $totalAmountDue > 0
            ? round(($totalAmountPaid / $totalAmountDue) * 100, 2)
            : 0;

        $targetRate = 85.00;

        return Inertia::render('POSCreditOrderSales/Index', [
            'filters' => [
                'date_from'   => $dateFrom->toDateString(),
                'date_to'     => $dateTo->toDateString(),
                'item_type'   => $itemTypeFilter,
                'location_id' => $locationId,
            ],
            'locations' => Location::select('id', 'name')->get(),

            // ── Portfolio snapshot ─────────────────────────────────────────
            'portfolio' => [
                'total_pnv'               => round($totalPnv, 2),
                'total_active_pnv'        => round($totalActivePnv, 2),
                'total_completed_pnv'     => round($totalCompletedPnv, 2),
                'total_defaulted_pnv'     => round($totalDefaultedPnv, 2),
                'active_accounts'         => $totalActiveAccounts,
                'completed_accounts'      => $totalCompletedAccounts,
                'defaulted_accounts'      => $totalDefaultedAccounts,
                'total_accounts'          => $totalActiveAccounts + $totalCompletedAccounts + $totalDefaultedAccounts,
                'total_lcp'               => round($totalLCP, 2),
                'total_down_payment'      => round($totalDownPayment, 2),
                'collectible_balance'     => round($collectibleBalance, 2),
                'defaulted_balance'       => round($defaultedBalance, 2),
                'total_remaining_balance' => round($totalRemainingBalance, 2),
                'total_rebate'            => round($totalRebate, 2),
                'total_advanced_payment'  => round($totalAdvancedPayments, 2),
            ],

            // ── Period performance (filtered date range, active only) ───────
            'period' => [
                'date_from'               => $dateFrom->toDateString(),
                'date_to'                 => $dateTo->toDateString(),
                'expected'                => round($expectedInPeriod, 2),
                'actual_collected'        => round($actualCollectedInPeriod, 2),
                'uncollected'             => round(max($expectedInPeriod - $actualCollectedInPeriod, 0), 2),
                'collection_rate'         => $periodCollectionRate,
                'target_rate'             => $targetRate,
                'variance'                => round($periodCollectionRate - $targetRate, 2),
                'overall_collection_rate' => $overallCollectionRate,
            ],

            // ── Receivables aging (active accounts only) ───────────────────
            'receivables' => [
                'current'      => round($receivables['current'], 2),
                '30_days'      => round($receivables['30_days'], 2),
                '60_days'      => round($receivables['60_days'], 2),
                '90_days'      => round($receivables['90_days'], 2),
                '90_plus_days' => round($receivables['90_plus_days'], 2),
                'total'        => round($receivables['total'], 2),
            ],

            // ── Collections aging (active accounts only) ───────────────────
            'collections' => [
                'current'      => round($collections['current'], 2),
                '30_days'      => round($collections['30_days'], 2),
                '60_days'      => round($collections['60_days'], 2),
                '90_days'      => round($collections['90_days'], 2),
                '90_plus_days' => round($collections['90_plus_days'], 2),
                'total'        => round($collections['total'], 2),
            ],

            // ── Item type breakdown (active accounts only) ─────────────────
            'by_item_type' => [
                'furniture'  => [
                    'count'     => $accountsByItemType['furniture']['count'],
                    'pnv'       => round($accountsByItemType['furniture']['pnv'], 2),
                    'expected'  => round($accountsByItemType['furniture']['expected'], 2),
                    'collected' => round($accountsByItemType['furniture']['collected'], 2),
                    'balance'   => round($accountsByItemType['furniture']['balance'], 2),
                ],
                'appliances' => [
                    'count'     => $accountsByItemType['appliances']['count'],
                    'pnv'       => round($accountsByItemType['appliances']['pnv'], 2),
                    'expected'  => round($accountsByItemType['appliances']['expected'], 2),
                    'collected' => round($accountsByItemType['appliances']['collected'], 2),
                    'balance'   => round($accountsByItemType['appliances']['balance'], 2),
                ],
                'gadgets'    => [
                    'count'     => $accountsByItemType['gadgets']['count'],
                    'pnv'       => round($accountsByItemType['gadgets']['pnv'], 2),
                    'expected'  => round($accountsByItemType['gadgets']['expected'], 2),
                    'collected' => round($accountsByItemType['gadgets']['collected'], 2),
                    'balance'   => round($accountsByItemType['gadgets']['balance'], 2),
                ],
            ],

            // ── Monthly trend (last 6 months) ──────────────────────────────
            'monthly_trend' => array_values($monthlyTrend),
        ]);
    }
}
