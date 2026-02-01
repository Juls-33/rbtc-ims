<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\Admission;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
{
    // Create 50 patients
    \App\Models\Patient::factory()
        ->count(50)
        ->create()
        ->each(function ($patient) {
            // Create at least one admission so the Profile page has data to show
            \App\Models\Admission::create([
                'patient_id'     => $patient->id,
                'staff_id'       => \App\Models\Staff::first()?->id ?? 1,
                'room_id'        => \App\Models\Room::first()?->id ?? 1,
                'admission_date' => now(),
                'status'         => 'Admitted',
                'diagnosis'      => 'Initial Assessment',
            ]);

            // Create a visit record so the vitals (BP, HR) aren't empty
            \App\Models\PatientVisit::create([
                'patient_id' => $patient->id,
                'visit_date' => now(),
                'weight'     => '70kg',
                'reason'     => 'Initial Checkup', 
            ]);
        });
}
}