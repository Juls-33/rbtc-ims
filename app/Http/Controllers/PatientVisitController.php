<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientVisitController extends Controller
{
    public function store(Request $request)
    {
       $validated = $request->validate([
            'patient_id'  => 'required|exists:patients,id',
            'visit_date'  => 'required|date',
            'weight'      => 'nullable|numeric',
            'checkup_fee' => 'required|numeric|min:0',
            'reason'      => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // Just create the visit. 
            // The checkup_fee is stored here and will be the "base" for our bill.
            PatientVisit::create([
                'patient_id'  => $validated['patient_id'],
                'visit_date'  => $validated['visit_date'],
                'weight'      => $validated['weight'],
                'checkup_fee' => $validated['checkup_fee'],
                'reason'      => $validated['reason'],
                'status'      => 'PENDING',
                'total_bill'  => $validated['checkup_fee'], 
                'amount_paid' => 0, 
                'balance'     => $validated['checkup_fee'],
            ]);

            return redirect()->back()->with('success', 'Visit recorded successfully.');
        });
        
    }

    public function update(Request $request, $id)
    {
        // 3. Ensure 'checkup_fee' is also updatable
        $validated = $request->validate([
            'visit_date'  => 'required|date',
            'weight'      => 'nullable|string',
            'checkup_fee' => 'required|numeric|min:0', // New validation rule
            'reason'      => 'required|string',
        ]);

        PatientVisit::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Visit details updated.');
    }
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            // 1. Find the visit with all its items
            $visit = PatientVisit::with('bill_items')->findOrFail($id);
            $staffId = auth()->id();

            // 2. RESTOCK INVENTORY
            foreach ($visit->bill_items as $item) {
                $batch = \App\Models\MedicineBatch::find($item->batch_id);
                
                if ($batch) {
                    // Add the quantity back to the shelf
                    $batch->increment('current_quantity', $item->quantity);

                    // Log the restocking for audit trails
                    \App\Models\StockLog::create([
                        'medicine_id'   => $item->medicine_id,
                        'batch_id'      => $item->batch_id,
                        'staff_id'      => $staffId,
                        'change_amount' => $item->quantity,
                        'reason'        => "RESTOCKED: Deleted Bill #{$visit->visit_id}",
                    ]);
                }
            }

            // 3. Delete the line items first (Foreign Key requirement)
            $visit->bill_items()->delete();

            // 4. Delete the visit itself
            $visit->delete();

            return redirect()->back()->with('success', 'Visit record deleted and medicines returned to stock.');
        });
    }
    public function updateFee(Request $request, $id)
    {
        $request->validate([
            'checkup_fee' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $visit = PatientVisit::with('bill_items')->findOrFail($id);
            
            $visit->checkup_fee = $request->checkup_fee;

            $medsTotal = $visit->bill_items->sum('total_price');
            $visit->total_bill = (float)$visit->checkup_fee + (float)$medsTotal;
            $visit->balance = max(0, $visit->total_bill - (float)$visit->amount_paid);
            
            $visit->save();

            return redirect()->back()->with('success', 'Consultation fee updated.');
        });
    }
}