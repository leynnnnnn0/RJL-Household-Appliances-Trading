<?php

namespace App\Http\Requests\Aging;

use App\Services\Aging\AgingReportService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowAgingDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(array_keys(AgingReportService::DETAIL_TYPES))],
            'month' => ['nullable', 'date_format:Y-m'],
            'as_of_date' => ['nullable', 'date'],
            'cutoff_start' => ['nullable', 'date'],
            'branch_id' => ['nullable', 'string'],
            'collector_id' => ['nullable', 'string'],
            'item_type' => ['nullable', Rule::in(['all', 'appliances', 'furniture', 'gadgets'])],
            'search' => ['nullable', 'string', 'max:255'],
            'detail_search' => ['nullable', 'string', 'max:255'],
            'aging_category' => ['nullable', Rule::in(['current', 'aging-30', 'aging-60', 'aging-90'])],
            'payment_status' => ['nullable', Rule::in(['paid', 'unpaid'])],
            'sort' => ['nullable', Rule::in([
                'customer_name',
                'order_number',
                'payment_schedule_id',
                'due_date',
                'paid_date',
                'scheduled_amount',
                'amount_paid',
                'outstanding_balance',
                'rebate_amount',
                'aging_category',
                'payment_status',
                'branch',
                'collector',
            ])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
