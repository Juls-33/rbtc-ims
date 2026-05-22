<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientVisit extends Model
{
    use HasFactory, SoftDeletes;

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
        'staff_id',
        'visit_date',
        'blood_pressure',
        'heart_rate', 
        'temperature', 
        'checkup_fee',
        'weight',
        'reason',
        'total_bill',
        'amount_paid',
        'payment_source',
        'balance'

    ];

    /**
     * Get the patient that owns the visit.
     * This allows you to do $visit->patient->full_name.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
    public function bill_items()
    {
        return $this->hasMany(OutpatientBillItem::class, 'visit_id');
    }
    public function staff()
    {
        // Ensure the foreign key matches your database (staff_id)
        return $this->belongsTo(Staff::class, 'staff_id');
    }
    public function doctor()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
    public function nurse()
    {
        return $this->belongsTo(Staff::class, 'nurse_id');
    }
    public function archive($reason, $staffId)
    {
        $data = $this->toArray();
        // Load relationships to include in the archive snapshot
        $data['patient_first_name'] = $this->patient?->first_name;
        $data['patient_last_name'] = $this->patient?->last_name;
        $data['items'] = $this->bill_items()->get()->toArray();

        return \DB::table('archives')->insert([
            'archivable_type' => get_class($this),
            'archivable_id'   => $this->id,
            'data'            => json_encode($data),
            'reason'          => $reason,
            'archived_by'     => $staffId,
            'archived_at'     => now(),
            'scheduled_deletion_at' => now()->addYears(5), 
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }
}