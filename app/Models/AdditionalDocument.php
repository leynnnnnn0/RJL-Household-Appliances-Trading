<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class AdditionalDocument extends Model implements AuditableContract
{
    /** @use HasFactory<\Database\Factories\AdditionalDocumentFactory> */
    use Auditable, HasFactory;

    protected $fillable = [
        'customer_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
