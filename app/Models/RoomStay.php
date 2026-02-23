<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomStay extends Model
{
    use HasFactory;

    protected $table = 'room_stays';

    protected $fillable = [
        'admission_id',
        'room_id',
        'daily_rate',
        'start_date',
        'end_date',
    ];

    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}