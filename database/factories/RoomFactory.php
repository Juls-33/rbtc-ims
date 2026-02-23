<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            // Generates unique locations like "Room 302-B"
            'room_location' => 'Room ' . $this->faker->unique()->numberBetween(100, 500) . '-' . strtoupper($this->faker->randomLetter()),
            'room_rate' => $this->faker->randomElement([500, 1200, 2500, 5000, 10000]), 
            'status' => 'Available',
        ];
    }
}