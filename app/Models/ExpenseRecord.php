<?php

namespace App\Models;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseRecord extends Model
{
    /** @use HasFactory<\Database\Factories\ExpenseRecordFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'category',
        'status',
        'remarks',
        'approved_by',
        'approved_at',
        'payment_method',
        'reference_number',
        'receipt_path',
    ];

      protected $casts = [
        'category' => ExpenseCategory::class,
        'status' => ExpenseStatus::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
