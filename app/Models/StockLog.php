<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    // Syncing with your migration fields: batch_id, staff_id, change_amount, reason
    protected $fillable = [
        'batch_id',
        'staff_id',
        'change_amount',
        'reason'
    ];

    public function batch() {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }

    public function staff() {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
}
