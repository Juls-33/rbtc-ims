<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdmissionController extends Controller
{
    /**
     * Store a new admission record and update room status.
     */
    public function store(Request $request)
    {
        // 1. Validate the incoming data from the AdmitPatientModal
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
            'admission_date' => 'required|date',
        ]);

        // 2. Use a transaction to ensure both records update or neither do
        return DB::transaction(function () use ($validated) {  
            Admission::create([
                'patient_id'     => $validated['patient_id'],
                'staff_id'       => $validated['staff_id'],
                'room_id'        => $validated['room_id'],
                'diagnosis'      => $validated['diagnosis'],
                'admission_date' => $validated['admission_date'],
                'status'         => 'Admitted', // Default status
            ]);

            // Update the Room status so it's no longer "Available"
            Room::where('id', $validated['room_id'])->update([
                'status' => 'Occupied'
            ]);

            return redirect()->back()->with('success', 'Patient has been admitted successfully.');
        });
    }
    // app/Http/Controllers/AdmissionController.php
    public function update(Request $request, Admission $admission)
    {
        $validated = $request->validate([
            'admission_date' => 'required|date',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
        ]);

        return DB::transaction(function () use ($validated, $admission) {
            // If the patient is assigned to a NEW room
            if ($admission->room_id != $validated['room_id']) {
                // Free up the old room
                \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);
                // Occupy the new room
                \App\Models\Room::where('id', $validated['room_id'])->update(['status' => 'Occupied']);
            }

            $admission->update($validated);

            return redirect()->back()->with('success', 'Admission record updated successfully.');
        });
    }

    public function discharge(Request $request)
    {
        $validated = $request->validate([
            'admission_id'  => 'required|exists:admissions,id',
            'payment_type'  => 'required|in:full,none', // 'full' = Pay, 'none' = Discharge Only
            'amount_to_pay' => 'nullable|numeric|min:0', // Now nullable
        ]);

        return DB::transaction(function () use ($validated) {
            $admission = Admission::with('latest_bill')->findOrFail($validated['admission_id']);
            $bill = $admission->latest_bill;

            // 1. Clinical Cleanup: Always happens regardless of payment
            $admission->update([
                'status' => 'Discharged',
                'discharge_date' => now(),
            ]);

            // 2. Room Availability: Always freed up
            \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);

            // 3. Conditional Financial Logic
            if ($validated['payment_type'] === 'full' && $validated['amount_to_pay'] > 0) {
                
                // Check for overpayment
                if ($validated['amount_to_pay'] > $bill->total_amount) {
                    return redirect()->back()->withErrors(['amount_to_pay' => 'Payment exceeds balance.']);
                }

                $newBalance = $bill->total_amount - $validated['amount_to_pay'];
                
                $bill->update([
                    'total_amount' => $newBalance,
                    'status'    => ($newBalance <= 0) ? 'PAID' : 'UNPAID',
                    'date_paid' => ($newBalance <= 0) ? now() : null,
                ]);
            } 
            // If payment_type is 'none', we do nothing to the bill. 
            // It stays as 'UNPAID' with the original total.

            return redirect()->back()->with('success', 'Patient status updated.');
        });
    }
}