<?php

namespace App\Http\Requests\References;

use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplier = $this->route('supplier');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Supplier::class, 'name')->ignore($supplier?->id),
            ],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
