<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Staff;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // Define your specific accounts
        $staffMembers = [
            ['first_name' => 'System', 'last_name' => 'Admin', 'email' => 'admin@rbtc.com', 'role' => 'ADMIN'],
            ['first_name' => 'RBTC', 'last_name' => 'Official', 'email' => 'rbtc.ims.official@gmail.com', 'role' => 'ADMIN'],
            ['first_name' => 'Main', 'last_name' => 'Doctor', 'email' => 'doctor@rbtc.com', 'role' => 'DOCTOR'],
            ['first_name' => 'Main', 'last_name' => 'Nurse', 'email' => 'nurse@rbtc.com', 'role' => 'NURSE'],

            // Team Accounts
            ['first_name' => 'Sherwin', 'last_name' => 'Teodoro', 'email' => 'sherwinjames.teodoro.cics@ust.edu.ph', 'role' => 'DOCTOR'],
            ['first_name' => 'Julius', 'last_name' => 'Santos', 'email' => 'juliusaustin.santos.cics@ust.edu.ph', 'role' => 'DOCTOR'],
            ['first_name' => 'Enrique', 'last_name' => 'Benedictos', 'email' => 'enriquealfonso.benedictos.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'Paul', 'last_name' => 'Laraze', 'email' => 'paulanthony.laraze.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'John', 'last_name' => 'Guitierrez', 'email' => 'johncarlos.guitierrez.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'Jillianne', 'last_name' => 'Cirineo', 'email' => 'jillianne.cirineo.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'Cristian', 'last_name' => 'Lumaad', 'email' => 'cristianluis.lumaad.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'Liam', 'last_name' => 'Gilos', 'email' => 'liamsummer.gilos.cics@ust.edu.ph', 'role' => 'NURSE'],
            ['first_name' => 'Mark', 'last_name' => 'Tano', 'email' => 'markclarence.tano.cics@ust.edu.ph', 'role' => 'NURSE'],
        ];

        // Counters for ID generation (e.g., A-001, D-001)
        $counters = ['ADMIN' => 1, 'DOCTOR' => 1, 'NURSE' => 1];

        foreach ($staffMembers as $data) {
            // 1. Generate the custom staff_id string (A-001, etc.)
            $prefix = strtoupper(substr($data['role'], 0, 1));
            $customId = $prefix . '-' . str_pad($counters[strtoupper($data['role'])]++, 3, '0', STR_PAD_LEFT);

            // 2. Create the record
            Staff::create([
                'staff_id'   => $customId, // THIS WAS THE MISSING FIELD
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'email'      => $data['email'],
                'role'       => $data['role'],
                'password'   => $password,
                'status'     => 'ACTIVE',
                'gender'     => 'Male', // Default to satisfy non-null constraints
                'contact_no' => '09123456789',
                'address'    => 'Manila, Philippines',
            ]);
        }
    }
}