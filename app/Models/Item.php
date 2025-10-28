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
        'supplier',
        'location_id',
        'item_type',
        'dr_no',
        'description',
        'model',
        'serial',
        'quantity',
        'srp',
        'unit_cost',
        'date_of_purchase',
        'date_out',
        'size',
        'remarks'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier', 'slug');
    }
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function order_item()
    {
        $this->has(OrderItem::class);
    }
    
}
