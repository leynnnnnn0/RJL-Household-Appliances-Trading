<?php

namespace App\Http\Controllers;

use App\Http\Requests\POSCreditOrderSales\IndexPOSCreditOrderSalesRequest;
use App\Services\POSCreditOrderSales\POSCreditOrderSalesService;
use Inertia\Inertia;

class POSCreditOrderSalesController extends Controller
{
    public function index(IndexPOSCreditOrderSalesRequest $request, POSCreditOrderSalesService $service)
    {
        $filters = $service->filters($request->validated());
        $orders = $service->orders($filters);

        return Inertia::render('POSCreditOrderSales/Index', $service->dashboardData($orders, $filters));
    }
}
