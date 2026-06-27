<?php

namespace App\Http\Requests\POSCreditOrders;

use Illuminate\Foundation\Http\FormRequest;

class VoidInstallmentOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'installment_order_id' => ['required'],
            'reason_for_cancellation' => ['required', 'string'],
        ];
    }
}
