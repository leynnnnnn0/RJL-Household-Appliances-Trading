<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrder extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'location_id',
        'user_id',
        'order_number',
        'loan_contract_price',
        'lcp_markup_rate',
        'lcp_additional_charge',
        'down_payment',
        'payment_method',
        'reference_number',
        
        'promisory_note_value',
        'number_of_terms',
        'promisory_note_value_interest',
        'promisory_note_value_interest_additional_charge',
        'transaction_date',

        'is_voided',
        'reason_for_cancellation',
        'void_date',
        'voider_id',

        'is_completed',

        'is_defaulted',
        'default_reason',
        'default_date',
        'defaulter_id'
    ];

    protected $appends = [
        'total_amount_paid',
        'remaining_balance'
    ];

    public function getTotalAmountPaidAttribute(){
        $total = $this->installment_order_payments->sum(function($payment){
            if($payment->status == 'paid' || $payment->status == 'partial'){
                return $payment->amount_paid;
            }else {
                return 0;
            }
        });
        return number_format($total, 2, '.', ',');
    }

    public function getRemainingBalanceAttribute()
{
    $noteValue = floatval($this->promisory_note_value);
    $interest = floatval($this->promisory_note_value_interest);
    $additional = floatval($this->promisory_note_value_interest_additional_charge);
    $paid = floatval($this->getTotalAmountPaidAttribute());

    $totalToPay = ($noteValue * $interest) + $additional;

    return number_format(($totalToPay - $paid), 2, '.', ',');
}

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voider()
    {
        return $this->belongsTo(User::class);
    }

    public function installment_order_item()
    {
        return $this->hasOne(InstallmentOrderItem::class);
    }

    public function installment_order_payments()
    {
        return $this->hasMany(InstallmentOrderPayment::class);
    }
}
