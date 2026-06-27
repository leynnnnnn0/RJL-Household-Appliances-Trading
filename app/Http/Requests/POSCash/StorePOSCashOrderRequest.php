<?php

namespace App\Http\Requests\POSCash;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePOSCashOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string'],
            'province' => ['required', 'string'],
            'zipcode' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'email' => ['nullable', 'string'],
            'existing_customer_id' => ['nullable', 'numeric'],
            'phone' => ['nullable', 'regex:/^09\d{9}$/'],
            'payment_method' => ['required', 'string', 'in:Cash,Gcash,Bank Transfer,Debit/Credit Card,Home Credit/Skyro/Billease'],
            'reference_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn () => $this->payment_method !== 'Cash'),
            ],
            'location_id' => ['required', 'exists:branches,id'],
            'employee_id' => ['required', 'exists:users,id'],
            'orders' => ['required'],
            'total_price' => ['required', 'numeric'],
            'receipt_number' => ['required', 'unique:orders,receipt_number'],
        ];
    }
}
