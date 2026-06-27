<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkPayments\StoreBulkPaymentRequest;
use App\Services\BulkPayments\BulkPaymentService;
use Inertia\Inertia;

class BulkPaymentController extends Controller
{
    public function index(BulkPaymentService $service)
    {
        return Inertia::render('BulkPayment/Index', [
            'installmentOrders' => $service->installmentOrders(),
        ]);
    }

    public function store(StoreBulkPaymentRequest $request, BulkPaymentService $service)
    {
        try {
            $successCount = $service->process($request->validated('payments'));

            return back()->with('success', "Successfully processed {$successCount} payment(s)!");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Bulk payment processing failed: '.$e->getMessage()]);
        }
    }
}
