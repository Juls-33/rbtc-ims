<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    protected $fillable = [
        'medicine_batch_id',
        'staff_id',
        'quantity_change',
        'action_type', // e.g., Restock, Dispensed, Expired
        'remarks'
    ];

    public function batch()
    {
        return $this->belongsTo(MedicineBatch::class, 'medicine_batch_id');
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
