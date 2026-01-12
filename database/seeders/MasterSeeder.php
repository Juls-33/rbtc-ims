<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use App\Models\Staff;
use App\Models\Patient;
use App\Models\Room;
use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\Admission;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        $key = config('ciphersweet.key');
    if (!$key) {
        dd("ERROR: CipherSweet Key is NULL. Check your .env and config/ciphersweet.php");
    }

    // DIAGNOSTIC 2: Check if the model is registered correctly
    $staff = new Staff();
    if (!method_exists($staff, 'encryptRow')) {
        dd("ERROR: Staff model is missing the UsesCipherSweet trait.");
    }
        /**
         * Disable FK checks ONCE
         */
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        /**
         * Truncate CHILD tables first to avoid integrity constraints
         */
        DB::table('admin_logs')->truncate();
        DB::table('admissions')->truncate();
        DB::table('medicine_batches')->truncate();
        DB::table('medicine_catalog')->truncate();
        DB::table('rooms')->truncate();
        DB::table('patients')->truncate();
        DB::table('staff')->truncate();

        /**
         * Re-enable FK checks
         */
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ================= STAFF (ENCRYPTED) =================
        // Using manual save() to guarantee the Encryption Trait triggers
        
        $staffData = [
            [
                'first_name' => 'Coco',
                'last_name'  => 'Martin',
                'role'       => 'Admin',
                'email'      => 'admin@rbtc.com',
                'contact_no' => '09123456789',
                'address'    => 'Manila, Philippines',
                'gender'     => 'Male',
            ],
            [
                'first_name' => 'Cardo',
                'last_name'  => 'Dalisay',
                'role'       => 'Doctor',
                'email'      => 'cardo@rbtc.com',
                'contact_no' => '09987654321',
                'address'    => 'Quezon City',
                'gender'     => 'Male',
            ],
            [
                'first_name' => 'Albu',
                'last_name'  => 'Laryo',
                'role'       => 'Doctor',
                'email'      => 'albu@rbtc.com',
                'contact_no' => '09123456790',
                'address'    => 'Quezon City',
                'gender'     => 'Male',
            ],
            [
                'first_name' => 'Jean Vi',
                'last_name'  => 'Logue',
                'role'       => 'Doctor',
                'email'      => 'jean@rbtc.com',
                'contact_no' => '09123456791',
                'address'    => 'Makati City',
                'gender'     => 'Female',
            ],
            [
                'first_name' => 'Mark',
                'last_name'  => 'Zuckerberg',
                'role'       => 'Nurse',
                'email'      => 'mark@rbtc.com',
                'contact_no' => '09123456792',
                'address'    => 'Silicon Valley',
                'gender'     => 'Male',
            ],
        ];

        // foreach ($staffData as $data) {
        //     // $user = new Staff();
        //     // $user->first_name = $data['first_name'];
        //     // $user->last_name  = $data['last_name'];
        //     // $user->role       = $data['role'];
        //     // $user->email      = $data['email'];
        //     // $user->contact_no = $data['contact_no'];
        //     // $user->address    = $data['address'];
        //     // $user->gender     = $data['gender'];
        //     // $user->password   = Hash::make('password');

        //     // // MANUAL TRIGGER: This is what worked in Tinker!
        //     // $user->encryptRow(); 
            
        //     // $user->save();
        //     $data['password'] = Hash::make('password');

        //     // Staff::create triggers the UsesCipherSweet trait automatically.
        //     // It will handle the encryption and the blind index generation internally.
        //     Staff::create($data);
        // }
        // ================= STAFF (ENCRYPTED) =================
foreach ($staffData as $data) {
    $user = new Staff();
    $user->fill($data);
    $user->password = Hash::make('password');

    // Manually get the encryption results from the engine
    $engine = app(\ParagonIE\CipherSweet\CipherSweet::class);
    $encRow = new \ParagonIE\CipherSweet\EncryptedRow($engine, $user->getTable());
    Staff::configureCipherSweet($encRow);
    
    [$values, $indexes] = $encRow->prepareRowForStorage($user->getAttributes());

    // Manually push them into the model
    $user->fill(array_merge($values, $indexes));
    $user->save();
}

        // ================= ROOMS =================
        $room1 = Room::create([
            'room_location' => 'Building A - 101',
            'room_rate'     => 500.00,
            'status'        => 'Occupied',
        ]);

        $room2 = Room::create([
            'room_location' => 'Building B - 202',
            'room_rate'     => 1500.00,
            'status'        => 'Available',
        ]);

        // ================= MEDICINE =================
        $para = MedicineCatalog::create([
            'sku_id'         => 'PARA-500',
            'generic_name'   => 'Paracetamol',
            'brand_name'     => 'Biogesic',
            'category'       => 'Painkiller',
            'dosage'         => '500mg',
            'reorder_point'  => 10,
            'price_per_unit' => 5.00,
        ]);

        MedicineBatch::create([
            'medicine_id'     => $para->id,
            'sku_batch_id'    => 'PARA-BIO-500-B100',
            'current_quantity'=> 108,
            'expiry_date'     => '2026-12-15',
            'date_received'   => now(),
        ]);

        // ================= PATIENT =================
        $patient = Patient::create([
            'first_name'   => 'Juan',
            'last_name'    => 'Dela Cruz',
            'gender'       => 'Male',
            'birth_date'   => '1990-01-01',
            'contact_no'   => '09998887776',
            'address'      => 'Cavite',
            'civil_status' => 'Single',
        ]);

        // ================= ADMISSION =================
        Admission::create([
            'patient_id'     => $patient->id,
            'staff_id'       => 2, // Corresponds to 'Cardo Dalisay'
            'room_id'        => $room1->id,
            'diagnosis'      => 'Fever',
            'status'         => 'Active',
            'admission_date' => now(),
        ]);
    }
}