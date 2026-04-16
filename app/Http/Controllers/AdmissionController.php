<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Patient;
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
            'admission_date' => 'required|date|before_or_equal:now',
            'monthly_rate'   => 'required|numeric|min:0', 
        ]);

        return DB::transaction(function () use ($validated) {
            $room = \App\Models\Room::findOrFail($validated['room_id']);
            
            // 1. Create the Admission record
            $admission = \App\Models\Admission::create([
                'patient_id'     => $validated['patient_id'],
                'staff_id'       => $validated['staff_id'],
                'room_id'        => $validated['room_id'],
                'diagnosis'      => $validated['diagnosis'],
                'admission_date' => $validated['admission_date'],
                'monthly_rate'   => $validated['monthly_rate'],
                'status'         => 'Admitted',
                'amount_paid'    => 0,
            ]);

            // 2. TRIGGER GENERATION 
            $admission->generateMonthlyBills();

            // 3. Update room status
            $room->update(['status' => 'Occupied']);

            // 4. Force a financial sync
            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient admitted. Billing cycle generated.');
        });
    }

    public function update(Request $request, Admission $admission)
    {
        $validated = $request->validate([
            'admission_date' => 'required|date|before_or_equal:now',
            'staff_id'       => 'required|exists:staff,id',
            'room_id'        => 'required|exists:rooms,id',
            'diagnosis'      => 'required|string|max:100',
            'monthly_rate'   => 'required|numeric|min:0', 
        ]);

        $dateChanged = \Carbon\Carbon::parse($admission->admission_date)->ne(\Carbon\Carbon::parse($validated['admission_date']));
    
        if ($admission->is_billing_locked && $dateChanged) {
            return back()->withErrors([
                'admission_date' => 'The admission date cannot be changed because items have already been billed or payments have been made.'
            ]);
        }

        return DB::transaction(function () use ($validated, $admission) {
            $newDate = \Carbon\Carbon::parse($validated['admission_date']);
            $diffInMonths = $newDate->diffInMonths(now()) + 1;
            $newTotalNeeded = max(6, $diffInMonths);

            for ($i = 0; $i < $newTotalNeeded; $i++) {
                $start = $newDate->copy()->addMonths($i);
                $end = $newDate->copy()->addMonths($i + 1)->subDay();

                $bill = $admission->bills()->where('month_number', $i + 1)->first();

                if ($bill) {
                    $feeUpdate = ($bill->payment_status !== 'PAID') ? $validated['monthly_rate'] : $bill->facility_fee;
                    $feeDiff = $feeUpdate - $bill->facility_fee;

                    $bill->update([
                        'period_start' => $start->toDateString(),
                        'period_end'   => $end->toDateString(),
                        'facility_fee' => $feeUpdate,
                        'total_amount' => $bill->total_amount + $feeDiff
                    ]);
                } else {
                    $admission->bills()->create([
                        'month_number' => $i + 1,
                        'period_start' => $start->toDateString(),
                        'period_end'   => $end->toDateString(),
                        'facility_fee' => $validated['monthly_rate'],
                        'total_amount' => $validated['monthly_rate'],
                        'payment_status' => 'UNPAID',
                        'date_issued'  => $start->toDateString(),
                    ]);
                }
            }

            $surplusBills = $admission->bills()->where('month_number', '>', $newTotalNeeded)->get();
            foreach ($surplusBills as $sb) {
                $hasItems = \App\Models\InpatientBillItem::where('bill_id', $sb->id)->exists();
                if ($sb->amount_paid <= 0 && !$hasItems) {
                    $sb->delete();
                }
            }

            $admission->update($validated);
            $admission->refresh(); 
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Admission updated successfully.');
        });
    }
    

    public function destroy(Request $request, $id)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'reason'   => 'required|string|min:5',
        ]);

        return DB::transaction(function () use ($id, $request) {
            $admission = Admission::with(['patient', 'room', 'billItems', 'bills'])->findOrFail($id);
            $staff = auth()->user();

            // 1. Return medicine stock
            foreach ($admission->billItems as $item) {
                $batch = \App\Models\MedicineBatch::find($item->batch_id);
                if ($batch) {
                    $batch->increment('current_quantity', $item->quantity);
                }
            }

            // 2. Free up the room
            if ($admission->status === 'Admitted') {
                $admission->room->update(['status' => 'Available']);
            }

            // 3. MOVE TO ARCHIVES (Using your polymorphic schema)
            $admission->archive($request->reason, $staff->id);

            // 4. CREATE AUDIT LOG
            \App\Models\PatientLog::create([
                'staff_id'    => $staff->id,
                'patient_id'  => $admission->patient_id,
                'action'      => 'ADMISSION_DELETED',
                'description' => "Admission record (ID: ADM-".str_pad($id, 5, '0', STR_PAD_LEFT).") archived/deleted. Reason: {$request->reason}",
                'ip_address'  => $request->ip(),
            ]);

            // 5. Cleanup Bills and the Admission record
            $admission->bills()->delete();
            $admission->delete(); // This triggers SoftDelete

            return redirect()->back()->with('success', 'Admission record archived and room released.');
        });
    }

    public function discharge(Request $request)
    {
        $validated = $request->validate([
            'admission_id'  => 'required|exists:admissions,id',
            'payment_type'  => 'required|in:full,none',
            'amount_to_pay' => 'nullable|numeric|min:0',
            'payment_source' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Fetch the admission with all monthly bills ordered by oldest first
            $admission = Admission::with(['bills' => function($q) {
                $q->orderBy('month_number', 'asc');
            }])->findOrFail($validated['admission_id']);

            // 2. Update basic discharge info
            $admission->update([
                'status' => 'Discharged',
                'discharge_date' => now(),
            ]);
            
            $admission->roomStays()->whereNull('end_date')->update(['end_date' => now()]);
            \App\Models\Room::where('id', $admission->room_id)->update(['status' => 'Available']);

            // 3. WATERFALL PAYMENT LOGIC
            $paymentAmount = (float)($validated['amount_to_pay'] ?? 0);

            $paymentSource = $validated['payment_source'] ?? 'Cash';

            if ($validated['payment_type'] === 'full' && $paymentAmount > 0) {
                $remainingPayment = $paymentAmount;

                foreach ($admission->bills as $bill) {
                    if ($remainingPayment <= 0) break;

                    // Calculate how much is still owed for THIS specific month
                    $billTotal = (float)$bill->total_amount;
                    $alreadyPaid = (float)$bill->amount_paid;
                    $billOwed = max(0, $billTotal - $alreadyPaid);

                    if ($billOwed <= 0) continue; // Skip if this month is already fully paid

                    if ($remainingPayment >= $billOwed) {
                        // Scenario: We have enough to pay off this entire month
                        $bill->update([
                            'amount_paid' => $billTotal,
                            'payment_status' => 'PAID',
                            'payment_source' => $paymentSource,
                        ]);
                        $remainingPayment -= $billOwed;
                    } else {
                        // Scenario: We only have enough for a partial payment of this month
                        $newAmountPaid = $alreadyPaid + $remainingPayment;
                        $bill->update([
                            'amount_paid' => $newAmountPaid,
                            'payment_status' => 'PARTIAL',
                            'payment_source' => $paymentSource,
                        ]);
                        $remainingPayment = 0; // All money used up
                    }
                }

                // 4. Update the global amount_paid column on the Admission record
                $newGlobalPaid = round((float)$admission->amount_paid + $paymentAmount, 2);
                $admission->update(['amount_paid' => $newGlobalPaid]);
            }

            // 5. Final Sync to ensure Admission total_bill and balance are healthy
            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Patient discharged and payment distributed across billing cycles.');
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