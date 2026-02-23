<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\Admission;
use App\Models\Staff;
use App\Models\Room;
use App\Models\PatientVisit;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Fetch available IDs to avoid foreign key violations
        $roomIds = Room::pluck('id');
        $staffIds = Staff::pluck('id');

        if ($roomIds->isEmpty() || $staffIds->isEmpty()) {
            throw new \Exception("Rooms or Staff table is empty. Seed them before Patients.");
        }

        // 2. Create 50 patients
        Patient::factory()
            ->count(50)
            ->create()
            ->each(function ($patient) use ($roomIds, $staffIds) {
                // Create an admission using a RANDOM existing ID
                Admission::create([
                    'patient_id'     => $patient->id,
                    'staff_id'       => $staffIds->random(),
                    'room_id'        => $roomIds->random(),
                    'admission_date' => now(),
                    'status'         => 'Admitted',
                    'diagnosis'      => 'Initial Assessment',
                ]);

                // Create a visit record
                PatientVisit::create([
                    'patient_id' => $patient->id,
                    'visit_date' => now(),
                    'weight'     => '70kg',
                    'reason'     => 'Initial Checkup', 
                    // Add balance if your model requires it for outpatient
                    'balance'    => 0,
                ]);
            });
    }
}