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
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
            'admission_date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated) {  
            $room = Room::findOrFail($validated['room_id']);

            $admission = Admission::create([
                'patient_id'     => $validated['patient_id'],
                'staff_id'       => $validated['staff_id'],
                'room_id'        => $validated['room_id'],
                'diagnosis'      => $validated['diagnosis'],
                'admission_date' => $validated['admission_date'],
                'status'         => 'Admitted',
                'amount_paid'    => 0,
            ]);

            $admission->roomStays()->create([
                'room_id'    => $room->id,
                'daily_rate' => $room->room_rate,
                'start_date' => $validated['admission_date'],
                'end_date'   => null,
            ]);

            $room->update(['status' => 'Occupied']);
            $admission->refresh(); 
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient admitted. Initial room charges have been applied.');
        });
    }
    public function update(Request $request, Admission $admission)
    {
        $validated = $request->validate([
            'admission_date' => 'required|date',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
        ]);

        return DB::transaction(function () use ($validated, $admission) {
            if ($admission->room_id != $validated['room_id']) {
                \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);
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
            foreach ($admission->billItems as $item) {
                $batch = \App\Models\MedicineBatch::find($item->batch_id);
                if ($batch) {
                    $batch->increment('current_quantity', $item->quantity);
                }
            }
            if ($admission->status === 'Admitted') {
                $admission->room->update(['status' => 'Available']);
            }
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

            $admission->update([
                'status' => 'Discharged',
                'discharge_date' => now(),
            ]);
            $admission->roomStays()->whereNull('end_date')->update(['end_date' => now()]);

            \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);

            if ($validated['payment_type'] === 'full' && $validated['amount_to_pay'] > 0) {
                $newPaidTotal = round((float)$admission->amount_paid + (float)$validated['amount_to_pay'], 2);
                $admission->update(['amount_paid' => $newPaidTotal]);
            }

            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient has been officially discharged.');
        });
    }
    public function calculateCurrentTotal()
    {
        $total = 0;

        foreach ($this->roomStays as $stay) {
            $start = \Carbon\Carbon::parse($stay->start_date);
            $end = $stay->end_date ? \Carbon\Carbon::parse($stay->end_date) : now();


            // Calculate full 24-hour days. 
            $days = max(1, $start->diffInDays($end)); 
            
            $total += ($days * $stay->daily_rate);
        }

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

            $currentStay = $admission->roomStays()->whereNull('end_date')->first();
            if ($currentStay) {
                $currentStay->update(['end_date' => now()]);
            }

            $admission->roomStays()->create([
                'room_id' => $newRoom->id,
                'daily_rate' => $newRoom->room_rate, 
                'start_date' => now(),
            ]);

            $admission->update(['room_id' => $newRoom->id]);

            return redirect()->back()->with('success', 'Room transfer recorded.');
        });
    }
}