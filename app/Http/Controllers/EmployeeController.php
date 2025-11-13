<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();
        $search = $request->input('search');
        
        $query->when($search, fn($q) => $q->whereAny(['first_name', 'last_name'], 'like', "%{$search}%"));
        
        $employees = $query->latest()->paginate(8);
        
        return Inertia::render('Employee/Index', [
            'employees' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'remarks' => 'nullable|string|max:1000',
        ], [
            'first_name.required' => 'First name is required.',
            'first_name.max' => 'First name cannot exceed 255 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.max' => 'Last name cannot exceed 255 characters.',
            'remarks.max' => 'Remarks cannot exceed 1000 characters.',
        ]);

        Employee::create($validated);

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'remarks' => 'nullable|string|max:1000',
        ], [
            'first_name.required' => 'First name is required.',
            'first_name.max' => 'First name cannot exceed 255 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.max' => 'Last name cannot exceed 255 characters.',
            'remarks.max' => 'Remarks cannot exceed 1000 characters.',
        ]);

        $employee->update($validated);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->back()->with('success', 'Employee deleted successfully.');
    }
}