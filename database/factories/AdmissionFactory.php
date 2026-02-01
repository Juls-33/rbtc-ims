<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionFactory extends Factory
{
    protected $model = Admission::class;

    public function definition(): array
    {
        return [
            // Link to an existing patient or create a new one
            'patient_id'     => Patient::factory(), 
            // Link to a random staff member
            'staff_id'       => Staff::inRandomOrder()->first()?->id ?? Staff::factory(),
            // Link to a random room
            'room_id'        => Room::inRandomOrder()->first()?->id ?? Room::factory(),
            
            'admission_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'status'         => fake()->randomElement(['Admitted', 'Discharged', 'Transferred']),
            'diagnosis'      => fake()->sentence(),
            
            // These match the columns your DB is looking for
            'discharge_date' => null, 
        ];
    }
}