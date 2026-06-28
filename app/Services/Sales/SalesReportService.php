<?php

namespace App\Services\Sales;

use App\Models\Branch;
use App\Models\InstallmentOrder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SalesReportService
{
    public const BUCKETS = [
        'current' => 'Current',
        '1_30' => '1-30 Days Aging',
        '31_60' => '31-60 Days Aging',
        '61_90' => '61-90 Days Aging',
        '90_plus' => '90+ Days Aging',
    ];

    public function filters(array $input): array
    {
        $asOfDate = match (true) {
            isset($input['as_of_date']) => Carbon::parse($input['as_of_date']),
            isset($input['month']) => Carbon::createFromFormat('Y-m-d', $input['month'].'-07'),
            default => now()->day(7),
        };
        $month = $asOfDate->format('Y-m');

        return [
            'month' => $month,
            'branch_id' => ($input['branch_id'] ?? 'all') ?: 'all',
            'item_type' => ($input['item_type'] ?? 'all') ?: 'all',
            'as_of_date' => $asOfDate->toDateString(),
        ];
    }

    public function dashboard(array $input): array
    {
        $filters = $this->filters($input);
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows($orders, Carbon::parse($filters['as_of_date']));
        $tables = $this->bucketTables($agingRows);

        return [
            'filters' => $filters,
            'branches' => Branch::select('id', 'name')->orderBy('name')->get(),
            'bucketLabels' => self::BUCKETS,
            'summary' => $this->summary($agingRows, $orders),
            'agingTables' => collect($tables)
                ->map(fn (array $table) => array_merge($table, ['rows' => array_slice($table['rows'], 0, 10)]))
                ->all(),
            'analytics' => $this->analytics($filters),
        ];
    }

    public function bucketPage(array $input): array
    {
        $filters = $this->filters($input);
        $bucket = $input['bucket'];
        $orders = $this->orders($filters);
        $table = $this->bucketTables($this->agingRows($orders, Carbon::parse($filters['as_of_date'])))[$bucket];

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabel' => self::BUCKETS[$bucket],
            'branches' => Branch::select('id', 'name')->orderBy('name')->get(),
            'table' => $table,
        ];
    }

    public function pdfData(array $input): array
    {
        $filters = $this->filters($input);
        $orders = $this->orders($filters);
        $tables = $this->bucketTables($this->agingRows($orders, Carbon::parse($filters['as_of_date'])));
        $bucket = $input['bucket'] ?? 'all';

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabels' => self::BUCKETS,
            'tables' => $bucket === 'all' ? $tables : [$bucket => $tables[$bucket]],
            'generatedAt' => now()->format('F d, Y h:i A'),
        ];
    }

    private function orders(array $filters): Collection
    {
        return InstallmentOrder::query()
            ->with([
                'branch',
                'customer',
                'installment_order_items.item',
                'installment_order_payments.installment_order_payment_history',
            ])
            ->where('is_voided', false)
            ->whereDate('transaction_date', '<=', $filters['as_of_date'])
            ->when($filters['branch_id'] !== 'all', fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['item_type'] !== 'all', fn (Builder $query) => $query->whereHas(
                'installment_order_items.item',
                fn (Builder $itemQuery) => $itemQuery->where('item_type', $filters['item_type'])
            ))
            ->get();
    }

    private function agingRows(Collection $orders, Carbon $asOfDate): Collection
    {
        return $orders
            ->flatMap(fn (InstallmentOrder $order) => $this->agingRowsForOrder($order, $asOfDate))
            ->groupBy(fn (array $row) => $row['order_id'].'-'.$row['bucket'])
            ->map(function (Collection $rows) {
                $first = $rows->first();

                return array_merge($first, [
                    'amount_due' => round($rows->sum('amount_due'), 2),
                    'amount_paid' => round($rows->sum('amount_paid'), 2),
                    'remaining_balance' => round($rows->sum('remaining_balance'), 2),
                    'installments_count' => $rows->count(),
                ]);
            })
            ->values();
    }

    private function agingRowsForOrder(InstallmentOrder $order, Carbon $asOfDate): Collection
    {
        $primaryItem = $order->installment_order_items->first()?->item;
        $models = $order->installment_order_items
            ->map(fn ($orderItem) => $orderItem->item?->model)
            ->filter()
            ->implode(', ');

        return $order->installment_order_payments
            ->filter(fn ($payment) => Carbon::parse($payment->due_date)->lte($asOfDate))
            ->map(function ($payment) use ($order, $asOfDate, $primaryItem, $models) {
                $paid = (float) $payment->amount_paid + (float) $payment->rebate_amount;
                $remaining = max((float) $payment->amount_due - $paid, 0);

                if ($remaining <= 0) {
                    return null;
                }

                $dueDate = Carbon::parse($payment->due_date);

                return [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer->full_name,
                    'address' => $order->customer->address,
                    'branch' => $order->branch?->name ?? 'N/A',
                    'item_type' => $primaryItem?->item_type ?? 'Unclassified',
                    'model' => $models ?: 'N/A',
                    'term' => $order->number_of_terms,
                    'date_released' => Carbon::parse($order->transaction_date)->format('M d, Y'),
                    'due_date' => $dueDate->format('M d, Y'),
                    'days_overdue' => max($dueDate->diffInDays($asOfDate, false), 0),
                    'bucket' => $this->bucketFor($dueDate, $asOfDate),
                    'monthly_installment' => round((float) $payment->amount_due, 2),
                    'pnv' => round((float) $this->pnvOf($order), 2),
                    'amount_due' => round((float) $payment->amount_due, 2),
                    'amount_paid' => round((float) $payment->amount_paid, 2),
                    'remaining_balance' => round($remaining, 2),
                ];
            })
            ->filter()
            ->values();
    }

    private function bucketTables(Collection $agingRows): array
    {
        return collect(self::BUCKETS)
            ->mapWithKeys(function (string $label, string $bucket) use ($agingRows) {
                $rows = $agingRows
                    ->where('bucket', $bucket)
                    ->sortByDesc('remaining_balance')
                    ->values()
                    ->all();

                return [$bucket => [
                    'label' => $label,
                    'total_accounts' => count($rows),
                    'total_due' => round(collect($rows)->sum('amount_due'), 2),
                    'total_paid' => round(collect($rows)->sum('amount_paid'), 2),
                    'total_balance' => round(collect($rows)->sum('remaining_balance'), 2),
                    'rows' => $rows,
                ]];
            })
            ->all();
    }

    private function summary(Collection $agingRows, Collection $orders): array
    {
        $remaining = round($agingRows->sum('remaining_balance'), 2);
        $activeOrders = $orders->where('is_completed', false)->where('is_defaulted', false);
        $activePnv = round($activeOrders->sum(fn (InstallmentOrder $order) => $this->pnvOf($order)), 2);

        return [
            'accounts' => $agingRows->pluck('order_id')->unique()->count(),
            'active_accounts' => $activeOrders->count(),
            'pnv' => $activePnv,
            'remaining_balance' => $remaining,
            'risk_balance' => round($agingRows->whereIn('bucket', ['61_90', '90_plus'])->sum('remaining_balance'), 2),
            'collection_rate' => $activePnv > 0 ? round((($activePnv - $remaining) / $activePnv) * 100, 2) : 0,
        ];
    }

    private function analytics(array $filters): array
    {
        $from = Carbon::parse($filters['as_of_date'])->copy()->subMonths(11)->startOfMonth();
        $to = Carbon::parse($filters['as_of_date'])->endOfMonth();

        $orders = InstallmentOrder::with(['installment_order_items.item', 'installment_order_payments'])
            ->where('is_voided', false)
            ->whereBetween('transaction_date', [$from, $to])
            ->when($filters['branch_id'] !== 'all', fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['item_type'] !== 'all', fn (Builder $query) => $query->whereHas(
                'installment_order_items.item',
                fn (Builder $itemQuery) => $itemQuery->where('item_type', $filters['item_type'])
            ))
            ->get();

        $months = collect(range(0, 11))->mapWithKeys(function (int $monthsAgo) use ($to) {
            $month = $to->copy()->startOfMonth()->subMonthsNoOverflow(11 - $monthsAgo);

            return [$month->format('Y-m') => [
                'month' => $month->format('M Y'),
                'accounts' => 0,
                'sales' => 0,
                'collections' => 0,
            ]];
        })->all();

        foreach ($orders as $order) {
            $key = Carbon::parse($order->transaction_date)->format('Y-m');

            if (! isset($months[$key])) {
                continue;
            }

            $months[$key]['accounts']++;
            $months[$key]['sales'] += $order->installment_order_items->sum('sale_amount');
            $months[$key]['collections'] += $order->installment_order_payments->sum('amount_paid');
        }

        $categoryRows = $orders
            ->flatMap(fn (InstallmentOrder $order) => $order->installment_order_items)
            ->groupBy(fn ($item) => $item->item?->item_type ?? 'unclassified')
            ->map(fn (Collection $items, string $type) => [
                'type' => ucfirst($type),
                'sales' => round($items->sum('sale_amount'), 2),
                'units' => $items->count(),
            ])
            ->sortByDesc('sales')
            ->values();

        $monthCollection = collect($months);
        $bestMonth = $monthCollection->sortByDesc('accounts')->first();
        $worstMonth = $monthCollection->filter(fn ($month) => $month['accounts'] > 0)->sortBy('accounts')->first();

        return [
            'monthly_trend' => array_values($months),
            'category_sales' => $categoryRows->all(),
            'insights' => [
                'best_month' => $bestMonth,
                'worst_month' => $worstMonth,
                'top_category' => $categoryRows->first(),
            ],
        ];
    }

    private function bucketFor(Carbon $dueDate, Carbon $asOfDate): string
    {
        $daysPastDue = $dueDate->diffInDays($asOfDate, false);

        if ($daysPastDue <= 0) {
            return 'current';
        }

        if ($daysPastDue <= 30) {
            return '1_30';
        }

        if ($daysPastDue <= 60) {
            return '31_60';
        }

        if ($daysPastDue <= 90) {
            return '61_90';
        }

        return '90_plus';
    }

    private function pnvOf(InstallmentOrder $order): float
    {
        if ((float) $order->promisory_note_value_interest < 0.01) {
            return (float) $order->loan_contract_price - (float) $order->down_payment;
        }

        return ((float) $order->promisory_note_value * (float) $order->promisory_note_value_interest)
            + (float) $order->promisory_note_value_interest_additional_charge;
    }
}
