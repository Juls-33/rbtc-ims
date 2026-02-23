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

        $staffData = [
            ['first_name' => 'Coco', 'last_name' => 'Martin', 'role' => 'Admin', 'email' => 'admin@rbtc.com'],
            ['first_name' => 'Doctor', 'last_name' => 'Martin', 'role' => 'Doctor', 'email' => 'doctor@rbtc.com'],
            ['first_name' => 'Nurse', 'last_name' => 'Martin', 'role' => 'Nurse', 'email' => 'nurse@rbtc.com'],
        ];

        $counters = ['Admin' => 1, 'Doctor' => 1, 'Nurse' => 1];

        foreach ($staffData as $data) {
            $prefix = strtoupper(substr($data['role'], 0, 1));
            $data['staff_id'] = $prefix . '-' . str_pad($counters[$data['role']]++, 3, '0', STR_PAD_LEFT);
            $data['password'] = Hash::make('password');
            $data['contact_no'] = '09123456789';
            $data['address'] = 'Manila, Philippines';
            $data['gender'] = 'Male';
            $data['status'] = 'ACTIVE';
            
            Staff::updateOrCreate(['email' => $data['email']], $data);
        }
    }
}