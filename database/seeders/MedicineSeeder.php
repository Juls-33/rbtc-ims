<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {  
        $paracetamol = \App\Models\MedicineCatalog::create([
            'sku' => 'PARA-BIO-500-B100',
            'name' => 'Paracetamol (Biogesic) 500mg',
            'category' => 'Painkiller',
        ]);

        $paracetamol->batches()->createMany([
            ['batch_number' => 'B-1001', 'date_received' => '2025-01-15', 'expiry_date' => '2026-12-15', 'stock_quantity' => 8],
            ['batch_number' => 'B-1092', 'date_received' => '2025-07-20', 'expiry_date' => '2026-12-15', 'stock_quantity' => 100],
        ]);
    }
}
