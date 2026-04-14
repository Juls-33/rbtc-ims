<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicineBatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'medicine_id',
        'sku_batch_id',
        'current_quantity',
        'expiry_date',
        'date_received',
    ];

    /**
     * Relationship: A batch belongs to one medicine entry in the catalog.
     */
    public function medicine()
    {
        return $this->belongsTo(MedicineCatalog::class, 'medicine_id');
    }
}