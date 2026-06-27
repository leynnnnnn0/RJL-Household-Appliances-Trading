<?php

namespace App\Http\Controllers;

use App\Http\Requests\POSCash\StorePOSCashOrderRequest;
use App\Models\Branch;
use App\Models\User;
use App\Services\POSCash\POSCashService;
use Exception;
use Inertia\Inertia;

class POSCashController extends Controller
{
    public function __construct(private POSCashService $posCash) {}

    public function index()
    {
        return Inertia::render('POSCash/Index', [
            'locations' => Branch::dropdown(),
            'employees' => User::dropdown(),
            'transactions' => $this->posCash->todayTransactionsForCurrentUser(),
        ]);
    }

    public function store(StorePOSCashOrderRequest $request)
    {
        try {
            $this->posCash->createOrder($request->validated());
        } catch (Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }

        return response('', 200);
    }
}
