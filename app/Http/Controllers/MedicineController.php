<?php

namespace App\Http\Controllers;

use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\StockLog;
use Inertia\Inertia;
use Illuminate\Http\Request;
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
                'totalStock' => $medicine->batches->sum('current_quantity'),
                'soonestExpiry' => $medicine->batches->min('expiry_date'),
                'batches' => $medicine->batches->map(fn($b) => [
                    'id' => $b->sku_batch_id,
                    'received' => $b->date_received,
                    'expiry' => $b->expiry_date,
                    'stock' => $b->current_quantity,
                ]),
            ];
        });

        $logs = StockLog::with(['batch.medicine', 'staff'])
            ->latest()
            ->get()
            ->map(function($log) {
                return [
                    'dateTime' => $log->created_at->format('Y-m-d H:i'),
                    'id' => $log->batch->sku_batch_id ?? 'N/A',
                    'medicine_name' => $log->batch->medicine->generic_name ?? 'Catalog Update',
                    'action' => $log->change_amount != 0 ? ($log->change_amount > 0 ? 'STOCK IN' : 'DISPENSE') : 'CATALOG MOD',
                    'amount' => $log->change_amount == 0 ? '—' : ($log->change_amount > 0 ? '+' : '') . $log->change_amount,
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
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'reorder_point' => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        $clean = fn($str) => strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $str));
        $baseSku = $clean($validated['generic_name']) . ($validated['brand_name'] ? '-' . $clean($validated['brand_name']) : '') . '-' . $clean($validated['dosage']);
        
        $nextSequence = 1;
        $sku = "{$baseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        while (MedicineCatalog::where('sku_id', $sku)->exists()) {
            $nextSequence++;
            $sku = "{$baseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        }

        return DB::transaction(function () use ($validated, $sku) {
            $validated['sku_id'] = $sku;
            $medicine = MedicineCatalog::create($validated);

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'staff_id'      => auth()->id(), // FIX: Use auth id (integer)
                'batch_id'      => null, 
                'change_amount' => 0,
                'reason'        => "CATALOG: New medicine entry created.",
            ]);

            return redirect()->back();
        });
    }

    public function update(Request $request, $id)
    {
        $medicine = MedicineCatalog::findOrFail($id);
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'reorder_point' => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($medicine, $validated) {
            $medicine->update($validated);

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'staff_id'      => auth()->id(), // FIX: Use auth id (integer)
                'batch_id'      => null,
                'change_amount' => 0,
                'reason'        => "CATALOG: Medicine details updated.",
            ]);

            return redirect()->back()->with('success', 'Medicine updated successfully');
        });
    }

    public function destroy($id)
    {
        $medicine = MedicineCatalog::findOrFail($id);

        return DB::transaction(function () use ($medicine) {
            StockLog::create([
                'medicine_id'   => null,
                'staff_id'      => auth()->id(), // FIX: Use auth id (integer)
                'batch_id'      => null,
                'change_amount' => 0,
                'reason'        => "CATALOG: Deleted medicine '{$medicine->generic_name}' and all its batches.",
            ]);

            $medicine->delete();
            return redirect()->back()->with('success', 'Medicine deleted successfully.');
        });
    }

    public function updateBatches(Request $request, $id)
    {
        $medicine = MedicineCatalog::findOrFail($id);
        $action = $request->input('action_type'); 
        $batchData = $request->input('batch');
        $reason = $request->input('reason', 'Manual Update');

        DB::transaction(function () use ($medicine, $action, $batchData, $reason) {
            $staffId = auth()->id(); // FIX: Use numeric ID directly

            if ($action === 'add') {
                $batch = $medicine->batches()->create([
                    'sku_batch_id' => $batchData['id'],
                    'current_quantity' => $batchData['stock'],
                    'expiry_date' => $batchData['expiry'],
                    'date_received' => $batchData['received'],
                ]);

                StockLog::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => $batchData['stock'],
                    'reason' => "ADD: " . $reason,
                ]);
            } 
            
            elseif ($action === 'adjust') {
                $batch = MedicineBatch::where('sku_batch_id', $batchData['id'])->firstOrFail();
                $diff = $batchData['stock'] - $batch->current_quantity;

                $batch->update(['current_quantity' => $batchData['stock']]);

                StockLog::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => $diff,
                    'reason' => "ADJUST: " . $reason,
                ]);
            }

            elseif ($action === 'delete') {
                $batch = MedicineBatch::where('sku_batch_id', $batchData['id'])->firstOrFail();
                
                StockLog::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => -$batch->current_quantity,
                    'reason' => "BATCH REMOVAL: " . $reason,
                ]);

                $batch->delete();
            }
        });

        return redirect()->route('inventory.index')->with('success', 'Stock updated.');
    }
}