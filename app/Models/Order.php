<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'location_id',
        'employee_id',
        'order_number',
        'total_price',
        'transaction_date'
    ];

    public function order_items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
