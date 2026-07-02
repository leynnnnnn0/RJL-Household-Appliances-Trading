<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Location extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'name',
        'address',
        'remarks',
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function scopeDropdown($query)
    {
        return $query->orderBy('name')->get()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });
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
