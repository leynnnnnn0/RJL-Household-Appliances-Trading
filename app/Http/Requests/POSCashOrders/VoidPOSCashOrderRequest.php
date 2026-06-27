<?php

namespace App\Http\Requests\POSCashOrders;

use Illuminate\Foundation\Http\FormRequest;

class VoidPOSCashOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason_for_cancellation' => ['required', 'string'],
        ];
    }
}
