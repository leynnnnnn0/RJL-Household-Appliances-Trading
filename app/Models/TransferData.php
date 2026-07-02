<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class TransferData extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\TransferDataFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'item_id',
        'from_location_id',
        'to_location_id',
        'remarks',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function from_location()
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function to_location()
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }
}
