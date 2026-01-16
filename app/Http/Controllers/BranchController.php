<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::latest()->paginate(8);
   
        return Inertia::render('Branch/Index', [
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
        ]);

        Branch::create($validated);

        return redirect()->back()->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
        ]);

        Branch::findOrFail($id)->update($validated);
        return redirect()->back()->with('success', 'Branch updated successfully.');
    }

    public function destroy($id)
    {
        try {
            Branch::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Branch deleted successfully.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
