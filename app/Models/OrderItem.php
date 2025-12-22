<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'item_id',
        'serial',
        'discount_amount',
        'sale_amount',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
s
    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
