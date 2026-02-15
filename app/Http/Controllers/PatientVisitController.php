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
                'total_bill'  => $validated['checkup_fee'], // Set initial total bill
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
}