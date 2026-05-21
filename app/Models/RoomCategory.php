<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCategory extends Model
{
    protected $fillable = ['name', 'description'];

    // A category has many rooms
    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}   