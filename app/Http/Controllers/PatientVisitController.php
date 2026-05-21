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
            'staff_id'    => 'required|exists:staff,id',
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
            'staff_id'    => 'required|exists:staff,id',
            'weight'      => 'nullable|string',
            'checkup_fee' => 'required|numeric|min:0', // New validation rule
            'reason'      => 'required|string',
        ]);

        PatientVisit::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Visit details updated.');
    }
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'reason'   => 'required|string|min:5',
        ]);

        return DB::transaction(function () use ($id, $request) {
            $visit = PatientVisit::with(['patient', 'bill_items'])->findOrFail($id);
            $staff = auth()->user();

            foreach ($visit->bill_items as $item) {
                if ($item->batch_id) { 
                    $batch = \App\Models\MedicineBatch::find($item->batch_id);
                    if ($batch) {
                        $batch->increment('current_quantity', $item->quantity);
                        
                        \App\Models\StockLog::create([
                            'medicine_id'   => $item->medicine_id,
                            'batch_id'      => $item->batch_id,
                            'staff_id'      => $staff->id,
                            'change_amount' => $item->quantity,
                            'reason'        => "RESTOCKED: Deleted Outpatient Visit #{$id}",
                        ]);
                    }
                }
            }

            $visit->archive($request->reason, $staff->id);

            \App\Models\PatientLog::create([
                'staff_id'    => $staff->id,
                'patient_id'  => $visit->patient_id,
                'action'      => 'VISIT_DELETED',
                'description' => "Outpatient visit record deleted. Reason: {$request->reason}",
                'ip_address'  => $request->ip(),
            ]);

            $visit->bill_items()->delete();
            $visit->delete();

            return redirect()->back()->with('success', 'Visit record archived and removed.');
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