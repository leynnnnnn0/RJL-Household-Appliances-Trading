<?php

namespace App\Http\Requests\POSCreditOrders;

use Illuminate\Foundation\Http\FormRequest;

class RebateInstallmentPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'installment_order_payment_id' => ['required'],
            'rebate_amount' => ['required', 'numeric', 'min:0'],
            'rebate_reason' => ['required', 'string'],
        ];
    }
}
