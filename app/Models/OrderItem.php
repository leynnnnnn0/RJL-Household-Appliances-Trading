<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class OrderItem extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use Auditable, HasFactory;

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

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
