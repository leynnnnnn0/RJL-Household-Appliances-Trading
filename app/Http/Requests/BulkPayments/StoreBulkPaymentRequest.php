<?php

namespace App\Http\Requests\BulkPayments;

use Illuminate\Foundation\Http\FormRequest;

class StoreBulkPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.installment_order_payment_id' => ['required', 'exists:installment_order_payments,id'],
            'payments.*.installment_order_id' => ['required', 'exists:installment_orders,id'],
            'payments.*.installment_number' => ['required', 'integer'],
            'payments.*.amount_due' => ['required', 'numeric', 'min:0'],
            'payments.*.amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payments.*.payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'payments.*.reference_number' => ['nullable', 'string', 'max:255'],
            'payments.*.paid_date' => ['required', 'date'],
            'payments.*.collection_receipt_number' => ['required', 'string', 'max:255'],
        ];
    }
}
