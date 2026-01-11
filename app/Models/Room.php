<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'room_location', 
        'room_rate', 
        'status'
    ];

    /**
     * Relationship: A room can have many past and present admissions.
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }
}
