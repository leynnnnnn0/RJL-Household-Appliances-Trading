<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrderPaymentHistory extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderPaymentHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'amount',
        'payment_method',
        'reference_number',
        'paid_date',
        'collection_receipt_number',
        'user_id',
        'branch_id'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function installment_order_payment()
    {
        return $this->belongsTo(InstallmentOrderPayment::class, 'payment_id');
    }
}


