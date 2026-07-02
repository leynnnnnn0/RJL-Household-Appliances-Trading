<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Customer extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'address',
        'city',
        'province',
        'zipcode',
        'country',
        'phone_number',
    ];

    protected $appends = [
        'full_name',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function installment_orders()
    {
        return $this->hasMany(InstallmentOrder::class);
    }

    public function customer_reference()
    {
        return $this->hasOne(CustomerReference::class);
    }

    public function investigation_detail()
    {
        return $this->hasOne(InvestigationDetail::class);
    }

    public function additional_documents()
    {
        return $this->hasMany(AdditionalDocument::class);
    }
}
