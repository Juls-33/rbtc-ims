<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    //use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MasterSeeder::class,   // 1. Staff (Credentials)
            RoomSeeder::class,     // 2. Rooms
            MedicineSeeder::class, // 3. Medicines
            PatientSeeder::class,  // 4. Random Patients
            InpatientSeeder::class,
        ]);
    }
}
