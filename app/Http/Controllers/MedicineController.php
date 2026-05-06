<?php

namespace App\Http\Controllers;

use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\StockLog;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $allStats = MedicineCatalog::withSum('batches', 'current_quantity')->get()->map(function($m) use ($today) {
            $total = (int)$m->batches_sum_current_quantity;
            $status = $total === 0 ? 'OUT OF STOCK' : ($total <= ($m->reorder_point ?? 20) ? 'LOW STOCK' : 'IN STOCK');
            return [
                'status' => $status,
                'is_expiring' => $m->batches()->whereBetween('expiry_date', [$today, $today->copy()->addDays(30)])->exists()
            ];
        });

       $query = MedicineCatalog::query()
        ->withSum('batches as total_stock', 'current_quantity')
        ->withMin('batches as soonest_expiry', 'expiry_date'); 

        if ($request->search) {
            $searchTerm = "%{$request->search}%";
            $query->where(function($q) use ($searchTerm) {
                $q->where('generic_name', 'LIKE', $searchTerm)
                  ->orWhere('brand_name', 'LIKE', $searchTerm)
                  ->orWhere('category', 'LIKE', $searchTerm)
                  ->orWhere('sku_id', 'LIKE', $searchTerm);
            });
        }

        $sortField = $request->input('sort', 'generic_name'); // Default sort
        $sortDirection = $request->input('direction', 'asc');

        $sortMap = [
            'name' => 'generic_name',
            'calculatedTotal' => 'total_stock',
            'calculatedSoonest' => 'soonest_expiry',
            'calculatedStatus' => 'total_stock', // Sorting by total stock effectively sorts status
        ];

        $dbField = $sortMap[$sortField] ?? 'generic_name';
        $query->orderBy($dbField, $sortDirection);

        $inventoryPaginator = $query->with(['batches' => function($q) {
                $q->orderBy('expiry_date', 'asc'); 
            }])
            ->paginate(10)
            ->withQueryString();

        $inventoryPaginator->getCollection()->transform(function($medicine) {
            // 1. Get the current date (start of day) for strict comparison
            $today = Carbon::today();

            // 2. Filter batches to find ONLY those that are NOT expired
            $activeBatches = $medicine->batches->filter(function($batch) use ($today) {
                return Carbon::parse($batch->expiry_date)->startOfDay() >= $today;
            });

            // 3. Calculate Usable Total Stock
            $totalUsableStock = $medicine->batches->filter(function($batch) use ($today) {
                return $batch->current_quantity > 0 && Carbon::parse($batch->expiry_date)->startOfDay() >= $today;
            })->sum('current_quantity');

            // 4. Identify the first valid batch for default selection (FEFO)
            $defaultBatch = $medicine->batches->filter(function($batch) use ($today) {
                return $batch->current_quantity > 0 && Carbon::parse($batch->expiry_date)->startOfDay() >= $today;
            })->first();

            return [
                'id' => $medicine->id,
                'sku' => $medicine->sku_id,        
                'category' => $medicine->category, 
                'name' => $medicine->generic_name,
                'brand_name' => $medicine->brand_name, 
                'dosage' => $medicine->dosage,
                'price' => (float)$medicine->price_per_unit,

                'reorder_point' => (int)$medicine->reorder_point,
                
                'totalStock' => $totalUsableStock, // Usable units only
                'is_available' => $totalUsableStock > 0, // False if all stock is expired
                
                'default_batch' => $defaultBatch ? [
                    'id' => $defaultBatch->sku_batch_id,
                    'expiry' => $defaultBatch->expiry_date,
                    'stock' => $defaultBatch->current_quantity,
                ] : null,

                // 5. Still return all batches so they can be deleted in the modal
                'batches' => $medicine->batches->map(fn($b) => [
                    'id' => $b->sku_batch_id,
                    'expiry' => $b->expiry_date,
                    'stock' => $b->current_quantity,
                    'received' => $b->date_received,
                ]),
            ];
        });

        $logsQuery = StockLog::with(['medicine', 'batch.medicine', 'staff']);

        // 1. ADD: Universal Search for Logs
        if ($request->search) {
            $searchTerm = "%{$request->search}%";
            $logsQuery->where(function($q) use ($searchTerm) {
                $q->where('reason', 'LIKE', $searchTerm)
                // Check direct medicine link (Catalog Updates)
                ->orWhereHas('medicine', function($mq) use ($searchTerm) {
                    $mq->where('generic_name', 'LIKE', $searchTerm);
                })
                // Check through batch (Stock Ins/Dispensing)
                ->orWhereHas('batch.medicine', function($mq) use ($searchTerm) {
                    $mq->where('generic_name', 'LIKE', $searchTerm);
                })
                ->orWhereHas('staff', function($sq) use ($searchTerm) {
                    $sq->where('first_name', 'LIKE', $searchTerm)
                    ->orWhere('last_name', 'LIKE', $searchTerm);
                })
                ->orWhereHas('batch', function($bq) use ($searchTerm) {
                    $bq->where('sku_batch_id', 'LIKE', $searchTerm);
                });
            });
        }

        // 2. Paginate logs
        $logs = $logsQuery->latest()
            ->paginate(10, ['*'], 'log_page')
            ->withQueryString();

        // 3. Transform for Frontend
        $logs->getCollection()->transform(function($log) {
            return [
                'dateTime' => $log->created_at->format('Y-m-d H:i'),
                'id' => $log->batch->sku_batch_id ?? 'N/A',
                'medicine_name' => $log->medicine->generic_name 
                    ?? $log->batch->medicine->generic_name 
                    ?? 'Catalog Update',
                'action' => $log->change_amount != 0 ? ($log->change_amount > 0 ? 'STOCK IN' : 'DISPENSE') : 'CATALOG MOD',
                'amount' => (string)$log->change_amount, // Ensure it's a string for .startsWith check
                'reason' => $log->reason,
                'admin' => $log->staff ? $log->staff->first_name . ' ' . $log->staff->last_name : 'System',
            ];
        });
        return Inertia::render('Admin/MedicineInventory', [
            'inventory' => $inventoryPaginator, 
            'fullInventoryStats' => $allStats,
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'generic_name'   => 'required|string|max:255',
            'brand_name'     => 'nullable|string|max:255',
            'category'       => 'required|string|max:255',
            'dosage'         => 'required|string|max:255',
            'reorder_point'  => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        $cleanAlphanumeric = fn($str) => strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $str));
        $extractNumbers    = fn($str) => preg_replace('/[^0-9]/', '', $str);
        
        $genPart   = substr($cleanAlphanumeric($validated['generic_name']), 0, 4);
        $brandPart = substr($cleanAlphanumeric($validated['brand_name'] ?? ''), 0, 3);
        $dosePart  = $extractNumbers($validated['dosage']);

        $baseSku = $genPart . "-" . $brandPart . "-" . $dosePart;
        
        $nextSequence = 1;
        $sku = $baseSku . "-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        while (MedicineCatalog::where('sku_id', $sku)->exists()) {
            $nextSequence++;
            $sku = $baseSku . "-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        }

        return DB::transaction(function () use ($validated, $sku) {
            $validated['sku_id'] = $sku; 
            $medicine = MedicineCatalog::create($validated);

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'staff_id'      => auth()->id(), 
                'change_amount' => 0,
                'reason'        => "CATALOG: New medicine entry created.",
            ]);

            return redirect()->back()->with('success', 'Medicine added: ' . $sku);
        });
    }

    public function update(Request $request, $id)
    {
        $medicine = MedicineCatalog::findOrFail($id);
        $validated = $request->validate([
            'generic_name'   => 'required|string|max:255',
            'brand_name'     => 'nullable|string|max:255',
            'category'       => 'required|string|max:255',
            'dosage'         => 'required|string|max:255',
            'reorder_point'  => 'required|integer|min:0',
            'price_per_unit' => 'required|numeric|min:0',
        ]);

        $cleanAlphanumeric = fn($str) => strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $str));
        $extractNumbers    = fn($str) => preg_replace('/[^0-9]/', '', $str);
        
        $genPart   = substr($cleanAlphanumeric($validated['generic_name']), 0, 4);
        $brandPart = substr($cleanAlphanumeric($validated['brand_name'] ?? ''), 0, 3);
        $dosePart  = $extractNumbers($validated['dosage']);

        // --- FIXED TYPO HERE: Renamed $baseSku to $newBaseSku ---
        $newBaseSku = $genPart . "-" . $brandPart . "-" . $dosePart;
        $currentBase = preg_replace('/-\d{3}$/', '', $medicine->sku_id);

        if ($newBaseSku !== $currentBase) {
            $nextSequence = 1;
            $finalSku = "{$newBaseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
            
            // Ensure the new SKU doesn't collide with existing records
            while (MedicineCatalog::where('sku_id', $finalSku)->where('id', '!=', $id)->exists()) {
                $nextSequence++;
                $finalSku = "{$newBaseSku}-" . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
            }
            $validated['sku_id'] = $finalSku;
        }

        return DB::transaction(function () use ($medicine, $validated) {
            $medicine->update($validated);

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'staff_id'      => auth()->id(),
                'change_amount' => 0,
                'reason'        => "CATALOG: Medicine details and SKU updated.",
            ]);

            return redirect()->back()->with('success', 'Medicine updated successfully');
        });
    }

    public function destroy($id)
    {
        $medicine = MedicineCatalog::findOrFail($id);

        if ($medicine->batches()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete this medicine because it has associated stock batches. This prevents inventory errors.');
        }

        return DB::transaction(function () use ($medicine) {
            StockLog::create([
                'medicine_id'   => null,
                'staff_id'      => auth()->id(), 
                'batch_id'      => null,
                'change_amount' => 0,
                'reason'        => "CATALOG: Deleted medicine '{$medicine->generic_name}' and all its batches.",
            ]);

            $medicine->delete();
            return redirect()->back()->with('success', 'Medicine has been moved to the archive.');
        });
    }

    public function updateBatches(Request $request, $id)
    {
        $medicine = MedicineCatalog::findOrFail($id);
        $action = $request->input('action_type'); 
        $batchData = $request->input('batch');
        $reason = $request->input('reason', 'Manual Update');

        $redirect = null;

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
                
                // Calculate difference if stock is provided, otherwise keep current stock
                $newStock = isset($batchData['stock']) ? (int)$batchData['stock'] : $batch->current_quantity;
                $diff = $newStock - $batch->current_quantity;

                $updatePayload = [
                    'current_quantity' => $newStock,
                    'expiry_date' => $batchData['expiry'] ?? $batch->expiry_date 
                ];

                $batch->update($updatePayload);

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
                
                $isInUse = \App\Models\InpatientBillItem::where('batch_id', $batch->id)->exists() || 
                        \App\Models\MedicationLog::where('batch_number', $batch->sku_batch_id)->exists();

                if ($isInUse) {
                    return redirect()->back()->with('error', 'Critical: This batch cannot be deleted because it is already linked to patient medical records or billing statements.');
                }
                StockLog::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'staff_id' => $staffId,
                    'change_amount' => -$batch->current_quantity,
                    'reason' => "ARCHIVED: " . $reason, // Reason for archiving
                ]);

                \App\Models\Archive::create([
                    'archivable_id' => $batch->id,
                    'archivable_type' => MedicineBatch::class,
                    'data' => $batch->toJson(), 
                    'reason' => $reason,
                    'archived_by' => auth()->id(),
                    'archived_at'     => now(),
                    'scheduled_deletion_at' => now()->addDays(30),
                ]);

                $batch->delete();
            }
        });

        return redirect()->route('inventory.index')->with('success', 'Stock updated.');
    }
}