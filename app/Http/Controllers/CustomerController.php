<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Employee;
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

    public function show($id)
    {
        $customer = Customer::with(['orders.order_items.item', 'installment_orders.installment_order_item.item', 'customer_reference', 'investigation_detail'])->findOrFail($id);

        return Inertia::render('Customer/Show', [
            'customer' => $customer
        ]);
    }

    public function edit($id)
    {
        $customer = Customer::with(['customer_reference', 'investigation_detail'])->findOrFail($id);

        return Inertia::render('Customer/Edit', [
            'customer' => $customer,
            'employees' => Employee::dropdown(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        // Validate the request
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:customers,email,' . $customer->id,
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'zipcode' => 'nullable|string|max:20',
            'country' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'reference_full_name' => 'required|string|max:255',
            'reference_phone_number' => 'required|string|max:20',
            'employee_id' => 'required|string|max:255',
            'home_visit_date' => 'required|date',
            'is_employment_verified' => 'required|boolean',
            'investigation_notes' => 'required|string',
        ]);

        // Update customer
        $customer->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'province' => $validated['province'],
            'zipcode' => $validated['zipcode'],
            'country' => $validated['country'],
            'phone_number' => $validated['phone_number'],
        ]);

        // Update or create customer reference
        $customer->customer_reference()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'full_name' => $validated['reference_full_name'],
                'phone_number' => $validated['reference_phone_number'],
            ]
        );

        // Update or create investigation detail
        $customer->investigation_detail()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'employee_id' => $validated['employee_id'],
                'home_visit_date' => $validated['home_visit_date'],
                'is_employment_verified' => $validated['is_employment_verified'],
                'investigation_notes' => $validated['investigation_notes'],
            ]
        );

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully!');
    }
}
