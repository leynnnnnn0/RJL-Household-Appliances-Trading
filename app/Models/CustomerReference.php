<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class CustomerReference extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\CustomerReferenceFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'customer_id',
        'full_name',
        'phone_number',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
