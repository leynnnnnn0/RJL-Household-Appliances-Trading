<?php

namespace App\Http\Controllers;

use App\Http\Requests\POSCashOrders\VoidPOSCashOrderRequest;
use App\Models\Branch;
use App\Models\User;
use App\Services\POSCashOrders\POSCashOrderService;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashOrderController extends Controller
{
    public function __construct(private readonly POSCashOrderService $orders) {}

    public function index(Request $request)
    {
        return Inertia::render('POSCashOrder/Index', [
            'transactions' => $this->orders->paginate($request->all()),
            'locations' => Branch::dropdown(),
            'employees' => User::dropdown(),
        ]);
    }

    public function voidOrder(VoidPOSCashOrderRequest $request, int $id)
    {
        $this->orders->void($id, $request->validated());

        return back();
    }

    public function downloadPDF(Request $request)
    {
        $filters = $request->all();
        $orders = $this->orders->getForPdf($filters);
        $data = $this->orders->pdfData($orders, $filters);

        $pdf = Pdf::loadView('pdf.orders', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'orders_report_'.now()->format('Y-m-d_His').'.pdf';

        return $pdf->download($filename);
    }

    public function show($orderNumber)
    {
        return Inertia::render('POSCashOrder/Show', [
            'transaction' => $this->orders->findByOrderNumber($orderNumber),
        ]);
    }
}
