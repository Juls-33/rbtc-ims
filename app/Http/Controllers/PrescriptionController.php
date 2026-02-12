<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prescriptions;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'patient_id'      => 'required|integer',
            'medicine_name'   => 'required|string',
            'custom_medicine' => 'nullable|string',
            'dosage'          => 'required|string',
            'frequency'       => 'required|string',
            'time'            => 'nullable',
            'date_prescribed' => 'required|date',
        ]);

        // 2. Determine which medicine name to save
        $finalMedicineName = ($request->medicine_name === 'other') 
            ? $request->custom_medicine 
            : $request->medicine_name;

        // 3. Create the record
        Prescriptions::create([
            'patient_id'      => $request->patient_id,
            'staff_id'       => Auth::id(), // Get current doctor's ID
            'medicine_id'     => $request->medicine_id ?? 1,
            'medicine_name'   => $finalMedicineName,
            'dosage'          => $request->dosage,
            'frequency'       => $request->frequency,
            'schedule_time'            => $request->time,
            'date_prescribed' => $request->date_prescribed,
        ]);

        // 4. Send back to the profile with a success message
        return back()->with('message', 'Prescription saved successfully!');
    }

    public function destroy($id)
    {
        $prescription = \App\Models\Prescriptions::findOrFail($id);
        
        // Security check: Ensure only the doctor who wrote it (or an admin) can delete it
        if ($prescription->staff_id !== auth()->id()) {
            return back()->with('error', 'Unauthorized.');
        }

        $prescription->delete();

        return back()->with('message', 'Prescription deleted successfully.');
    }
}