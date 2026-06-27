<?php

namespace App\Http\Requests\References;

use App\Models\Location;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $location = $this->route('location');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Location::class, 'name')->ignore($location?->id),
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
