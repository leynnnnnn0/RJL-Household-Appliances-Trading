<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'remarks'
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::deleting(function ($location) {
            if ($location->items()->withTrashed()->exists()) {
                throw new \Exception('Cannot delete location. It has associated items.');
            }
        });
    }
    


}
