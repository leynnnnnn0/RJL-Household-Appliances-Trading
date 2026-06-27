<?php

namespace App\Http\Requests\Items;

use Illuminate\Foundation\Http\FormRequest;

class MoveItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['required', 'exists:locations,id'],
            'remarks' => ['required', 'string', 'max:1000'],
        ];
    }
}
