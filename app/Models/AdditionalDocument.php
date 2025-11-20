<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalDocument extends Model
{
    /** @use HasFactory<\Database\Factories\AdditionalDocumentFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type'
    ];


    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
