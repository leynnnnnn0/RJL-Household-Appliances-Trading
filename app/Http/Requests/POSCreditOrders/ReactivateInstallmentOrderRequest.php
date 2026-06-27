<?php

namespace App\Http\Requests\POSCreditOrders;

use Illuminate\Foundation\Http\FormRequest;

class ReactivateInstallmentOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'installment_order_id' => ['required'],
            'reactivation_reason' => ['required', 'string'],
        ];
    }
}
