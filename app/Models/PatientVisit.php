<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientVisit extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Optional if your table follows Laravel's plural naming convention.
     */
    protected $table = 'patient_visits';

    /**
     * The attributes that are mass assignable.
     * Matches the fields used in your AddVisitModal.
     */
    protected $fillable = [
        'patient_id',
        'visit_date',
        'weight',
        'reason',
    ];

    /**
     * Get the patient that owns the visit.
     * This allows you to do $visit->patient->full_name.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}