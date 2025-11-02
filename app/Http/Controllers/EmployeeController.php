<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::latest()->paginate(8);
        return Inertia::render('Employee/Index',[
            'employees' => $employees
        ]);
    }
}
