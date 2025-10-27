<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'remarks'
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'supplier', 'slug');
    }
}
