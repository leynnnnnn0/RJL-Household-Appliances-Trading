<?php

namespace App\Http\Controllers;

use App\Http\Requests\People\UpsertEmployeeRequest;
use App\Models\Employee;
use App\Services\People\EmployeeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class EmployeeController extends Controller
{
    public function __construct(private EmployeeService $employees) {}

    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('Employee/Index', [
            'employees' => $this->employees->paginate($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(UpsertEmployeeRequest $request)
    {
        $this->employees->create($request->validated());

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    public function update(UpsertEmployeeRequest $request, Employee $employee)
    {
        $this->employees->update($employee, $request->validated());

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        try {
            $this->employees->delete($employee);
        } catch (RuntimeException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Employee deleted successfully.');
    }
}
