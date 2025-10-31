<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'address',
        'phone_number'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function customer_reference()
    {
        return $this->hasOne(CustomerReference::class);
    }

    public function investigation_detail()
    {
        return $this->hasOne(InvestigationDetail::class);
    }

}
