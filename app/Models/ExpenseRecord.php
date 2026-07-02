<?php

namespace App\Models;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class ExpenseRecord extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\ExpenseRecordFactory> */
    use Auditable, HasFactory;

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
        'expense_date',
        'branch_id',
    ];

    protected $casts = [
        'category' => ExpenseCategory::class,
        'status' => ExpenseStatus::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approved_by()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
