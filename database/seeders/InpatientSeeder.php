<?php

namespace Database\Seeders;

use App\Models\Admission;
use App\Models\RoomStay;
use App\Models\InpatientBillItem;
use Illuminate\Database\Seeder;

class InpatientSeeder extends Seeder
{
    public function run(): void
    {
        // Get all admissions created by PatientSeeder
        $admissions = Admission::all();

        foreach ($admissions as $admission) {
            $admissionDate = now()->subDays(rand(3, 10));
            
            $admission->update([
                'admission_date' => $admissionDate,
                'amount_paid' => 0, 
            ]);

            // 2. Create the RoomStay (The math needs this to exist)
            RoomStay::create([
                'admission_id' => $admission->id,
                'room_id'      => $admission->room_id,
                'daily_rate'   => $admission->room->room_rate ?? 1500, 
                'start_date'   => $admissionDate,
                'end_date'     => null,
            ]);

            // 3. Add medicine
            InpatientBillItem::create([
                'admission_id' => $admission->id,
                'description'  => 'Ceftriaxone 1g IV',
                'quantity'     => 2,
                'unit_price'   => 500,
                'total_price'  => 1000,
            ]);

            $admission->refresh(); 
            $admission->syncLiveTotals();
        }
    }
}