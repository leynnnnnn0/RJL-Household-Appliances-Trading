<?php

namespace App\Http\Controllers;

use App\Http\Requests\References\UpsertSupplierRequest;
use App\Models\Supplier;
use App\Services\References\SupplierService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $suppliers) {}

    public function index(Request $request)
    {
        return Inertia::render('Supplier/Index', [
            'suppliers' => $this->suppliers->paginate($request->input('search')),
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(UpsertSupplierRequest $request)
    {
        $this->suppliers->create($request->validated());

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(UpsertSupplierRequest $request, Supplier $supplier)
    {
        $this->suppliers->update($supplier, $request->validated());

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        try {
            $this->suppliers->delete($supplier);

            return redirect()->back()->with('success', 'Supplier deleted successfully.');
        } catch (RuntimeException $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
