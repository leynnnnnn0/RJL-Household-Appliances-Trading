<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    /** @use HasFactory<\Database\Factories\BranchFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'remarks'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function installment_orders()
    {
        return $this->hasMany(InstallmentOrder::class);
    }

    public function instalment_orders()
    {
        return $this->installment_orders();
    }

    public function installment_order_payment_histories()
    {
        return $this->hasMany(InstallmentOrderPaymentHistory::class);
    }

    public function scopeDropdown($query)
    {
        return $query->orderBy('name')->get()->map(function ($branch) {
            return [
                'id' => $branch->id,
                'name' => $branch->name,
            ];
        });
    }

    public function expense_records()
    {
        return $this->hasMany(ExpenseRecord::class);
    }

    
}
