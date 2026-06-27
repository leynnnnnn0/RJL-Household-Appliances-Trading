<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Services\References\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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

    public function store(Request $request)
    {
        $this->suppliers->create($this->validatedData($request));

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $this->suppliers->update($supplier, $this->validatedData($request, $supplier));

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

    private function validatedData(Request $request, ?Supplier $supplier = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('suppliers', 'name')->ignore($supplier?->id),
            ],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
