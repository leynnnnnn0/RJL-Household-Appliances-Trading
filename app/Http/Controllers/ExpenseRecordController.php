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

    public function create()
    {
        $users = User::dropdown();
        
        return Inertia::render('ExpenseRecord/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|in:fuel,repair,supplies,meal,emergency,other',
            'payment_method' => 'required|in:cash,credit_card,debit_card,bank_transfer,e_wallet',
            'reference_number' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'receipt_path' => 'nullable|image|mimes:jpeg,png,jpg|max:10240', // 10MB max
        ]);

        // Handle image upload
        if ($request->hasFile('receipt_path')) {
            $image = $request->file('receipt_path');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('receipts', $imageName, 'public');
            $validated['receipt_path'] = $imagePath;
        }

        // Set default status
        $validated['status'] = 'pending';

        ExpenseRecord::create($validated);

        return redirect()->route('expense-record.index')
            ->with('success', 'Expense record created successfully!');
    }
}