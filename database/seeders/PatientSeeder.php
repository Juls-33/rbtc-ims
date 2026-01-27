<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        // Generates 50 patients; CipherSweet will encrypt them as they are created
        \App\Models\Patient::factory()->count(50)->make()->each(function ($patient) {
            $patient->save(); 
        });
    }
}