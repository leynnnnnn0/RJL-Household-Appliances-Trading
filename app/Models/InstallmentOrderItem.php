<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderItemFactory> */
    use HasFactory;

     protected $fillable = [
        'installment_order_id',
        'item_id',
        'serial',
        'discount_amount',
        'sale_amount',
    ];

    public function installment_order()
    {
        return $this->belongsTo(InstallmentOrder::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

}
