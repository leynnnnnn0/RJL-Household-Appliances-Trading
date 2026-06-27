<?php

namespace App\Http\Requests\ExpenseRecords;

use Illuminate\Foundation\Http\FormRequest;

class UpsertExpenseRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'category' => ['required', 'in:fuel,repair,supplies,meal,emergency,other'],
            'payment_method' => ['required', 'in:cash,credit_card,debit_card,bank_transfer,e_wallet'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'receipt_path' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:10240'],
            'expense_date' => ['required', 'date'],
            'branch_id' => $this->isMethod('post')
                ? ['required']
                : ['required', 'exists:branches,id'],
        ];
    }
}
