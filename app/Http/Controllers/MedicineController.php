<?php

namespace App\Http\Controllers;

use App\Models\MedicineCatalog;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index()
    {
        $inventory = MedicineCatalog::with('batches')->get()->map(function($medicine) {
            return [
                'id' => $medicine->id,
                'sku' => $medicine->sku_id,
                'name' => $medicine->generic_name,
                'brand_name' => $medicine->brand_name, 
                'dosage' => $medicine->dosage,
                'price' => $medicine->price_per_unit,
                'reorder_point' => $medicine->reorder_point,
                'category' => $medicine->category,
                'totalStock' => $medicine->batches->sum('stock_quantity'),
                'soonestExpiry' => $medicine->batches->min('expiry_date'),
                'status' => $medicine->batches->sum('stock_quantity') < 50 ? 'LOW STOCK' : 'IN STOCK',
                'batches' => $medicine->batches->map(fn($b) => [
                    'id' => $b->sku_batch_id,
                    'received' => $b->date_received,
                    'expiry' => $b->expiry_date,
                    'stock' => $b->current_quantity,
                ]),
            ];
        });

        return Inertia::render('Admin/MedicineInventory', [
            'inventory' => $inventory
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'reorder_point' => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        // 2. Generate Smart SKU
        
        // Helper to clean strings: Uppercase, remove special chars/spaces
        $clean = function($str) {
            return strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $str));
        };
        $part1 = $clean($validated['generic_name']);
        $part2 = $validated['brand_name'] ? '-' . $clean($validated['brand_name']) : ''; // Only add if brand exists
        $part3 = $clean($validated['dosage']);
        
        // Combine parts: GENERIC-BRAND-DOSAGE (or GENERIC-DOSAGE)
        $baseSku = "{$part1}{$part2}-{$part3}";

        // Truncate if it's too long (optional, but good for barcodes - e.g., max 20 chars base)
        // $baseSku = substr($baseSku, 0, 20); 

        // Find the next sequence number
        $nextSequence = 1;
        $sku = "{$baseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

        // Loop until unique
        while (MedicineCatalog::where('sku_id', $sku)->exists()) {
            $nextSequence++;
            $sku = "{$baseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        }
        $validated['sku_id'] = $sku;

        // 2. Create the Catalog Entry
        MedicineCatalog::create($validated);

        // 3. Redirect back (Inertia handles the page refresh automatically)
        return redirect()->back();
    }
    public function update(Request $request, $id)
    {
        // 1. Find the medicine
        $medicine = MedicineCatalog::findOrFail($id);

        // 2. Validate (Same rules as store, but SKU is excluded)
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'reorder_point' => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        // 3. Update the record
        $medicine->update($validated);

        return redirect()->back()->with('success', 'Medicine updated successfully');
    }
    public function destroy($id)
    {
        $medicine = MedicineCatalog::findOrFail($id);
        $medicine->delete();
        return redirect()->back()->with('success', 'Medicine deleted successfully.');
    }
}
