<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillDetail extends Model
{
    protected $fillable = [
        'admission_id',
        'month_number',
        'period_start',
        'period_end',
        'facility_fee',
        'total_amount',
        'amount_paid',
        'payment_source',
        'payment_status',
        'date_issued',
    ];

    /**
     * Relationship: A bill belongs to a specific admission record.
     */
    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }
}
