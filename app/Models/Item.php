<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    /** @use HasFactory<\Database\Factories\ItemFactory> */
    use HasFactory;

    protected $fillable = [
        'category',
        'location_id',
        'item_type',
        'dr_no',
        'supplier',
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

    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'slug');
    }
    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
