<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    /** @use HasFactory<\Database\Factories\ItemFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier', // nullable
        'location_id', // nullable
        'item_type', // furniture or appliances or gadgets 
        'dr_no', // nullable
        'description', // required
        'model', // required
        'serial', // required
        'quantity', // 1 
        'srp', // Unit price
        'unit_cost', // required
        'date_of_purchase', // random
        'date_out', // null
        'size', // nullable
        'remarks'
    ];

    public function transfer_data()
    {
        return $this->hasMany(TransferData::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier', 'slug');
    }
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function installment_orders()
    {
        return $this->hasManyThrough(
            InstallmentOrder::class,
            InstallmentOrderItem::class,
            'item_id',                  // InstallmentOrderItem.item_id → Item.id
            'id',                       // InstallmentOrder.id
            'id',                       // Item.id
            'installment_order_id'      // InstallmentOrderItem.installment_order_id
        );
    }

    public function orders()
    {
        return $this->hasManyThrough(
            Order::class,
            OrderItem::class,
            'item_id',
            'id',
            'id',
            'order_id',
        );
    }

    public function installment_order_item()
    {
        return $this->hasMany(InstallmentOrderItem::class);
    }


    public function order_item()
    {
        return $this->hasMany(OrderItem::class);
    }
}
