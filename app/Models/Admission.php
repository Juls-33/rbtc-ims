<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    use HasFactory;

    /**
     * Fields allowed for mass assignment.
     * Derived from your ADMISSION schema image.
     */
    protected $fillable = [
        'patient_id',
        'staff_id',
        'room_id',
        'diagnosis',
        'status',
        'admission_date',
        'discharge_date',
    ];

    /**
     * Relationship to the Patient table.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Relationship to the Staff table.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Relationship to the Room table.
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}