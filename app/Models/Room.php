<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Room extends Model
{
    use HasFactory; 
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
