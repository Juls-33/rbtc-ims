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
        $patients = [
            // --- Original & Filipino Celebrities ---
            ['first_name' => 'Manny', 'last_name' => 'Pacquiao', 'gender' => 'Male', 'contact_no' => '09171111111'],
            ['first_name' => 'Kathryn', 'last_name' => 'Bernardo', 'gender' => 'Female', 'contact_no' => '09182222222'],
            ['first_name' => 'Carlos', 'last_name' => 'Yulo', 'gender' => 'Male', 'contact_no' => '09193333333'],
            ['first_name' => 'Hidilyn', 'last_name' => 'Diaz', 'gender' => 'Female', 'contact_no' => '09204444444'],
            ['first_name' => 'Pia', 'last_name' => 'Wurtzbach', 'gender' => 'Female', 'contact_no' => '09215555555'],
            ['first_name' => 'Anne', 'last_name' => 'Curtis', 'gender' => 'Female', 'contact_no' => '09226666666'],
            ['first_name' => 'Vice', 'last_name' => 'Ganda', 'gender' => 'Other', 'contact_no' => '09237777777'],
            ['first_name' => 'Alden', 'last_name' => 'Richards', 'gender' => 'Male', 'contact_no' => '09248888888'],
            ['first_name' => 'Maine', 'last_name' => 'Mendoza', 'gender' => 'Female', 'contact_no' => '09259999999'],
            ['first_name' => 'Lea', 'last_name' => 'Salonga', 'gender' => 'Female', 'contact_no' => '09260000000'],

            // --- Filipino Sports Icons ---
            ['first_name' => 'EJ', 'last_name' => 'Obiena', 'gender' => 'Male', 'contact_no' => '09271231234'],
            ['first_name' => 'Alyssa', 'last_name' => 'Valdez', 'gender' => 'Female', 'contact_no' => '09282342345'],
            ['first_name' => 'June Mar', 'last_name' => 'Fajardo', 'gender' => 'Male', 'contact_no' => '09293453456'],
            ['first_name' => 'Kai', 'last_name' => 'Sotto', 'gender' => 'Male', 'contact_no' => '09304564567'],
            ['first_name' => 'Alex', 'last_name' => 'Eala', 'gender' => 'Female', 'contact_no' => '09315675678'],

            // --- International Sports & Pop Culture ---
            ['first_name' => 'Angel', 'last_name' => 'Reese', 'gender' => 'Female', 'contact_no' => '09326786789'],
            ['first_name' => 'Caitlin', 'last_name' => 'Clark', 'gender' => 'Female', 'contact_no' => '09337897890'],
            ['first_name' => 'Stephen', 'last_name' => 'Curry', 'gender' => 'Male', 'contact_no' => '09348908901'],
            ['first_name' => 'LeBron', 'last_name' => 'James', 'gender' => 'Male', 'contact_no' => '09359019012'],
            ['first_name' => 'Lionel', 'last_name' => 'Messi', 'gender' => 'Male', 'contact_no' => '09360120123'],
            ['first_name' => 'Shohei', 'last_name' => 'Ohtani', 'gender' => 'Male', 'contact_no' => '09371231234'],
            ['first_name' => 'Taylor', 'last_name' => 'Swift', 'gender' => 'Female', 'contact_no' => '09382342345'],
            ['first_name' => 'Bruno', 'last_name' => 'Mars', 'gender' => 'Male', 'contact_no' => '09393453456'],

            // --- Filipino Historical Figures ---
            ['first_name' => 'Jose', 'last_name' => 'Rizal', 'gender' => 'Male', 'contact_no' => '09404564567'],
            ['first_name' => 'Andres', 'last_name' => 'Bonifacio', 'gender' => 'Male', 'contact_no' => '09415675678'],
            ['first_name' => 'Apolinario', 'last_name' => 'Mabini', 'gender' => 'Male', 'contact_no' => '09426786789'],
            ['first_name' => 'Emilio', 'last_name' => 'Aguinaldo', 'gender' => 'Male', 'contact_no' => '09437897890'],
            ['first_name' => 'Juan', 'last_name' => 'Luna', 'gender' => 'Male', 'contact_no' => '09448908901'],
            ['first_name' => 'Melchora', 'last_name' => 'Aquino', 'gender' => 'Female', 'contact_no' => '09459019012'],
            ['first_name' => 'Gabriela', 'last_name' => 'Silang', 'gender' => 'Female', 'contact_no' => '09460120123'],
            
            // --- Extra Filipino Names ---
            ['first_name' => 'Coco', 'last_name' => 'Martin', 'gender' => 'Male', 'contact_no' => '09471234567'],
            ['first_name' => 'Marian', 'last_name' => 'Rivera', 'gender' => 'Female', 'contact_no' => '09487654321'],
            ['first_name' => 'Dingdong', 'last_name' => 'Dantes', 'gender' => 'Male', 'contact_no' => '09491112223'],
        ];

        foreach ($patients as $p) {
            \App\Models\Patient::create(array_merge($p, [
                'birth_date' => '1995-05-20',
                'address' => 'Metro Manila, Philippines',
                'emergency_contact_name' => 'Guardian Name',
                'emergency_contact_number' => '09112223334',
            ]));
        }
    }
}