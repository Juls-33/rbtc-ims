<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;
use App\Models\Patient;
use App\Models\Room;
use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\Admission;
use Illuminate\Support\Facades\Hash;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Staff (Added missing contact_no, address, and gender)
    Staff::create([
        'first_name' => 'Coco',
        'last_name' => 'Martin',
        'role' => 'Admin', // Changed from 'Staff' to 'Admin'
        'email' => 'admin@rbtc.com',
        'contact_no' => '09123456789',
        'address' => 'Manila, Philippines',
        'gender' => 'Male',
        'password' => Hash::make('password')
    ]);

    Staff::create([
        'first_name' => 'Albu',
        'last_name' => 'Laryo',
        'role' => 'Doctor',
        'email' => 'albu@rbtc.com',
        'contact_no' => '09123456790',
        'address' => 'Quezon City',
        'gender' => 'Male',
        'password' => Hash::make('password')
    ]);

    Staff::create([
        'first_name' => 'Jean Vi',
        'last_name' => 'Logue',
        'role' => 'Doctor',
        'email' => 'jean@rbtc.com',
        'contact_no' => '09123456791',
        'address' => 'Makati City',
        'gender' => 'Female',
        'password' => Hash::make('password')
    ]);

    Staff::create([
        'first_name' => 'Mark',
        'last_name' => 'Zuckerberg',
        'role' => 'Nurse',
        'email' => 'mark@rbtc.com',
        'contact_no' => '09123456792',
        'address' => 'Silicon Valley',
        'gender' => 'Male',
        'password' => Hash::make('password')
    ]);

    // 2. Create Rooms
    $room1 = Room::create([
        'room_location' => 'Building A - 101', // Changed from room_number
        'room_rate' => 500.00, 
        'status' => 'Occupied'
    ]);

    $room2 = Room::create([
        'room_location' => 'Building B - 202', // Changed from room_number
        'room_rate' => 1500.00, 
        'status' => 'Available'
    ]);

    // 3. Create Medicine Catalog
    $para = MedicineCatalog::create([
        'sku_id' => 'PARA-500', 
        'generic_name' => 'Paracetamol', 
        'brand_name' => 'Biogesic',
        'category' => 'Painkiller', 
        'dosage' => '500mg', 
        'reorder_point' => 10, 
        'price_per_unit' => 5.00
    ]);

    // 4. Create Medicine Batches
    MedicineBatch::create([
        'medicine_id' => $para->id, 
        'sku_batch_id' => 'PARA-BIO-500-B100',
        'current_quantity' => 108, 
        'expiry_date' => '2026-12-15',
        'date_received' => now(), // Add this line!
    ]);

    // 5. Create Patient (Added missing fields like address and contact)
    $patient = Patient::create([
        'first_name' => 'Juan', 
        'last_name' => 'Dela Cruz', 
        'gender' => 'Male', 
        'birth_date' => '1990-01-01',
        'contact_no' => '09998887776',
        'address' => 'Cavite',
        'civil_status' => 'Single'
    ]);

    // 6. Create Admission
    Admission::create([
        'patient_id' => $patient->id,
        'staff_id' => 2, // Dr. Albu
        'room_id' => $room1->id,
        'diagnosis' => 'Fever',
        'status' => 'Active',
        'admission_date' => now()
    ]);
    }
}