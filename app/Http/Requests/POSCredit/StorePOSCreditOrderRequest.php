<?php

namespace App\Http\Requests\POSCredit;

use Illuminate\Foundation\Http\FormRequest;

class StorePOSCreditOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_no_interest' => ['required', 'boolean'],
            'is_no_down_payment' => ['sometimes', 'boolean'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_first_name' => ['required', 'string'],
            'customer_last_name' => ['required'],
            'customer_address' => ['required', 'string'],
            'customer_phone_number' => ['nullable', 'string'],
            'city' => ['required', 'string'],
            'province' => ['required', 'string'],
            'zipcode' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'email' => ['nullable', 'string'],
            'customer_reference_full_name' => ['required', 'string'],
            'customer_reference_phone_number' => ['required', 'string'],
            'investigator_id' => ['required', 'exists:employees,id'],
            'home_visit_date' => ['required'],
            'is_employment_verified' => ['required'],
            'investigation_notes' => ['nullable', 'string'],
            'location_id' => ['required', 'exists:branches,id'],
            'items' => ['required', 'array'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.serial' => ['required', 'string'],
            'items.*.description' => ['required', 'string'],
            'items.*.model' => ['required', 'string'],
            'items.*.srp' => ['required', 'numeric'],
            'items.*.item_type' => ['required', 'string'],
            'free_items' => ['nullable', 'array'],
            'free_items.*.item_id' => ['required', 'exists:items,id'],
            'free_items.*.serial' => ['required', 'string'],
            'free_items.*.description' => ['required', 'string'],
            'free_items.*.model' => ['required', 'string'],
            'free_items.*.item_type' => ['required', 'string'],
            'loan_contract_price' => ['required', 'numeric'],
            'lcp_markup_rate' => ['required', 'numeric'],
            'lcp_additional_charge' => ['required', 'numeric'],
            'down_payment' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
            'reference_number' => ['nullable'],
            'promisory_note_value' => ['required', 'numeric'],
            'number_of_terms' => ['required', 'integer', 'min:1'],
            'promisory_note_value_interest' => ['required', 'numeric'],
            'promisory_note_value_interest_additional_charge' => ['required', 'numeric'],
            'receipt_number' => ['required', 'unique:installment_orders,receipt_number'],
            'transaction_date' => ['required'],
            'documents' => ['nullable'],
            'documents.*' => ['file'],
            'id_presented' => ['nullable', 'string'],
            'id_number' => ['nullable', 'string'],
            'civil_status' => ['nullable', 'string'],
            'spouse_name' => ['nullable', 'string'],
            'spouse_contact_number' => ['nullable', 'string'],
        ];
    }
}
