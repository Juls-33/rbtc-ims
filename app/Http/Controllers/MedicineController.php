<?php

namespace App\Http\Controllers;

use App\Models\MedicineCatalog;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\MedicineBatch;
use App\Models\StockLog;
use Illuminate\Support\Facades\DB;

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
                'totalStock' => $medicine->batches->sum('current_quantity'), // Fixed to current_quantity
                'soonestExpiry' => $medicine->batches->min('expiry_date'),
                'batches' => $medicine->batches->map(fn($b) => [
                    'id' => $b->sku_batch_id,
                    'received' => $b->date_received,
                    'expiry' => $b->expiry_date,
                    'stock' => $b->current_quantity,
                ]),
            ];
        });

        // Fetch Logs (New logic)
        // Assuming StockLog is your model name
        $logs = \App\Models\StockLog::with(['batch.medicine', 'staff'])
            ->latest()
            ->get()
            ->map(function($log) {
                return [
                    'dateTime' => $log->created_at->format('Y-m-d H:i'),
                    'id' => $log->batch->sku_batch_id ?? 'N/A',
                    'medicine_name' => $log->batch->medicine->generic_name ?? 'Unknown',
                    'action' => $log->change_amount > 0 ? 'STOCK IN' : 'DISPENSE',
                    'amount' => ($log->change_amount > 0 ? '+' : '') . $log->change_amount,
                    // Resulting Qty: You can calculate this or add a column to the table later
                    'newQty' => '---', 
                    'reason' => $log->reason,
                    'admin' => $log->staff ? $log->staff->first_name . ' ' . $log->staff->last_name : 'System',
                ];
            });

       return Inertia::render('Admin/MedicineInventory', [
            'inventory' => $inventory,
            'logs' => $logs 
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

    public function updateBatches(Request $request, $id)
    {
        $medicine = \App\Models\MedicineCatalog::findOrFail($id);
        $action = $request->input('action_type'); 
        $batchData = $request->input('batch');
        $reason = $request->input('reason', 'Manual Update');

        \Illuminate\Support\Facades\DB::transaction(function () use ($medicine, $action, $batchData, $reason) {
            // Find staff_id from the authenticated user
            $staffId = auth()->user()->staff_id ?? 1; // Fallback to 1 for testing if needed

            if ($action === 'add') {
                $batch = $medicine->batches()->create([
                    'sku_batch_id' => $batchData['id'],
                    'current_quantity' => $batchData['stock'],
                    'expiry_date' => $batchData['expiry'],
                    'date_received' => $batchData['received'],
                ]);

                \App\Models\StockLog::create([
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => $batchData['stock'],
                    'reason' => $reason,
                ]);
            } 
            
            elseif ($action === 'adjust') {
                // Find batch by the custom sku_batch_id
                $batch = \App\Models\MedicineBatch::where('sku_batch_id', $batchData['id'])->firstOrFail();
                $oldQty = $batch->current_quantity;
                $newQty = $batchData['stock'];
                $diff = $newQty - $oldQty;

                $batch->update(['current_quantity' => $newQty]);

                \App\Models\StockLog::create([
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => $diff,
                    'reason' => $reason,
                ]);
            }

            elseif ($action === 'delete') {
                $batch = \App\Models\MedicineBatch::where('sku_batch_id', $batchData['id'])->firstOrFail();
                
                \App\Models\StockLog::create([
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => -$batch->current_quantity,
                    'reason' => "Batch Deleted: " . $reason,
                ]);

                $batch->delete();
            }
        });

        return redirect()->route('inventory.index')->with('success', 'Stock updated.');
    }
}
