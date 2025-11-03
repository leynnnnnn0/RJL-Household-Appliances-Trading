<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\ExpenseRecord;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = ExpenseRecord::with('user');
        
        // Search filter
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('reference_number', 'like', '%' . $request->search . '%')
                  ->orWhere('remarks', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('first_name', 'like', '%' . $request->search . '%')
                                ->orWhere('last_name', 'like', '%' . $request->search . '%');
                  });
            });
        }
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by user/employee
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }
        
        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        $users = User::dropdown();
        $expense_record = $query->latest()->paginate(8)->withQueryString();
        
        return Inertia::render('ExpenseRecord/Index', [
            'expense_record' => $expense_record,
            'users' => $users,
            'filters' => $request->only(['status', 'user_id', 'date', 'category', 'search'])
        ]);
    }
}