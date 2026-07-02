<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class InstallmentOrderPayment extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderPaymentFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'installment_order_id',
        'installment_number',
        'amount_due',
        'amount_paid',
        'due_date',
        'payment_method',
        'rebate_amount',
        'rebate_reason',
        'reference_number',
        'status',
        'paid_date',
    ];

    public function installment_order()
    {
        return $this->belongsTo(InstallmentOrder::class);
    }

    public function installment_order_payment_history()
    {
        return $this->hasMany(InstallmentOrderPaymentHistory::class, 'payment_id');
    }
}
