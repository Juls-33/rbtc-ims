<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Prescriptions extends Model
{
    use HasFactory;
    protected $table = 'prescriptions';

    protected $fillable = [
        'patient_id',
        'staff_id',
        'medicine_id',
        'medicine_name',
        'dosage',
        'frequency',
        'schedule_time',
        'date_prescribed',
    ];

    /**
     * Relationship: One medicine can have many physical batches.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Relationship: The staff member (Doctor/Nurse) who wrote the prescription.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Relationship: The specific medicine being prescribed.
     */
    public function medicine()
    {
        return $this->belongsTo(MedicineCatalog::class, 'medicine_id');
    }
}
