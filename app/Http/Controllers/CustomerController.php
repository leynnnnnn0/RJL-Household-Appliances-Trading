<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with(['orders', 'installment_orders', 'customer_reference', 'investigation_detail']);

        $search = $request->input('search');
        $query->when($search, fn($q) => $q->whereAny(['first_name', 'last_name'], 'like', "%{$search}%"));

        $customers = $query->latest()->paginate(8);

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'filters' => ['search' => $search]
        ]);
    }

    public function show($id) {
        $customer = Customer::with(['orders.order_items.item', 'installment_orders.installment_order_item.item', 'customer_reference', 'investigation_detail'])->findOrFail($id);

        return Inertia::render('Customer/Show', [
            'customer' => $customer
        ]);
    }
}
