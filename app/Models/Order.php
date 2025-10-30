<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'location_id',
        'employee_id',
        'order_number',
        'total_price',
        'transaction_date',
        'payment_method',
        'reference_number',
        'is_void',
        'reason_for_cancellation',
        'void_date',
        'user_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

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
