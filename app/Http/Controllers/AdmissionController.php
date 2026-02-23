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
        // 1. Validate the incoming data
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
            'admission_date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated) {  
            // 2. Fetch the room to get its current rate
            $room = Room::findOrFail($validated['room_id']);

            // 3. Create the Admission
            $admission = Admission::create([
                'patient_id'     => $validated['patient_id'],
                'staff_id'       => $validated['staff_id'],
                'room_id'        => $validated['room_id'],
                'diagnosis'      => $validated['diagnosis'],
                'admission_date' => $validated['admission_date'],
                'status'         => 'Admitted',
                'amount_paid'    => 0,
            ]);

            // 4. Create the Initial Room Stay (This triggers Day 1 math)
            $admission->roomStays()->create([
                'room_id'    => $room->id,
                'daily_rate' => $room->room_rate,
                'start_date' => $validated['admission_date'],
                'end_date'   => null,
            ]);

            // 5. Update Room status
            $room->update(['status' => 'Occupied']);

            // 6. 🔥 THE CRITICAL STEP: Sync totals immediately
            // This ensures total_bill and balance are updated from 0 to the Room Rate
            $admission->refresh(); 
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient admitted. Initial room charges have been applied.');
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

    public function destroy(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        return DB::transaction(function () use ($id, $request) {
            $admission = Admission::with(['billItems', 'room'])->findOrFail($id);

            // 1. Return stock to inventory for all meds in this admission
            foreach ($admission->billItems as $item) {
                $batch = \App\Models\MedicineBatch::find($item->batch_id);
                if ($batch) {
                    $batch->increment('current_quantity', $item->quantity);
                }
            }

            // 2. If patient was currently in a room, set room back to Available
            if ($admission->status === 'Admitted') {
                $admission->room->update(['status' => 'Available']);
            }

            // 3. Log the deletion for audit trails
            \Log::info("Admission ID #{$id} deleted. Reason: " . $request->reason);

            $admission->delete();

            return redirect()->back()->with('success', 'Admission record permanently removed and stock returned.');
        });
    }

    public function discharge(Request $request)
    {
        $validated = $request->validate([
            'admission_id'  => 'required|exists:admissions,id',
            'payment_type'  => 'required|in:full,none',
            'amount_to_pay' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $admission = Admission::findOrFail($validated['admission_id']);

            // 1. Clinical Closure: Set discharge date and release room
            $admission->update([
                'status' => 'Discharged',
                'discharge_date' => now(),
            ]);

            // "Close" the active room stay by setting end_date
            $admission->roomStays()->whereNull('end_date')->update(['end_date' => now()]);

            // Release the physical room
            \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);

            // 2. Financial Closure: Record the tender
            if ($validated['payment_type'] === 'full' && $validated['amount_to_pay'] > 0) {
                $newPaidTotal = round((float)$admission->amount_paid + (float)$validated['amount_to_pay'], 2);
                $admission->update(['amount_paid' => $newPaidTotal]);
            }

            // 3. Final Snap Sync: Overwrite DB columns with the finalized static numbers
            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient has been officially discharged.');
        });
    }
    public function calculateCurrentTotal()
    {
        $total = 0;

        // 1. Calculate Room Charges based on 24-hour blocks
        foreach ($this->roomStays as $stay) {
            $start = \Carbon\Carbon::parse($stay->start_date);
            // If the stay hasn't ended (patient still in room), use current time
            $end = $stay->end_date ? \Carbon\Carbon::parse($stay->end_date) : now();

            // Calculate full 24-hour days. 
            // Use ceil() if you charge a full day for any partial day, 
            // or diffInDays() for strict 24-hour blocks.
            $days = max(1, $start->diffInDays($end)); 
            
            $total += ($days * $stay->daily_rate);
        }

        // 2. Add Medication and Manual Items
        $itemsTotal = $this->billItems()->sum('total_price');

        return $total + $itemsTotal;
    }
    public function transferRoom(Request $request, $admissionId)
    {
        $request->validate([
            'new_room_id' => 'required|exists:rooms,id',
        ]);

        return DB::transaction(function () use ($request, $admissionId) {
            $admission = Admission::findOrFail($admissionId);
            $newRoom = Room::findOrFail($request->new_room_id);

            // 1. "Close" the current room stay
            $currentStay = $admission->roomStays()->whereNull('end_date')->first();
            if ($currentStay) {
                $currentStay->update(['end_date' => now()]);
            }

            // 2. "Open" the new room stay with the current room's rate
            $admission->roomStays()->create([
                'room_id' => $newRoom->id,
                'daily_rate' => $newRoom->room_rate, // Snapshot the price
                'start_date' => now(),
            ]);

            // 3. Update the main admission record for quick reference
            $admission->update(['room_id' => $newRoom->id]);

            return redirect()->back()->with('success', 'Room transfer recorded.');
        });
    }
}