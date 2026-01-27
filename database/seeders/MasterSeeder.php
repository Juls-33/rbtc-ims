<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Staff;
use App\Models\Patient;
use App\Models\Room;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        // Safety check for Patient encryption key
        if (!config('ciphersweet.key')) {
            dd("ERROR: CipherSweet Key is missing from .env. Required for Patient encryption.");
        }

        // Clean tables for a fresh plant
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('admissions')->truncate();
        DB::table('patients')->truncate();
        DB::table('staff')->truncate();
        DB::table('rooms')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ================= STAFF (PLAIN TEXT) =================
        $staffData = [
            ['first_name' => 'Coco', 'last_name' => 'Martin', 'role' => 'Admin', 'email' => 'admin@rbtc.com'],
            ['first_name' => 'Doctor', 'last_name' => 'Martin', 'role' => 'Doctor', 'email' => 'doctor@rbtc.com'],
            ['first_name' => 'Nurse', 'last_name' => 'Martin', 'role' => 'Nurse', 'email' => 'nurse@rbtc.com'],
            ['first_name' => 'Cardo', 'last_name' => 'Dalisay', 'role' => 'Doctor', 'email' => 'cardo@rbtc.com'],
            ['first_name' => 'Albu', 'last_name' => 'Laryo', 'role' => 'Doctor', 'email' => 'albu@rbtc.com'],
            ['first_name' => 'Jean Vi', 'last_name' => 'Logue', 'role' => 'Doctor', 'email' => 'jean@rbtc.com'],
            ['first_name' => 'Mark', 'last_name' => 'Zuckerberg', 'role' => 'Nurse', 'email' => 'mark@rbtc.com'],
        ];

        foreach ($staffData as $data) {
            $data['password'] = Hash::make('password');
            $data['contact_no'] = '09123456789';
            $data['address'] = 'Manila, Philippines';
            $data['gender'] = $data['gender'] ?? 'Male';
            
            // Standard create: saves as plain text since Staff model no longer has encryption traits
            Staff::create($data);
        }

        // ================= ROOMS =================
        Room::create(['room_location' => 'Building A - 101', 'room_rate' => 500.00, 'status' => 'Occupied']);
        Room::create(['room_location' => 'Building B - 202', 'room_rate' => 1500.00, 'status' => 'Available']);
    }
}