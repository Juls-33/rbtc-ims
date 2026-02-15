<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutpatientBillItem extends Model
{
    use HasFactory;

    // Define the table name if it's not the plural of the model
    protected $table = 'outpatient_bill_items';

    protected $fillable = [
        'visit_id',
        'medicine_id',
        'batch_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * Relationship: The visit this item belongs to.
     */
    public function visit()
    {
        return $this->belongsTo(PatientVisit::class, 'visit_id');
    }

    public function medicine()
    {
        return $this->belongsTo(MedicineCatalog::class, 'medicine_id');
    }

    public function batch()
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id'); // Ensure this matches your batch model name
    }
}