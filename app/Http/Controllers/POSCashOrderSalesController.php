<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Location;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class POSCashOrderSalesController extends Controller
{
    public function index(Request $request)
    {

        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        $locationId = $request->input('location_id', 'all');

        $query = Order::with(['branch', 'order_items.item.location', 'order_items.item.supplier'])
            ->where('is_void', 0);


        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($locationId !== 'all') {
            $query->where('branch_id', $locationId);
        }

        $orders = $query->get();

        $total_sales = $this->getTotalSales($orders);
        $total_expense = $this->getTotalExpense($orders);
        $total_profit = $total_sales - $total_expense;

        return Inertia::render('POSCashOrderSales/Index', [
            'total_sales' => $total_sales,
            'total_expense' => $total_expense,
            'total_profit' => $total_profit,
            'sales_per_category' => $this->getSalesByCategoryData($orders),
            'sales_by_location' => $this->getSalesByLocation($orders),
            'locations' => Branch::dropdown(),
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'location_id' => $locationId,
            ]
        ]);
    }

    public function getSalesByLocation($orders)
    {
        $locations = Branch::select(['id', 'name'])
            ->get()
            ->mapWithKeys(function ($location) {
                return [
                    $location->id => [
                        'id' => $location->id,
                        'name' => $location->name,
                        'revenue' => 0,
                    ]
                ];
            })
            ->toArray();

        $orders->each(function ($order) use (&$locations) {
            if (isset($locations[$order->branch_id])) {
                $locations[$order->branch_id]['revenue'] += $order->total_price;
            }
        });

        return $locations;
    }

    public function getTotalExpense($orders)
    {
        return $orders->sum(function ($order) {
            return $order->order_items->sum(function ($orderItem) {
                return $orderItem->item->unit_cost ?? 0;
            });
        });
    }

    public function getTotalSales($orders)
    {
        return $orders->sum(function ($item) {
            return $item->total_price;
        });
    }

    public function getSalesByCategoryData($orders)
    {
        $category_types = [
            'appliances' => [
                'name' => 'Appliances',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-1))'
            ],
            'gadgets' => [
                'name' => 'Gadgets',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-2))'
            ],
            'furniture' => [
                'name' => 'Furniture',
                'sales' => 0,
                'percentage' => 0,
                'color' => 'hsl(var(--chart-3))'
            ]
        ];



        $orders->each(function ($order) use (&$category_types) {
            $order->order_items->each(function ($orderItem) use (&$category_types) {
                $type = $orderItem->item->item_type;
                if (isset($category_types[$type])) {
                    $category_types[$type]['sales'] += $orderItem->sale_amount;
                }
            });
        });

        $total_sales = collect($category_types)->sum('sales');

        foreach ($category_types as $key => $category) {
            $category_types[$key]['percentage'] = $total_sales > 0
                ? round(($category['sales'] / $total_sales) * 100, 2)
                : 0;
        }

        return $category_types;
    }
}
