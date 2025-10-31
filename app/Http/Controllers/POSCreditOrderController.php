<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrder;
use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCreditOrderController extends Controller
{
     public function index(Request $request)
{
    $query = InstallmentOrder::with('user', 'location')->latest();


    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where('order_number', 'like', "%{$search}%");
    }

    if ($request->filled('date_from')) {
        $query->whereDate('transaction_date', '>=', $request->input('date_from'));
    }

    if ($request->filled('date_to')) {
        $query->whereDate('transaction_date', '<=', $request->input('date_to'));
    }

    if ($request->filled('location_id') && $request->location_id !== 'all') {
        $query->where('location_id', $request->location_id);
    }

    if ($request->filled('user_id') && $request->employee_id !== 'all') {
        $query->where('user_id', $request->employee_id);
    }

    if ($request->filled('status') && $request->status !== 'all') {
        $query->when($request->status === '0', fn($q) => $q->where('is_voided', false))
              ->when($request->status === '1', fn($q) => $q->where('is_voided', true));
    }

    $transactions = $query->paginate(8)->withQueryString();

    return Inertia::render('POSCreditOrder/Index', [
        'transactions' => $transactions,
        'locations' => Location::dropdown(),
        'employees' => User::dropdown(),
    ]);
}
    

    public function show($order_number){
        $transction = InstallmentOrder::with(['customer', 'location', 'user', 'voider', 'installment_order_item', 'installment_order_payments'])
        ->where('order_number', $order_number)->firstOrFail();

        return Inertia::render('POSCreditOrder/Show', [
            'transaction' => $transction
        ]);
    }
}
