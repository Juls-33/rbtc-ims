<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminLog extends Model
{
    protected $fillable = [
        'staff_id',
        'action', // e.g., Updated Patient, Deleted Record
        'description',
        'ip_address'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
