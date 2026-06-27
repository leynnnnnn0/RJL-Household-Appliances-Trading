<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Services\References\BranchService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use RuntimeException;

class BranchController extends Controller
{
    public function __construct(private BranchService $branches) {}

    public function index(Request $request)
    {
        return Inertia::render('Branch/Index', [
            'branches' => $this->branches->paginate($request->input('search')),
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->branches->create($this->validatedData($request));

        return redirect()->back()->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, Branch $branch)
    {
        $this->branches->update($branch, $this->validatedData($request, $branch));

        return redirect()->back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        try {
            $this->branches->delete($branch);

            return redirect()->back()->with('success', 'Branch deleted successfully.');
        } catch (RuntimeException $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function validatedData(Request $request, ?Branch $branch = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('branches', 'name')->ignore($branch?->id),
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
