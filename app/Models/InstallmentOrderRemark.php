<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrderRemark extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderRemarkFactory> */
    use HasFactory;

    protected $fillable = [
        'installment_order_id',
        'user_id',
        'remarks',
    ];

    public function installment_order()
    {
        return $this->belongsTo(InstallmentOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
