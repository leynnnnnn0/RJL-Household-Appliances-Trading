<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashOrderController extends Controller
{
    public function index()
    {
        $transactions = Order::with('order_items.item', 'employee', 'location')->latest()->paginate(8);
        return Inertia::render('POSCashOrder/Index',[
            'transactions' => $transactions,
            'locations' => Location::dropdown(),
            'employees' => User::dropdown()
        ]);
    }

    public function show($orderNumber)
{
    $transaction = Order::with('order_items.item', 'employee', 'location')
        ->where('order_number', $orderNumber)
        ->firstOrFail();
    
    return Inertia::render('POSCashOrder/Show', [
        'transaction' => $transaction
    ]);
}
}
