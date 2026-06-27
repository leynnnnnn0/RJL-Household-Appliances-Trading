<?php

namespace App\Services\POSCreditOrderSales;

use App\Models\InstallmentOrder;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class POSCreditOrderSalesService
{
    public function filters(array $input): array
    {
        return [
            'date_from' => Carbon::parse($input['date_from'] ?? now()->startOfMonth())->toDateString(),
            'date_to' => Carbon::parse($input['date_to'] ?? now()->endOfMonth())->toDateString(),
            'item_type' => $input['item_type'] ?? 'all',
            'location_id' => $input['location_id'] ?? 'all',
        ];
    }

    public function orders(array $filters): Collection
    {
        $dateTo = Carbon::parse($filters['date_to'])->endOfDay();

        return InstallmentOrder::query()
            ->with([
                'installment_order_payments.installment_order_payment_history',
                'installment_order_items.item',
            ])
            ->where('is_voided', false)
            ->where('transaction_date', '<=', $dateTo)
            ->when($filters['location_id'] !== 'all', fn ($query) => $query->where('branch_id', $filters['location_id']))
            ->when($filters['item_type'] !== 'all', fn ($query) => $query->whereHas(
                'installment_order_items.item',
                fn ($itemQuery) => $itemQuery->where('item_type', $filters['item_type'])
            ))
            ->get();
    }

    public function dashboardData(Collection $orders, array $filters): array
    {
        $dateFrom = Carbon::parse($filters['date_from'])->startOfDay();
        $dateTo = Carbon::parse($filters['date_to'])->endOfDay();
        $today = now();

        $portfolio = $this->emptyPortfolio();
        $period = [
            'expected' => 0,
            'actual_collected' => 0,
        ];
        $receivables = $this->emptyAgingBuckets();
        $collections = $this->emptyAgingBuckets();
        $monthlyTrend = $this->monthlyTrend();
        $accountsByItemType = $this->emptyItemTypes();

        $totalAmountDue = 0;
        $totalAmountPaid = 0;

        foreach ($orders as $order) {
            $itemType = $order->installment_order_items->first()?->item?->item_type ?? 'gadgets';
            $isActive = ! $order->is_completed && ! $order->is_defaulted;
            $pnv = $this->pnvOf($order);

            $this->addPortfolioStatus($portfolio, $order, $pnv, $isActive);

            $portfolio['total_advanced_payment'] += $order->total_advanced_payment;
            $portfolio['total_lcp'] += ($order->loan_contract_price * $order->lcp_markup_rate) + (float) $order->lcp_additional_charge;
            $portfolio['total_down_payment'] += $order->down_payment;

            $orderAmountDue = 0;
            $orderAmountPaid = 0;

            foreach ($order->installment_order_payments as $payment) {
                $orderAmountDue += $payment->amount_due;
                $orderAmountPaid += $payment->amount_paid;

                if ($payment->rebate_amount > 0) {
                    $portfolio['total_rebate'] += $payment->rebate_amount;
                }

                if (! $isActive) {
                    continue;
                }

                $dueDate = Carbon::parse($payment->due_date);
                $daysOverdue = $today->diffInDays($dueDate, false);

                $this->addPeriodExpected($period, $accountsByItemType, $itemType, $payment, $dueDate, $dateFrom, $dateTo);
                $this->addPeriodCollected($period, $accountsByItemType, $itemType, $payment, $dateFrom, $dateTo);
                $this->addMonthlyTrend($monthlyTrend, $payment, $dueDate);
                $this->addReceivable($receivables, $accountsByItemType, $itemType, $payment, $daysOverdue);
                $this->addCollection($collections, $payment, $daysOverdue);
            }

            $totalAmountDue += $orderAmountDue;
            $totalAmountPaid += $orderAmountPaid;

            $orderRemainingBalance = $orderAmountDue - $orderAmountPaid;
            $portfolio['total_remaining_balance'] += $orderRemainingBalance;

            if ($order->is_defaulted) {
                $portfolio['defaulted_balance'] += $orderRemainingBalance;
            } else {
                $portfolio['collectible_balance'] += $orderRemainingBalance;
            }

            if ($isActive) {
                $accountsByItemType[$itemType]['count']++;
                $accountsByItemType[$itemType]['pnv'] += $pnv;
            }
        }

        $portfolio['total_pnv'] = $portfolio['total_active_pnv'] + $portfolio['total_completed_pnv'] + $portfolio['total_defaulted_pnv'];
        $portfolio['total_accounts'] = $portfolio['active_accounts'] + $portfolio['completed_accounts'] + $portfolio['defaulted_accounts'];

        return [
            'filters' => $filters,
            'locations' => Location::select('id', 'name')->get(),
            'portfolio' => $this->roundedPortfolio($portfolio),
            'period' => $this->periodData($period, $filters, $totalAmountDue, $totalAmountPaid),
            'receivables' => $this->roundedBuckets($receivables),
            'collections' => $this->roundedBuckets($collections),
            'by_item_type' => $this->roundedItemTypes($accountsByItemType),
            'monthly_trend' => array_values($monthlyTrend),
        ];
    }

    private function pnvOf(InstallmentOrder $order): float
    {
        if ($order->promisory_note_value_interest < 0.01) {
            return (float) $order->loan_contract_price - (float) $order->down_payment;
        }

        return ((float) $order->promisory_note_value * (float) $order->promisory_note_value_interest)
            + (float) $order->promisory_note_value_interest_additional_charge;
    }

    private function emptyPortfolio(): array
    {
        return [
            'total_pnv' => 0,
            'total_active_pnv' => 0,
            'total_completed_pnv' => 0,
            'total_defaulted_pnv' => 0,
            'active_accounts' => 0,
            'completed_accounts' => 0,
            'defaulted_accounts' => 0,
            'total_accounts' => 0,
            'total_lcp' => 0,
            'total_down_payment' => 0,
            'collectible_balance' => 0,
            'defaulted_balance' => 0,
            'total_remaining_balance' => 0,
            'total_rebate' => 0,
            'total_advanced_payment' => 0,
        ];
    }

    private function emptyAgingBuckets(): array
    {
        return ['current' => 0, '30_days' => 0, '60_days' => 0, '90_days' => 0, '90_plus_days' => 0, 'total' => 0];
    }

    private function emptyItemTypes(): array
    {
        return [
            'furniture' => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
            'appliances' => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
            'gadgets' => ['count' => 0, 'pnv' => 0, 'expected' => 0, 'collected' => 0, 'balance' => 0],
        ];
    }

    private function monthlyTrend(): array
    {
        $trend = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $trend[$month->format('Y-m')] = [
                'month' => $month->format('M Y'),
                'expected' => 0,
                'collected' => 0,
            ];
        }

        return $trend;
    }

    private function addPortfolioStatus(array &$portfolio, InstallmentOrder $order, float $pnv, bool $isActive): void
    {
        if ($isActive) {
            $portfolio['total_active_pnv'] += $pnv;
            $portfolio['active_accounts']++;

            return;
        }

        if ($order->is_completed) {
            $portfolio['total_completed_pnv'] += $pnv;
            $portfolio['completed_accounts']++;

            return;
        }

        if ($order->is_defaulted) {
            $portfolio['total_defaulted_pnv'] += $pnv;
            $portfolio['defaulted_accounts']++;
        }
    }

    private function addPeriodExpected(array &$period, array &$itemTypes, string $itemType, $payment, Carbon $dueDate, Carbon $dateFrom, Carbon $dateTo): void
    {
        if (! $dueDate->between($dateFrom, $dateTo)) {
            return;
        }

        $period['expected'] += $payment->amount_due;
        $itemTypes[$itemType]['expected'] += $payment->amount_due;
    }

    private function addPeriodCollected(array &$period, array &$itemTypes, string $itemType, $payment, Carbon $dateFrom, Carbon $dateTo): void
    {
        if (! $payment->paid_date || $payment->amount_paid <= 0) {
            return;
        }

        $paidDate = Carbon::parse($payment->paid_date);

        if (! $paidDate->between($dateFrom, $dateTo)) {
            return;
        }

        $period['actual_collected'] += $payment->amount_paid;
        $itemTypes[$itemType]['collected'] += $payment->amount_paid;
    }

    private function addMonthlyTrend(array &$monthlyTrend, $payment, Carbon $dueDate): void
    {
        $dueDateKey = $dueDate->format('Y-m');

        if (! isset($monthlyTrend[$dueDateKey])) {
            return;
        }

        $monthlyTrend[$dueDateKey]['expected'] += $payment->amount_due;
        $monthlyTrend[$dueDateKey]['collected'] += $payment->amount_paid;
    }

    private function addReceivable(array &$receivables, array &$itemTypes, string $itemType, $payment, int $daysOverdue): void
    {
        $balance = $payment->amount_due - $payment->amount_paid;

        if ($balance <= 0) {
            return;
        }

        $bucket = $this->agingBucket($daysOverdue);
        $receivables[$bucket] += $balance;
        $receivables['total'] += $balance;
        $itemTypes[$itemType]['balance'] += $balance;
    }

    private function addCollection(array &$collections, $payment, int $daysOverdue): void
    {
        if ($payment->amount_paid <= 0) {
            return;
        }

        $bucket = $this->agingBucket($daysOverdue);
        $collections[$bucket] += $payment->amount_paid;
        $collections['total'] += $payment->amount_paid;
    }

    private function agingBucket(int $daysOverdue): string
    {
        if ($daysOverdue >= 0) {
            return 'current';
        }

        if ($daysOverdue >= -30) {
            return '30_days';
        }

        if ($daysOverdue >= -60) {
            return '60_days';
        }

        if ($daysOverdue >= -90) {
            return '90_days';
        }

        return '90_plus_days';
    }

    private function periodData(array $period, array $filters, float $totalAmountDue, float $totalAmountPaid): array
    {
        $collectionRate = $period['expected'] > 0
            ? round(($period['actual_collected'] / $period['expected']) * 100, 2)
            : 0;
        $overallCollectionRate = $totalAmountDue > 0
            ? round(($totalAmountPaid / $totalAmountDue) * 100, 2)
            : 0;
        $targetRate = 85.00;

        return [
            'date_from' => $filters['date_from'],
            'date_to' => $filters['date_to'],
            'expected' => round($period['expected'], 2),
            'actual_collected' => round($period['actual_collected'], 2),
            'uncollected' => round(max($period['expected'] - $period['actual_collected'], 0), 2),
            'collection_rate' => $collectionRate,
            'target_rate' => $targetRate,
            'variance' => round($collectionRate - $targetRate, 2),
            'overall_collection_rate' => $overallCollectionRate,
        ];
    }

    private function roundedPortfolio(array $portfolio): array
    {
        foreach ([
            'total_pnv',
            'total_active_pnv',
            'total_completed_pnv',
            'total_defaulted_pnv',
            'total_lcp',
            'total_down_payment',
            'collectible_balance',
            'defaulted_balance',
            'total_remaining_balance',
            'total_rebate',
            'total_advanced_payment',
        ] as $key) {
            $portfolio[$key] = round($portfolio[$key], 2);
        }

        return $portfolio;
    }

    private function roundedBuckets(array $buckets): array
    {
        return collect($buckets)
            ->map(fn ($amount) => round($amount, 2))
            ->all();
    }

    private function roundedItemTypes(array $itemTypes): array
    {
        foreach ($itemTypes as $type => $data) {
            foreach (['pnv', 'expected', 'collected', 'balance'] as $key) {
                $itemTypes[$type][$key] = round($data[$key], 2);
            }
        }

        return $itemTypes;
    }
}
