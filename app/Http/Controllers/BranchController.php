<?php

namespace App\Http\Controllers;

use App\Http\Requests\References\UpsertBranchRequest;
use App\Models\Branch;
use App\Services\References\BranchService;
use Illuminate\Http\Request;
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

    public function store(UpsertBranchRequest $request)
    {
        $this->branches->create($request->validated());

        return redirect()->back()->with('success', 'Branch created successfully.');
    }

    public function update(UpsertBranchRequest $request, Branch $branch)
    {
        $this->branches->update($branch, $request->validated());

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
}
