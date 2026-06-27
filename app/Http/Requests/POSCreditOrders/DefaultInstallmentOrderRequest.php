<?php

namespace App\Http\Requests\POSCreditOrders;

use Illuminate\Foundation\Http\FormRequest;

class DefaultInstallmentOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'installment_order_id' => ['required'],
            'default_reason' => ['required', 'string'],
        ];
    }
}
