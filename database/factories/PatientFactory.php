<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            // Note: first_name_index and last_name_index are handled automatically by CipherSweet
            'birth_date' => $this->faker->date('Y-m-d', '-18 years'),
            'gender' => $this->faker->randomElement(['Male', 'Female', 'Other']),
            'contact_no' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'civil_status' => $this->faker->randomElement(['Single', 'Married', 'Widowed', 'Separated']),
            'medical_history' => $this->faker->sentence(10),
            'diagnosis_notes' => $this->faker->paragraph(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_relation' => $this->faker->randomElement(['Parent', 'Spouse', 'Sibling', 'Guardian']),
            'emergency_contact_number' => $this->faker->phoneNumber(),
        ];
    }
}