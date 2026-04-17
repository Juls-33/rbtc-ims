<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. SAFE WIPE: Disable foreign keys, truncate old data, re-enable.
        // This ensures no constraint errors when deleting rooms that might have been tied to old admissions.
        Schema::disableForeignKeyConstraints();
        Room::truncate();
        RoomCategory::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. DEFINE THE CLIENT'S ROOM MATRIX
        // I assigned realistic base rates depending on the room type. You can adjust these easily!
        $layout = [
            ['name' => 'Male Ward 1',         'prefix' => 'MW1 - Bed', 'count' => 8, 'rate' => 1500],
            ['name' => 'Male Ward 2',         'prefix' => 'MW2 - Bed', 'count' => 8, 'rate' => 1500],
            ['name' => 'Male Semi-Private',   'prefix' => 'MSP - Bed', 'count' => 3, 'rate' => 3000],
            ['name' => 'Male Private 1',      'prefix' => 'MP - Rm 1', 'count' => 1, 'rate' => 5000],
            ['name' => 'Male Private 2',      'prefix' => 'MP - Rm 2', 'count' => 1, 'rate' => 5000],
            
            ['name' => 'Female Ward 1',       'prefix' => 'FW1 - Bed', 'count' => 5, 'rate' => 1500],
            ['name' => 'Female Ward 2',       'prefix' => 'FW2 - Bed', 'count' => 4, 'rate' => 1500],
            ['name' => 'Female Ward 3',       'prefix' => 'FW3 - Bed', 'count' => 6, 'rate' => 1500],
            ['name' => 'Female Semi-Private', 'prefix' => 'FSP - Bed', 'count' => 3, 'rate' => 3000],
            ['name' => 'Female Private 1',    'prefix' => 'FP - Rm 1', 'count' => 1, 'rate' => 5000],
            ['name' => 'Female Private 2',    'prefix' => 'FP - Rm 2', 'count' => 1, 'rate' => 5000],
        ];

        // 3. EXECUTE THE SEEDING
        foreach ($layout as $config) {
            // First, create the Category
            $category = RoomCategory::create([
                'name' => $config['name'],
                'description' => "Standard {$config['name']} accommodations",
            ]);

            // Then, loop through and create the exact number of beds for that category
            for ($i = 1; $i <= $config['count']; $i++) {
                
                // If it's a private room (count of 1), just use the prefix. Otherwise, append the bed number.
                $roomLocation = $config['count'] === 1 
                    ? $config['prefix'] 
                    : $config['prefix'] . ' ' . $i;

                Room::create([
                    'room_category_id' => $category->id,
                    'room_location'    => $roomLocation,
                    'room_rate'        => $config['rate'],
                    'status'           => 'Available',
                ]);
            }
        }
    }
}