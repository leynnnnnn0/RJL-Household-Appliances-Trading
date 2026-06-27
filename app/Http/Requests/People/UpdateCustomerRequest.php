<?php

namespace App\Http\Requests\People;

use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customer = $this->route('customer');

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique(Customer::class, 'email')->ignore($customer?->id),
            ],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'zipcode' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'reference_full_name' => ['required', 'string', 'max:255'],
            'reference_phone_number' => ['required', 'string', 'max:20'],
            'employee_id' => ['required', Rule::exists('employees', 'id')],
            'home_visit_date' => ['required', 'date'],
            'is_employment_verified' => ['required', 'boolean'],
            'investigation_notes' => ['required', 'string'],
            'id_presented' => ['nullable', 'string', 'max:255'],
            'id_number' => ['nullable', 'string', 'max:255'],
            'civil_status' => ['nullable', 'string', 'max:255'],
            'spouse_name' => ['nullable', 'string', 'max:255'],
            'spouse_contact_number' => ['nullable', 'string', 'max:255'],
            'new_documents' => ['nullable', 'array'],
            'new_documents.*' => ['file', 'mimes:png,jpg,jpeg,pdf', 'max:10240'],
        ];
    }
}
