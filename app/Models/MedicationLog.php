<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicationLog extends Model
{
    protected $fillable = [
        'prescription_id',
        'nurse_id',
        'batch_number',
        'administered_at'
    ];

    public function nurse() {
        return $this->belongsTo(User::class, 'nurse_id');
    }
}
