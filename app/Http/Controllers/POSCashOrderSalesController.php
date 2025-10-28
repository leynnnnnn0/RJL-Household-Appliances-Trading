<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashOrderSalesController extends Controller
{
    public function index()
    {
        return Inertia::render('POSCashOrderSales/Index');
    }
}
