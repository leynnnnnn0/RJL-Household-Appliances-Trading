<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'remarks'
    ];  

    protected $appends = [
        'full_name'
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function scopeDropdown($query)
    {
        return $query->orderBy('first_name')->orderBy('last_name')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'full_name' => $employee->full_name
            ];
        });
    }

    public function investigation_details()
    {
        return $this->hasMany(InvestigationDetail::class);
    }
}
