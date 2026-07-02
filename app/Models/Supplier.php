<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Supplier extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use Auditable, HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'remarks',
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'supplier', 'slug');
    }

    public function scopeDropdown($query)
    {
        return $query->orderBy('name')->get()->map(function ($supplier) {
            return [
                'slug' => $supplier->slug,
                'name' => $supplier->name,
            ];
        });
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($supplier) {
            if ($supplier->items()->withTrashed()->exists()) {
                throw new \Exception('Cannot delete supplier. It has associated items.');
            }
        });
    }
}
