<?php

namespace App\Http\Requests\Aging;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowAgingBucketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bucket' => ['required', Rule::in(['current', '1_30', '31_60', '61_90', '90_plus'])],
            'month' => ['nullable', 'date_format:Y-m'],
            'as_of_date' => ['nullable', 'date'],
            'branch_id' => ['nullable', 'string'],
            'item_type' => ['nullable', Rule::in(['all', 'appliances', 'furniture', 'gadgets'])],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
