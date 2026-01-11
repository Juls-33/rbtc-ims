<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        Staff::create([
            'first_name' => 'System',
            'last_name' => 'Admin',
            'email' => 'admin@rbtc.com',
            'contact_no' => '09123456789',
            'address' => 'Main Office',
            'gender' => 'Other',
            'role' => 'Staff', // Using a standard role from your Enum
            'password' => Hash::make('admin123'),
        ]);
    }
}