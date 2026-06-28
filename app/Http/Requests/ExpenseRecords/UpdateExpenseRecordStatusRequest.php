<?php

namespace App\Http\Requests\ExpenseRecords;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRecordStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:pending,approved,rejected,cancelled'],
        ];
    }
}
