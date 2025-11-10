<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $data = Item::whereNull('date_out')
            ->selectRaw('item_type AS category, SUM(srp) AS srp, SUM(unit_cost) AS unitCost')
            ->groupBy('item_type')
            ->get()
            ->map(function ($row) {
                return [
                    'category'  => $row->category,
                    'srp'       => (int) $row->srp,
                    'unitCost'  => (int) $row->unitCost,
                ];
            })
            ->values();


        $srpTotal = $data->sum('srp');
        $unitCostTotal = $data->sum('unitCost');
        $customers = Customer::count();
        $users = User::count();
        $employees = Employee::count();
        $marginPercent = $unitCostTotal > 0 
            ? (($srpTotal - $unitCostTotal) / $unitCostTotal) * 100 
            : 0;


        return Inertia::render('Dashboard/Index',[
            'srpTotal' => number_format($srpTotal, 2, '.', ','),
            'unitTotalCost' => number_format($unitCostTotal, 2, '.', ','),
            'customers' => $customers,
            'users' => $users,
            'employees' => $employees,
            'marginPercent' => number_format($marginPercent),
            'potentialProfit' => number_format($srpTotal -$unitCostTotal, 2, '.', ','),
            'inventoryData' => $data->toArray()
        ]);
    }
}
