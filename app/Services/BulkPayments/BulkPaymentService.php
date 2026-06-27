<?php

namespace App\Services\BulkPayments;

use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPaymentHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BulkPaymentService
{
    public function installmentOrders()
    {
        return InstallmentOrder::with(['customer'])
            ->where('is_completed', false)
            ->get()
            ->map(fn (InstallmentOrder $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer->full_name ?? 'N/A',
            ]);
    }

    public function process(array $payments): int
    {
        return DB::transaction(function () use ($payments) {
            $successCount = 0;

            foreach ($payments as $paymentData) {
                $this->processPayment($paymentData);
                $successCount++;
            }

            return $successCount;
        });
    }

    private function processPayment(array $paymentData): void
    {
        $installmentOrder = InstallmentOrder::with('installment_order_payments')
            ->findOrFail($paymentData['installment_order_id']);
        $remainingPayment = $paymentData['amount_paid'];

        $payments = $installmentOrder->installment_order_payments()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('installment_number')
            ->get();

        foreach ($payments as $payment) {
            if ($remainingPayment <= 0) {
                break;
            }

            $currentAmountPaid = $payment->amount_paid ?? 0;
            $remainingDue = ($payment->amount_due - $payment->rebate_amount) - $currentAmountPaid;

            if ($remainingPayment >= $remainingDue) {
                $payment->update([
                    'amount_paid' => $payment->amount_due - $payment->rebate_amount,
                    'status' => 'paid',
                    'payment_method' => $paymentData['payment_method'],
                    'reference_number' => $paymentData['reference_number'],
                    'paid_date' => $paymentData['paid_date'],
                ]);

                $this->recordHistory($payment->id, $remainingDue, $paymentData);

                $remainingPayment -= $remainingDue;

                continue;
            }

            $newTotalPaid = $currentAmountPaid + $remainingPayment;
            $status = $newTotalPaid >= $payment->amount_due - $payment->rebate_amount ? 'paid' : 'partial';

            $payment->update([
                'amount_paid' => $newTotalPaid,
                'status' => $status,
                'payment_method' => $paymentData['payment_method'],
                'reference_number' => $paymentData['reference_number'],
                'paid_date' => $paymentData['paid_date'],
            ]);

            $this->recordHistory($payment->id, $remainingPayment, $paymentData);

            $remainingPayment = 0;
        }

        $unpaidCount = $installmentOrder->installment_order_payments()
            ->where('status', '!=', 'paid')
            ->count();

        if ($unpaidCount === 0) {
            $installmentOrder->update(['is_completed' => true]);
        }
    }

    private function recordHistory(int $paymentId, float $amount, array $paymentData): void
    {
        InstallmentOrderPaymentHistory::create([
            'payment_id' => $paymentId,
            'amount' => $amount,
            'payment_method' => $paymentData['payment_method'],
            'reference_number' => $paymentData['reference_number'],
            'paid_date' => $paymentData['paid_date'],
            'user_id' => Auth::id(),
            'collection_receipt_number' => $paymentData['collection_receipt_number'],
        ]);
    }
}
