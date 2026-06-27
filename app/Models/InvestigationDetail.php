<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestigationDetail extends Model
{
    /** @use HasFactory<\Database\Factories\InvestigationDetailFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'employee_id',
        'home_visit_date',
        'is_employment_verified',
        'investigation_notes',
        'id_presented',
        'id_number',
        'civil_status',
        'spouse_name',
        'spouse_contact_number',
    ];  

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
