<?php

namespace App\Http\Controllers;

use App\Http\Requests\People\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Employee;
use App\Services\People\CustomerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customers) {}

    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('Customer/Index', [
            'customers' => $this->customers->paginate($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function show(Customer $customer)
    {
        return Inertia::render('Customer/Show', [
            'customer' => $customer->load(['additional_documents', 'orders.order_items.item', 'installment_orders.installment_order_items.item', 'customer_reference', 'investigation_detail.employee']),
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customer/Edit', [
            'customer' => $customer->load(['additional_documents', 'customer_reference', 'investigation_detail']),
            'employees' => Employee::dropdown(),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $documents = $request->file('new_documents', []);

        try {
            $this->customers->update($customer, $request->validated(), is_array($documents) ? $documents : [$documents]);
        } catch (\Throwable $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update customer: '.$e->getMessage()])
                ->withInput();
        }

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer updated successfully!');
    }
}
