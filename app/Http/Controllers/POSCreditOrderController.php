<?php

namespace App\Http\Controllers;

use App\Http\Requests\POSCreditOrders\AccelerateInstallmentOrderRequest;
use App\Http\Requests\POSCreditOrders\DefaultInstallmentOrderRequest;
use App\Http\Requests\POSCreditOrders\ReactivateInstallmentOrderRequest;
use App\Http\Requests\POSCreditOrders\RebateInstallmentPaymentRequest;
use App\Http\Requests\POSCreditOrders\RecordInstallmentPaymentRequest;
use App\Http\Requests\POSCreditOrders\UpdateInstallmentPaymentHistoryRequest;
use App\Http\Requests\POSCreditOrders\VoidInstallmentOrderRequest;
use App\Models\Branch;
use App\Models\User;
use App\Services\POSCreditOrders\POSCreditOrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCreditOrderController extends Controller
{
    public function __construct(private readonly POSCreditOrderService $orders) {}

    public function index(Request $request)
    {
        return Inertia::render('POSCreditOrder/Index', [
            'transactions' => $this->orders->paginate($request->all()),
            'locations' => Branch::dropdown(),
            'employees' => User::dropdown(),
        ]);
    }

    public function show($orderNumber)
    {
        $transaction = $this->orders->findByOrderNumber($orderNumber);

        return Inertia::render('POSCreditOrder/Show', [
            'transaction' => $transaction,
            'paymentHistory' => $this->orders->paymentHistory($transaction),
            'branches' => Branch::dropdown(),
        ]);
    }

    public function recordPayment(RecordInstallmentPaymentRequest $request)
    {
        $this->orders->recordPayment($request->validated());

        return back()->with('success', 'Payment recorded successfully!');
    }

    public function void(VoidInstallmentOrderRequest $request, int $id)
    {
        $this->orders->void($id, $request->validated());

        return back()->with('success', 'Order Voided');
    }

    public function default(DefaultInstallmentOrderRequest $request, int $id)
    {
        $this->orders->default($id, $request->validated());

        return back()->with('success', 'Order Voided');
    }

    public function reactivate(ReactivateInstallmentOrderRequest $request, int $id)
    {
        $this->orders->reactivate($id, $request->validated());

        return back()->with('success', 'Order Reactivated');
    }

    public function rebate(RebateInstallmentPaymentRequest $request)
    {
        $this->orders->rebate($request->validated());

        return back()->with('success', 'Rebate added successfully.');
    }

    public function accelerate(AccelerateInstallmentOrderRequest $request)
    {
        $this->orders->accelerate($request->validated());

        return back()->with('success', 'Loan accelerated successfully!');
    }

    public function updatePaymentHistory(UpdateInstallmentPaymentHistoryRequest $request, int $historyId)
    {
        $this->orders->updatePaymentHistory($historyId, $request->validated());

        return back()->with('success', 'Payment record updated successfully!');
    }

    public function deletePaymentHistory(Request $request, int $historyId)
    {
        $this->orders->deletePaymentHistory($historyId);

        return back()->with('success', 'Payment record deleted successfully!');
    }

    public function printPaymentSchedule(int $id)
    {
        $order = $this->orders->findForPaymentSchedule($id);

        $pdf = Pdf::loadView(
            'pdf.installment-payment-schedule',
            $this->orders->paymentScheduleData($order)
        )->setPaper('a4', 'portrait');

        return $pdf->stream("payment-schedule-{$order->order_number}.pdf");
    }
}
