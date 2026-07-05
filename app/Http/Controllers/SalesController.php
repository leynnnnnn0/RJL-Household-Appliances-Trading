<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sales\IndexSalesRequest;
use App\Services\Sales\SalesReportService;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function __construct(private readonly SalesReportService $sales) {}

    public function index(IndexSalesRequest $request)
    {
        return Inertia::render('Sales/Index', $this->sales->dashboard($request->validated()));
    }
}
