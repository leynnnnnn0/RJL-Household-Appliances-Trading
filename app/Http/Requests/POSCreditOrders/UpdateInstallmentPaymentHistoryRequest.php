<?php

namespace App\Http\Requests\POSCreditOrders;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstallmentPaymentHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:cash,gcash,bank_transfer,credit_card,debit_card'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'paid_date' => ['required', 'date'],
            'collection_receipt_number' => ['required', 'string'],
            'branch_id' => ['required', 'exists:branches,id'],
        ];
    }
}
