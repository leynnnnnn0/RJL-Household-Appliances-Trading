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

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
