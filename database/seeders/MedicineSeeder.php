<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicineCatalog;

class MedicineSeeder extends Seeder
{
    public function run(): void
    {
        // Data structure matches your Schema: 
        // Parent: sku_id, generic_name, brand_name, category, dosage, reorder_point, price_per_unit
        // Child (Batches): sku_batch_id, current_quantity, date_received, expiry_date
        
        $meds = [
            // 1. ANALGESICS
            [
                'sku_id' => 'PARA-BIO-500',
                'generic_name' => 'Paracetamol',
                'brand_name' => 'Biogesic',
                'category' => 'Analgesic',
                'dosage' => '500mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 5.00,
                'batches' => [
                    ['sku_batch_id' => 'PB-101', 'date_received' => '2025-01-10', 'expiry_date' => '2026-12-01', 'current_quantity' => 150],
                    ['sku_batch_id' => 'PB-102', 'date_received' => '2025-02-15', 'expiry_date' => '2027-01-15', 'current_quantity' => 200],
                ]
            ],
            [
                'sku_id' => 'IBU-ADV-200',
                'generic_name' => 'Ibuprofen',
                'brand_name' => 'Advil',
                'category' => 'Analgesic',
                'dosage' => '200mg Softgel',
                'reorder_point' => 50,
                'price_per_unit' => 12.50,
                'batches' => [
                    ['sku_batch_id' => 'IB-505', 'date_received' => '2025-01-05', 'expiry_date' => '2026-06-30', 'current_quantity' => 50],
                    ['sku_batch_id' => 'IB-506', 'date_received' => '2025-03-01', 'expiry_date' => '2027-02-28', 'current_quantity' => 120],
                ]
            ],
            [
                'sku_id' => 'MEF-GAR-500',
                'generic_name' => 'Mefenamic Acid',
                'brand_name' => 'Gardan',
                'category' => 'Analgesic',
                'dosage' => '500mg Capsule',
                'reorder_point' => 30,
                'price_per_unit' => 8.00,
                'batches' => [
                    ['sku_batch_id' => 'MG-202', 'date_received' => '2024-11-20', 'expiry_date' => '2025-11-20', 'current_quantity' => 80],
                ]
            ],

            // 2. ANTIBIOTICS
            [
                'sku_id' => 'AMO-AMP-500',
                'generic_name' => 'Amoxicillin',
                'brand_name' => 'Amoxil',
                'category' => 'Antibiotic',
                'dosage' => '500mg Capsule',
                'reorder_point' => 50,
                'price_per_unit' => 15.00,
                'batches' => [
                    ['sku_batch_id' => 'AM-301', 'date_received' => '2025-01-20', 'expiry_date' => '2026-01-20', 'current_quantity' => 10], // Low stock
                    ['sku_batch_id' => 'AM-302', 'date_received' => '2025-02-01', 'expiry_date' => '2027-02-01', 'current_quantity' => 500],
                ]
            ],
            [
                'sku_id' => 'AZI-ZIT-500',
                'generic_name' => 'Azithromycin',
                'brand_name' => 'Zithromax',
                'category' => 'Antibiotic',
                'dosage' => '500mg Tablet',
                'reorder_point' => 20,
                'price_per_unit' => 85.00,
                'batches' => [
                    ['sku_batch_id' => 'AZ-111', 'date_received' => '2024-12-01', 'expiry_date' => '2025-12-01', 'current_quantity' => 45],
                ]
            ],
            [
                'sku_id' => 'COA-AUG-625',
                'generic_name' => 'Co-Amoxiclav',
                'brand_name' => 'Augmentin',
                'category' => 'Antibiotic',
                'dosage' => '625mg Tablet',
                'reorder_point' => 20,
                'price_per_unit' => 45.00,
                'batches' => [
                    ['sku_batch_id' => 'AUG-99', 'date_received' => '2025-01-01', 'expiry_date' => '2026-06-01', 'current_quantity' => 100],
                ]
            ],

            // 3. COUGH & COLD
            [
                'sku_id' => 'NEO-TAB-001',
                'generic_name' => 'Phenylephrine',
                'brand_name' => 'Neozep',
                'category' => 'Cough & Cold',
                'dosage' => '10mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 6.00,
                'batches' => [
                    ['sku_batch_id' => 'NZ-555', 'date_received' => '2025-02-10', 'expiry_date' => '2027-02-10', 'current_quantity' => 300],
                ]
            ],
            [
                'sku_id' => 'BIO-FLU-001',
                'generic_name' => 'Phenylephrine + Chlorphenamine',
                'brand_name' => 'Bioflu',
                'category' => 'Cough & Cold',
                'dosage' => 'Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 7.50,
                'batches' => [
                    ['sku_batch_id' => 'BF-444', 'date_received' => '2025-01-05', 'expiry_date' => '2026-01-05', 'current_quantity' => 250],
                ]
            ],
            [
                'sku_id' => 'SOL-CAP-500',
                'generic_name' => 'Carbocisteine',
                'brand_name' => 'Solmux',
                'category' => 'Cough & Cold',
                'dosage' => '500mg Capsule',
                'reorder_point' => 50,
                'price_per_unit' => 11.00,
                'batches' => [
                    ['sku_batch_id' => 'SM-222', 'date_received' => '2024-09-01', 'expiry_date' => '2025-09-01', 'current_quantity' => 10], // Critical
                ]
            ],

            // 4. VITAMINS
            [
                'sku_id' => 'VIT-C-500',
                'generic_name' => 'Ascorbic Acid',
                'brand_name' => 'Poten-Cee',
                'category' => 'Vitamins',
                'dosage' => '500mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 4.00,
                'batches' => [
                    ['sku_batch_id' => 'VC-001', 'date_received' => '2025-01-01', 'expiry_date' => '2027-01-01', 'current_quantity' => 500],
                ]
            ],
            [
                'sku_id' => 'VIT-B-COM',
                'generic_name' => 'Vitamin B-Complex',
                'brand_name' => 'Neurobion',
                'category' => 'Vitamins',
                'dosage' => 'Tablet',
                'reorder_point' => 50,
                'price_per_unit' => 18.00,
                'batches' => [
                    ['sku_batch_id' => 'VB-101', 'date_received' => '2025-02-20', 'expiry_date' => '2026-08-20', 'current_quantity' => 200],
                ]
            ],
            [
                'sku_id' => 'VIT-E-400',
                'generic_name' => 'Vitamin E',
                'brand_name' => 'Myra-E',
                'category' => 'Vitamins',
                'dosage' => '400IU Capsule',
                'reorder_point' => 30,
                'price_per_unit' => 14.00,
                'batches' => [
                    ['sku_batch_id' => 'VE-303', 'date_received' => '2024-12-15', 'expiry_date' => '2026-12-15', 'current_quantity' => 150],
                ]
            ],

            // 5. MAINTENANCE
            [
                'sku_id' => 'LOS-COZ-50',
                'generic_name' => 'Losartan',
                'brand_name' => 'Cozaar',
                'category' => 'Maintenance',
                'dosage' => '50mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 22.00,
                'batches' => [
                    ['sku_batch_id' => 'LC-505', 'date_received' => '2025-01-18', 'expiry_date' => '2027-01-18', 'current_quantity' => 500],
                ]
            ],
            [
                'sku_id' => 'AML-NOR-5',
                'generic_name' => 'Amlodipine',
                'brand_name' => 'Norvasc',
                'category' => 'Maintenance',
                'dosage' => '5mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 18.50,
                'batches' => [
                    ['sku_batch_id' => 'AN-506', 'date_received' => '2025-02-22', 'expiry_date' => '2026-02-22', 'current_quantity' => 450],
                ]
            ],
            [
                'sku_id' => 'MET-GLU-500',
                'generic_name' => 'Metformin',
                'brand_name' => 'Glucophage',
                'category' => 'Maintenance',
                'dosage' => '500mg Tablet',
                'reorder_point' => 100,
                'price_per_unit' => 6.50,
                'batches' => [
                    ['sku_batch_id' => 'MG-507', 'date_received' => '2024-11-11', 'expiry_date' => '2025-11-11', 'current_quantity' => 300],
                ]
            ],
            [
                'sku_id' => 'SIM-ZOC-20',
                'generic_name' => 'Simvastatin',
                'brand_name' => 'Zocor',
                'category' => 'Maintenance',
                'dosage' => '20mg Tablet',
                'reorder_point' => 50,
                'price_per_unit' => 25.00,
                'batches' => [
                    ['sku_batch_id' => 'SZ-508', 'date_received' => '2024-09-09', 'expiry_date' => '2025-09-09', 'current_quantity' => 250],
                ]
            ],

            // 6. ANTIHISTAMINE
            [
                'sku_id' => 'LOR-ALR-10',
                'generic_name' => 'Loratadine',
                'brand_name' => 'Allerta',
                'category' => 'Antihistamine',
                'dosage' => '10mg Tablet',
                'reorder_point' => 40,
                'price_per_unit' => 19.00,
                'batches' => [
                    ['sku_batch_id' => 'LA-771', 'date_received' => '2025-01-12', 'expiry_date' => '2027-01-12', 'current_quantity' => 100],
                ]
            ],
            [
                'sku_id' => 'CET-ZIR-10',
                'generic_name' => 'Cetirizine',
                'brand_name' => 'Virlix',
                'category' => 'Antihistamine',
                'dosage' => '10mg Tablet',
                'reorder_point' => 40,
                'price_per_unit' => 21.00,
                'batches' => [
                    ['sku_batch_id' => 'CZ-882', 'date_received' => '2024-11-05', 'expiry_date' => '2026-11-05', 'current_quantity' => 120],
                ]
            ],

            // 7. GASTRO
            [
                'sku_id' => 'LOP-IMO-2',
                'generic_name' => 'Loperamide',
                'brand_name' => 'Imodium',
                'category' => 'Gastrointestinal',
                'dosage' => '2mg Capsule',
                'reorder_point' => 50,
                'price_per_unit' => 6.00,
                'batches' => [
                    ['sku_batch_id' => 'LI-123', 'date_received' => '2025-01-30', 'expiry_date' => '2027-01-30', 'current_quantity' => 200],
                ]
            ],
            [
                'sku_id' => 'OME-PRA-20',
                'generic_name' => 'Omeprazole',
                'brand_name' => 'Risek',
                'category' => 'Gastrointestinal',
                'dosage' => '20mg Capsule',
                'reorder_point' => 30,
                'price_per_unit' => 35.00,
                'batches' => [
                    ['sku_batch_id' => 'OP-456', 'date_received' => '2024-10-20', 'expiry_date' => '2025-10-20', 'current_quantity' => 60],
                ]
            ],
        ];

        foreach ($meds as $medData) {
            $batches = $medData['batches'];
            unset($medData['batches']);

            $medicine = MedicineCatalog::create($medData);
            
            // This now maps to sku_batch_id and current_quantity correctly
            $medicine->batches()->createMany($batches);
        }
    }
}