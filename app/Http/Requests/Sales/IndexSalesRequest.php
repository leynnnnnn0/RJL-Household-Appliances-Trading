<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexSalesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'as_of_date' => ['nullable', 'date'],
            'branch_id' => ['nullable', 'string'],
            'item_type' => ['nullable', Rule::in(['all', 'appliances', 'furniture', 'gadgets'])],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
