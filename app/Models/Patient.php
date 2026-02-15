<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\LaravelCipherSweet\Concerns\UsesCipherSweet;
use Spatie\LaravelCipherSweet\Contracts\CipherSweetEncrypted;
use ParagonIE\CipherSweet\Constants;
use ParagonIE\CipherSweet\EncryptedRow;
use ParagonIE\CipherSweet\BlindIndex;

class Patient extends Model implements CipherSweetEncrypted
{   
    use HasFactory, UsesCipherSweet;

    protected $fillable = [
        'first_name', 
        'last_name', 
        // 'first_name_index',
        // 'last_name_index', 
        'birth_date', 
        'contact_no', 
        'address', 
        'gender', 
        'civil_status', 
        'medical_history', 
        'diagnosis_notes',
        'emergency_contact_name', 
        'emergency_contact_relation', 
        // Synchronized to match the migration and encryption config
        'emergency_contact_number' 
    ];

    public static function configureCipherSweet(EncryptedRow $row): void
    {
        $row->addField('first_name')
            ->addBlindIndex('first_name', new BlindIndex('first_name_index'));

        $row->addField('last_name')
            ->addBlindIndex('last_name', new BlindIndex('last_name_index'));

        //$row->addField('medical_history', Constants::TYPE_OPTIONAL_TEXT);
        // Use TYPE_OPTIONAL_TEXT to prevent seeder crashes on null values
        $row->addField('contact_no', Constants::TYPE_OPTIONAL_TEXT)
            ->addField('address', Constants::TYPE_OPTIONAL_TEXT)
            ->addField('medical_history', Constants::TYPE_OPTIONAL_TEXT)
            ->addField('diagnosis_notes', Constants::TYPE_OPTIONAL_TEXT)
            ->addField('emergency_contact_number', Constants::TYPE_OPTIONAL_TEXT);
    }

    public function admissions() { 
        return $this->hasMany(Admission::class); 
    }
    
    public function prescriptions() { 
        return $this->hasMany(Prescriptions::class,'patient_id', 'id'); 
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Accessor for formatted Patient ID (e.g., P-00001)
     */
    public function getPatientIdAttribute()
    {
        return 'P-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }
    public function visits()
    {
        return $this->hasMany(PatientVisit::class);
    }
}