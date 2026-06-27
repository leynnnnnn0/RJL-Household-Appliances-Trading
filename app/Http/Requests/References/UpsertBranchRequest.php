<?php

namespace App\Http\Requests\References;

use App\Models\Branch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $branch = $this->route('branch');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Branch::class, 'name')->ignore($branch?->id),
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
