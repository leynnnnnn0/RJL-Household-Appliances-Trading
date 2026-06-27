<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRecords\UpdateExpenseRecordStatusRequest;
use App\Http\Requests\ExpenseRecords\UpsertExpenseRecordRequest;
use App\Models\Branch;
use App\Models\ExpenseRecord;
use App\Models\User;
use App\Services\ExpenseRecords\ExpenseRecordService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseRecordController extends Controller
{
    public function __construct(private ExpenseRecordService $expenseRecords) {}

    public function index(Request $request)
    {
        $filters = $request->only(['status', 'user_id', 'date', 'category', 'search']);

        return Inertia::render('ExpenseRecord/Index', [
            'expense_record' => $this->expenseRecords->paginateForUser(Auth::user(), $filters),
            'users' => User::dropdown(),
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('ExpenseRecord/Create', [
            'users' => User::dropdown(),
            'branches' => Branch::dropdown(),
        ]);
    }

    public function store(UpsertExpenseRecordRequest $request)
    {
        $this->expenseRecords->create($request->validated(), $request->file('receipt_path'));

        return redirect()->route('expense-record.index')
            ->with('success', 'Expense record created successfully!');
    }

    public function show(ExpenseRecord $expenseRecord)
    {
        $expenseRecord->load(['user', 'approved_by', 'branch']);

        return Inertia::render('ExpenseRecord/Show', [
            'expense_record' => $expenseRecord,
        ]);
    }

    public function edit(ExpenseRecord $expenseRecord)
    {
        $expenseRecord->load('user');

        return Inertia::render('ExpenseRecord/Edit', [
            'users' => User::dropdown(),
            'expense_record' => $expenseRecord,
            'branches' => Branch::dropdown(),
        ]);
    }

    public function update(UpsertExpenseRecordRequest $request, ExpenseRecord $expenseRecord)
    {
        $this->expenseRecords->update($expenseRecord, $request->validated(), $request->file('receipt_path'));

        return redirect()->route('expense-record.index')
            ->with('success', 'Expense record updated successfully!');
    }

    public function destroy(ExpenseRecord $expenseRecord)
    {
        $this->expenseRecords->delete($expenseRecord);

        return redirect()->route('expense-record.index')
            ->with('success', 'Expense record deleted successfully!');
    }

    public function updateStatus(UpdateExpenseRecordStatusRequest $request, ExpenseRecord $expenseRecord)
    {
        $this->expenseRecords->updateStatus($expenseRecord, $request->validated('status'), auth()->id());

        return back()->with('success', 'Status updated successfully!');
    }
}
