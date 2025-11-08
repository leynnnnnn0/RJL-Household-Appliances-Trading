<?php
namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPayment;
use App\Models\InstallmentOrderPaymentHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BulkPaymentController extends Controller
{
    public function index()
    {
        $installmentOrders = InstallmentOrder::with(['customer'])
            ->where('is_completed', false)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer->name ?? 'N/A',
                ];
            });

        return Inertia::render('BulkPayment/Index', [
            'installmentOrders' => $installmentOrders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.installment_order_payment_id' => ['required', 'exists:installment_order_payments,id'],
            'payments.*.installment_order_id' => ['required', 'exists:installment_orders,id'],
            'payments.*.installment_number' => ['required', 'integer'],
            'payments.*.amount_due' => ['required', 'numeric', 'min:0'],
            'payments.*.amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payments.*.payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'payments.*.reference_number' => ['nullable', 'string', 'max:255'],
            'payments.*.paid_date' => ['required', 'date'],
            'payments.*.collection_receipt_number' => ['required', 'string', 'max:255']
        ]);


        DB::beginTransaction();

        try {
            $successCount = 0;
            $errors = [];

            foreach ($validated['payments'] as $index => $paymentData) {
                try {
                    $this->processPayment($paymentData);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return back()->withErrors([
                    'error' => 'Some payments failed to process',
                    'details' => $errors
                ]);
            }

            DB::commit();

            return back()->with('success', "Successfully processed {$successCount} payment(s)!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Bulk payment processing failed: ' . $e->getMessage()]);
        }
    }

    private function processPayment(array $paymentData)
    {
        $installmentOrder = InstallmentOrder::findOrFail($paymentData['installment_order_id']);
        $remainingPayment = $paymentData['amount_paid'];
        $currentPayment = InstallmentOrderPayment::findOrFail($paymentData['installment_order_payment_id']);

        // Start from the current installment and move forward
        $payments = $installmentOrder->installment_order_payments()
            ->whereIn('status', ['pending', 'partial'])
            ->orderBy('installment_number')
            ->get();

        foreach ($payments as $payment) {
            // Skip if no remaining payment
            if ($remainingPayment <= 0) break;

            $currentAmountPaid = $payment->amount_paid ?? 0;
            $remainingDue = ($payment->amount_due - $payment->rebate_amount) - $currentAmountPaid;

            if ($remainingPayment >= $remainingDue) {
                // Fully pay this installment
                $payment->update([
                    'amount_paid' => $payment->amount_due - $payment->rebate_amount,
                    'status' => 'paid',
                    'payment_method' => $paymentData['payment_method'],
                    'reference_number' => $paymentData['reference_number'],
                    'paid_date' => $paymentData['paid_date'],
                ]);

                // Create payment history
                InstallmentOrderPaymentHistory::create([
                    'payment_id' => $payment->id,
                    'amount' => $remainingDue,
                    'payment_method' => $paymentData['payment_method'],
                    'reference_number' => $paymentData['reference_number'],
                    'paid_date' => $paymentData['paid_date'],
                    'user_id' => Auth::id(),
                    'collection_receipt_number' => $paymentData['collection_receipt_number']
                ]);

                $remainingPayment -= $remainingDue;
            } else {
                // Partial payment for this installment
                $newTotalPaid = $currentAmountPaid + $remainingPayment;
                $status = $newTotalPaid >= $payment->amount_due - $payment->rebate_amount ? 'paid' : 'partial';

                $payment->update([
                    'amount_paid' => $newTotalPaid,
                    'status' => $status,
                    'payment_method' => $paymentData['payment_method'],
                    'reference_number' => $paymentData['reference_number'],
                    'paid_date' => $paymentData['paid_date'],
                ]);

                InstallmentOrderPaymentHistory::create([
                    'payment_id' => $payment->id,
                    'amount' => $remainingPayment,
                    'payment_method' => $paymentData['payment_method'],
                    'reference_number' => $paymentData['reference_number'],
                    'paid_date' => $paymentData['paid_date'],
                    'user_id' => Auth::id(),
                    'collection_receipt_number' => $paymentData['collection_receipt_number']
                ]);

                $remainingPayment = 0;
            }
        }

        // Mark order as completed if all payments are paid
        $unpaidCount = $installmentOrder->installment_order_payments()
            ->where('status', '!=', 'paid')
            ->count();

        if ($unpaidCount === 0) {
            $installmentOrder->update(['is_completed' => true]);
        }
    }
}