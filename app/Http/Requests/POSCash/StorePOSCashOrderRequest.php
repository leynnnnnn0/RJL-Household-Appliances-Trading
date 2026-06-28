<?php

namespace App\Http\Requests\POSCash;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePOSCashOrderRequest extends FormRequest
{
    private const PAYMENT_METHODS = [
        'Cash',
        'Gcash',
        'Bank Transfer',
        'Debit/Credit Card',
        'Home Credit/Skyro/Billease',
    ];

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
            'payment_method' => ['required_without:payments', 'string', Rule::in(self::PAYMENT_METHODS)],
            'reference_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn () => empty($this->payments) && $this->payment_method !== 'Cash'),
            ],
            'payments' => ['nullable', 'array', 'min:1'],
            'payments.*.payment_method' => ['required_with:payments', 'string', Rule::in(self::PAYMENT_METHODS)],
            'payments.*.amount' => ['required_with:payments', 'numeric', 'min:0'],
            'payments.*.reference_number' => ['nullable', 'string', 'max:255'],
            'location_id' => ['required', 'exists:branches,id'],
            'employee_id' => ['required', 'exists:users,id'],
            'orders' => ['required'],
            'total_price' => ['required', 'numeric'],
            'receipt_number' => ['required', 'unique:orders,receipt_number'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $payments = collect($this->input('payments', []));

            $payments->each(function (array $payment, int $index) use ($validator) {
                $method = $payment['payment_method'] ?? null;
                $referenceNumber = trim((string) ($payment['reference_number'] ?? ''));

                if ($method && $method !== 'Cash' && $referenceNumber === '') {
                    $validator->errors()->add(
                        "payments.{$index}.reference_number",
                        'Reference number is required for non-cash payments.'
                    );
                }
            });

            if ($payments->isEmpty()) {
                return;
            }

            $paymentTotal = round($payments->sum(fn (array $payment) => (float) ($payment['amount'] ?? 0)), 2);
            $orderTotal = round((float) $this->input('total_price', 0), 2);

            if ($paymentTotal !== $orderTotal) {
                $validator->errors()->add('payments', 'Payment total must match the order total.');
            }
        });
    }
}
