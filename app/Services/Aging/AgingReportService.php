<?php

namespace App\Services\Aging;

use App\Models\Branch;
use App\Models\InstallmentOrder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AgingReportService
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
            default => now()->addMonth()->day(7),
        };

        return [
            'month' => $asOfDate->format('Y-m'),
            'branch_id' => ($input['branch_id'] ?? 'all') ?: 'all',
            'item_type' => ($input['item_type'] ?? 'all') ?: 'all',
            'as_of_date' => $asOfDate->toDateString(),
            'search' => trim($input['search'] ?? ''),
        ];
    }

    public function index(array $input): array
    {
        $filters = $this->filters($input);
        $tables = $this->bucketTablesForFilters($filters);

        return [
            'filters' => $filters,
            'branches' => $this->branches(),
            'bucketLabels' => self::BUCKETS,
            'agingTables' => collect($tables)
                ->map(fn (array $table) => array_merge($table, ['rows' => array_slice($table['rows'], 0, 10)]))
                ->all(),
        ];
    }

    public function bucketPage(array $input): array
    {
        $filters = $this->filters($input);
        $bucket = $input['bucket'];
        $table = $this->bucketTablesForFilters($filters)[$bucket];

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabel' => self::BUCKETS[$bucket],
            'branches' => $this->branches(),
            'table' => $table,
        ];
    }

    public function pdfData(array $input): array
    {
        $filters = $this->filters($input);
        $tables = $this->bucketTablesForFilters($filters);
        $bucket = $input['bucket'] ?? 'all';

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabels' => self::BUCKETS,
            'tables' => $bucket === 'all' ? $tables : [$bucket => $tables[$bucket]],
            'generatedAt' => now()->format('F d, Y h:i A'),
        ];
    }

    public function summary(array $filters): array
    {
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows($orders, Carbon::parse($filters['as_of_date']));
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

    private function branches(): Collection
    {
        return Branch::select('id', 'name')->orderBy('name')->get();
    }

    private function bucketTablesForFilters(array $filters): array
    {
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows($orders, Carbon::parse($filters['as_of_date']));

        return $this->bucketTables($agingRows);
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
            ->when($filters['search'] !== '', fn (Builder $query) => $query->whereHas(
                'customer',
                fn (Builder $customerQuery) => $customerQuery
                    ->where('first_name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('last_name', 'like', '%'.$filters['search'].'%')
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
