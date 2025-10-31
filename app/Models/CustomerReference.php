<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerReference extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerReferenceFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'full_name',
        'phone_number',
    ];

    public function customer()
    {
        $this->belongsTo(Customer::class);
    }
}
