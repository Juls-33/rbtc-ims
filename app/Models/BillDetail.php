<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillDetail extends Model
{
    protected $fillable = [
        'admission_id',
        'facility_fee',
        'medicine_fee_total',
        'total_amount',
        'payment_status', // e.g., Pending, Paid
        'payment_date'
    ];

    /**
     * Relationship: A bill belongs to a specific admission record.
     */
    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }
}
