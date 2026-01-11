<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MedicineCatalog extends Model
{
    use HasFactory;

    // Explicitly define the table name if it differs from the plural 'medicine_catalogs'
    protected $table = 'medicine_catalog';

    protected $fillable = [
        'sku_id',
        'generic_name',
        'brand_name',
        'category',
        'dosage',
        'reorder_point',
        'price_per_unit',
    ];

    /**
     * Relationship: One medicine can have many physical batches.
     */
    public function batches()
    {
        return $this->hasMany(MedicineBatch::class, 'medicine_id');
    }

    /**
     * Relationship: One medicine can be part of many prescriptions.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'medicine_id');
    }
}
