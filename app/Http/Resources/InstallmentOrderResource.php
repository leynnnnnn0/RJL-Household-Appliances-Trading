<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstallmentOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer' => $this->customer->full_name,
            'installment_payments' => $this->installment_order_payments->mapWithKeys(function ($payment) {
                return [
                    $payment->id => [
                        'status' => $payment->status,
                        'due_date' => $payment->due_date,
                        'amount_due' => $payment->amount_due - $payment->amount_paid - $payment->rebate_amount,
                    ]
                ];
            })
        ];
    }
}
