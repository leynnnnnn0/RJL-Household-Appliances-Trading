<?php

namespace App\Http\Requests\Items;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('item')?->id ?? $this->route('item');

        return [
            'item_type' => ['required', 'in:appliances,gadgets,furniture'],
            'supplier' => ['required', 'exists:suppliers,slug'],
            'location_id' => ['required', 'exists:locations,id'],
            'dr_no' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'serial' => [
                'required',
                'string',
                'max:255',
                Rule::unique('items', 'serial')->ignore($itemId),
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'srp' => ['required', 'numeric', 'min:1'],
            'unit_cost' => ['required', 'numeric', 'min:1'],
            'date_of_purchase' => ['required', 'date'],
            'date_out' => ['nullable', 'date'],
            'size' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
