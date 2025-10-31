<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrderPayment extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderPaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'installment_order_id',
        'amount',
        'payment_method',
        'reference_number',
        'status',
        'transaction_date',
    ];

    public function installment_order()
    {
        return $this->belongsTo(InstallmentOrder::class);
    }
}
