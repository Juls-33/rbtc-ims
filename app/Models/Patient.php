<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'birth_date', 'contact_no', 'address', 
        'gender', 'civil_status', 'emergency_contact_name', 
        'emergency_contact_relation', 'emergency_contact_phone'
    ];

    // Relationships
    public function admissions() { return $this->hasMany(Admission::class); }
    public function prescriptions() { return $this->hasMany(Prescription::class); }
    //public function visitors() { return $this->hasMany(VisitorLog::class); }
}
