<?php

namespace App\Http\Controllers;

use App\Services\POSCashOrderSales\POSCashOrderSalesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashOrderSalesController extends Controller
{
    public function __construct(private readonly POSCashOrderSalesService $sales) {}

    public function index(Request $request)
    {
        $filters = $this->sales->filters($request->all());
        $orders = $this->sales->orders($filters);

        return Inertia::render(
            'POSCashOrderSales/Index',
            $this->sales->dashboardData($orders, $filters)
        );
    }
}
