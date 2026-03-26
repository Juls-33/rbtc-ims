<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Archivable;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicineCatalog extends Model
{
    use HasFactory, Archivable, SoftDeletes;

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

    protected static function booted()
    {
        static::deleted(function ($medicine) {
            \App\Models\Archive::create([
                'archivable_id'   => $medicine->id,
                'archivable_type' => get_class($medicine),
                'data'            => $medicine->toArray(), 
                'reason'          => 'Inventory Deletion',
                'archived_by'     => auth()->id(),
                'archived_at'     => now(),
                'scheduled_deletion_at' => now()->addDays(30), 
            ]);
        });

        static::restoring(function ($medicine) {
        });
    }
}
