<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientLog extends Model
{
    protected $fillable = [
        'staff_id',
        'patient_id',
        'action',
        'description',
        'ip_address',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}