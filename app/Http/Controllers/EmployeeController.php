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

        return Inertia::render('Employee/Index',[
            'employees' => $employees
        ]);
    }
}
