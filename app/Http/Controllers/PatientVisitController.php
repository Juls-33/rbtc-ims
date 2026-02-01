<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientVisitController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate the data based on your modal fields
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'visit_date' => 'required|date',
            'weight'     => 'nullable|string|max:20',
            'reason'     => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 2. Create the visit record
            PatientVisit::create($validated);

            // 3. Redirect back to the Outpatient tab with a success message
            return redirect()->back()->with('success', 'Patient visit recorded successfully.');
        });
    }
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'visit_date' => 'required|date',
            'weight'     => 'nullable|string',
            'reason'     => 'required|string',
        ]);

        \App\Models\PatientVisit::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Visit details updated.');
    }
}