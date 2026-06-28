<?php

namespace App\Services\POSCashOrderSales;

use App\Models\Branch;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class POSCashOrderSalesService
{
    public function filters(array $input): array
    {
        return [
            'date_from' => $input['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d'),
            'date_to' => $input['date_to'] ?? Carbon::now()->format('Y-m-d'),
            'location_id' => $input['location_id'] ?? 'all',
        ];
    }

    public function orders(array $filters): Collection
    {
        return Order::with(['branch', 'order_items.item.location', 'order_items.item.supplier', 'payments'])
            ->where('is_void', 0)
            ->when($filters['date_from'], fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'], fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->when($filters['location_id'] !== 'all', fn ($query) => $query->where('branch_id', $filters['location_id']))
            ->get();
    }

    public function dashboardData(Collection $orders, array $filters): array
    {
        $totalSales = $this->totalSales($orders);
        $totalExpense = $this->totalExpense($orders);

        return [
            'total_sales' => $totalSales,
            'total_expense' => $totalExpense,
            'total_profit' => $totalSales - $totalExpense,
            'sales_per_category' => $this->salesByCategory($orders),
            'sales_by_location' => $this->salesByLocation($orders),
            'locations' => Branch::dropdown(),
            'filters' => $filters,
        ];
    }

    private function salesByLocation(Collection $orders): array
    {
        $locations = Branch::select(['id', 'name'])
            ->get()
            ->mapWithKeys(fn (Branch $location) => [
                $location->id => [
                    'id' => $location->id,
                    'name' => $location->name,
                    'revenue' => 0,
                ],
            ])
            ->toArray();

        $orders->each(function (Order $order) use (&$locations) {
            if (isset($locations[$order->branch_id])) {
                $locations[$order->branch_id]['revenue'] += $order->total_price;
            }
        });

        return $locations;
    }

    private function totalExpense(Collection $orders): float|int
    {
        return $orders->sum(fn (Order $order) => $order->order_items->sum(
            fn ($orderItem) => $orderItem->item->unit_cost ?? 0
        ));
    }

    private function totalSales(Collection $orders): float|int
    {
        return $orders->sum(fn (Order $order) => $order->total_price);
    }

    private function salesByCategory(Collection $orders): array
    {
        $categories = [
            'appliances' => [
                'name' => 'Appliances',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-1))',
            ],
            'gadgets' => [
                'name' => 'Gadgets',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-2))',
            ],
            'furniture' => [
                'name' => 'Furniture',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-3))',
            ],
        ];

        $orders->each(function (Order $order) use (&$categories) {
            $order->order_items->each(function ($orderItem) use (&$categories) {
                $type = $orderItem->item->item_type;

                if (isset($categories[$type])) {
                    $categories[$type]['sales'] += $orderItem->sale_amount;
                }
            });
        });

        $totalSales = collect($categories)->sum('sales');

        foreach ($categories as $key => $category) {
            $categories[$key]['percentage'] = $totalSales > 0
                ? round(($category['sales'] / $totalSales) * 100, 2)
                : 0;
        }

        return $categories;
    }
}
