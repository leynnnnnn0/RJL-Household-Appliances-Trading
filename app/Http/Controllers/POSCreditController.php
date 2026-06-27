<?php

namespace App\Http\Controllers;

use App\Http\Requests\POSCredit\StorePOSCreditOrderRequest;
use App\Models\Branch;
use App\Models\Employee;
use App\Services\POSCredit\POSCreditService;
use Exception;
use Inertia\Inertia;

class POSCreditController extends Controller
{
    public function __construct(private POSCreditService $posCredit) {}

    public function index()
    {
        return Inertia::render('POSCredit/Index', [
            'employees' => Employee::dropdown(),
            'locations' => Branch::dropdown(),
            'transactions' => $this->posCredit->todayTransactionsForCurrentUser(),
        ]);
    }

    public function store(StorePOSCreditOrderRequest $request)
    {
        try {
            $this->posCredit->createOrder($request->validated(), $request->file('documents', []));
        } catch (Exception $e) {
            return back()->withErrors([
                'message' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Created Successfully');
    }
}
