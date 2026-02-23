<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
{
    // 1. Specific High-End Rooms
    Room::create(['room_location' => 'ICU - Station 1', 'room_rate' => 12000, 'status' => 'Available']);
    Room::create(['room_location' => 'Suite 501 (VIP)', 'room_rate' => 8500, 'status' => 'Available']);

    // 2. Standard Wards (Let's make 20 beds)
    for ($i = 1; $i <= 20; $i++) {
        Room::create([
            'room_location' => "General Ward - Bed $i",
            'room_rate' => 800.00,
            'status' => 'Available',
        ]);
    }

    // 3. Mass generate Private Rooms using the Factory
    // Change 10 to 50 for a lot of rooms
    \App\Models\Room::factory(50)->create(); 

    }
}