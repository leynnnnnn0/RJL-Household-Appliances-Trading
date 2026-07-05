<?php

namespace App\Services\Sales;

use App\Models\Branch;
use App\Models\InstallmentOrder;
use App\Services\Aging\AgingReportService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SalesReportService
{
    public function __construct(private readonly AgingReportService $aging) {}

    public function dashboard(array $input): array
    {
        $filters = $this->aging->filters($input);

        return [
            'filters' => $filters,
            'branches' => Branch::select('id', 'name')->orderBy('name')->get(),
            'summary' => $this->aging->summary($filters),
            'analytics' => $this->analytics($filters),
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
}
