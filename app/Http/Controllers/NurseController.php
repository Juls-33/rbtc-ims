<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\PatientVisit;
use App\Models\Patient;
use App\Models\Prescriptions;
use App\Models\MedicineCatalog;
use App\Models\MedicationLog;
use App\Models\MedicineBatch;
use App\Models\Admission;      
use App\Models\BillDetail;       
use App\Models\InpatientBillItem;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NurseController extends Controller
{
    public function dashboard(Request $request)
    {
        $nurseId = auth()->id();
        $now = now();
        $today = now()->toDateString();
        
        $prescriptions = Prescriptions::with(['patient.active_admission', 'medicine'])
        ->whereHas('patient.admissions', function($q) {
            $q->where('status', 'admitted');
        })
        ->whereNotNull('schedule_time')
        ->get();

        $administrations = $prescriptions->map(function ($p) use ($now) {
            $lastLog = MedicationLog::where('prescription_id', $p->id)
                ->latest('administered_at')
                ->first();

            $shouldShow = false;
            $nextDueTime = null;
            $freq = $p->frequency;

            if (!$lastLog) {
                // Initial dose logic: Compare current time to the doctor's scheduled start time
                $initialDue = Carbon::createFromFormat('H:i', $p->schedule_time);
                if ($initialDue->isPast()) $shouldShow = true;
                $nextDueTime = $initialDue;
            } else {
                $lastAdmin = Carbon::parse($lastLog->administered_at);

                // Define the hour intervals for each dropdown option
                $hours = match (true) {
                    str_contains($freq, 'Every 4 Hours') => 4,
                    str_contains($freq, 'Every 6 Hours') => 6,
                    str_contains($freq, 'Every 8 Hours') => 8,
                    str_contains($freq, 'Every 12 Hours') => 12,
                    str_contains($freq, 'Four Times Daily') => 6,  // 24/4
                    str_contains($freq, 'Three Times Daily') => 8, // 24/3
                    str_contains($freq, 'Twice Daily') => 12,      // 24/2
                    str_contains($freq, 'As Needed (PRN)') => 0,   // PRN is always visible
                    default => null, // Once Daily or Special Instructions
                };

                if ($hours === 0) {
                    // PRN logic: Show if at least 1 hour has passed (prevent accidental double-click)
                    $shouldShow = $lastAdmin->diffInMinutes($now) >= 60;
                    $nextDueTime = $lastAdmin->addHour();
                } elseif ($hours !== null) {
                    // Interval logic: Reappear exactly X hours after last administration
                    $nextDueTime = $lastAdmin->addHours($hours);
                    $shouldShow = $now->greaterThanOrEqualTo($nextDueTime);
                } else {
                    // "Once Daily" or "Bedtime" logic: Show only if it hasn't been done today
                    // and the scheduled hour has arrived.
                    $scheduledTime = Carbon::createFromFormat('H:i', $p->schedule_time);
                    if (!$lastAdmin->isToday() && $now->hour >= $scheduledTime->hour) {
                        $shouldShow = true;
                        $nextDueTime = $scheduledTime;
                    }
                }
            }

            if (!$shouldShow) return null;

        // 3. Formatting for the Frontend
        $displayName = $p->medicine 
            ? ($p->medicine->brand_name ? "{$p->medicine->generic_name} ({$p->medicine->brand_name})" : $p->medicine->generic_name)
            : ($p->medicine_name ?? 'Unknown Medicine');

        return [
            'time'              => $nextDueTime ? $nextDueTime->format('g:i A') : 'Due Now',
            'isOverdue'         => $nextDueTime ? $nextDueTime->isPast() : true,
            'id'                => $p->patient->patient_id ?? 'N/A',
            'prescription_id'   => $p->id,
            'medicine_id'       => $p->medicine_id,
            'db_id'             => $p->patient->id,
            'name'              => $p->patient->full_name ?? 'Unknown',
            'room'              => $p->patient->active_admission?->room?->room_location ?? 'TBD',
            'medication'        => $displayName,
            'dosage'            => $p->dosage . ' (' . $p->frequency . ')',
        ];
    })->filter()->values();

        $stats = [
            'overdue_count' => $administrations->where('isOverdue', true)->count(),
            // Fix 2: Real-time count of nurse's work today
            'administered_today' => MedicationLog::where('nurse_id', $nurseId)
                                    ->whereDate('administered_at', now()->today())
                                    ->count(),
            'next_up' => $administrations->where('isOverdue', false)->sortBy('time')->first(),
        ];

        $batches = MedicineBatch::where('current_quantity', '>', 0)
                ->whereDate('expiry_date', '>', now())
                ->get();

        return Inertia::render('Nurse/Dashboard', [
            'auth' => [
                'user' => array_merge($request->user()->toArray(), [
                    'db_id' => $request->user()->id,
                    'name'  => "Nurse " . $request->user()->last_name, // Matches your Profile logic
                    'id'    => $request->user()->staff_id,
                ]),
            ],
            'administrations' => $administrations,
            'stats' => $stats,
            'batches' => $batches
        ]);
    }

    public function patients(Request $request)
    {
        // 1. Build Query - Start with the "Only Admitted" constraint
        $query = Patient::whereHas('admissions', function($q) {
            $q->where('status', 'admitted');
        });

        // 2. SEARCH: Exact Word Match (Only searching within Admitted patients)
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->whereBlind('first_name', 'first_name_index', $searchTerm)
                ->orWhereBlind('last_name', 'last_name_index', $searchTerm)
                ->orWhere('id', $searchTerm); 
            });
        }

        // 3. SORTING: Raw DB columns only
        $sortKey = $request->input('sort', 'id');
        $sortDir = $request->input('direction', 'desc');
        $sortMap = ['id' => 'id', 'dob' => 'birth_date'];
        $dbSortKey = $sortMap[$sortKey] ?? 'id';

        // 4. PAGINATE & TRANSFORM
        $patientsPaginator = $query->with(['admissions' => function($q) {
                $q->where('status', 'admitted'); 
            }])
            ->orderBy($dbSortKey, $sortDir)
            ->paginate(10)
            ->withQueryString();

        $patientsPaginator->getCollection()->transform(function ($p) {
            $active = $p->admissions->first();
            
            return [
                'id'      => $p->id,
                'p_id'    => $p->patient_id, 
                'name'    => $p->full_name,
                'dob'     => $p->birth_date,
                'contact' => $p->contact_no,
                'status'  => 'ADMITTED', // Hardcoded as the query ensures this
            ];
        });

        return Inertia::render('Nurse/Patients', [
            'patients' => $patientsPaginator,
            'filters'  => $request->only(['search', 'sort', 'direction'])
        ]);
    }

    public function showPatient($id)
    {
        $numericId = is_numeric($id) ? (int)$id : (int)str_replace('P-', '', $id);

        $patient = Patient::with(['prescriptions.medicine', 'admissions.room', 'visits.staff'])
            ->findOrFail($numericId);

        $latestAdmission = $patient->admissions->sortByDesc('admission_date')->first();
        $latestVisit = $patient->visits()->latest()->first();

        return Inertia::render('Nurse/PatientProfile', [
            'patient' => [
                'db_id'            => $patient->id,
                'id'               => $patient->patient_id, 
                'name'             => $patient->full_name,
                'dob'              => $patient->birth_date,
                'gender'           => $patient->gender,
                'phone'            => $patient->contact_no,
                'address'          => $patient->address,
                'emergencyContact' => $patient->emergency_contact_name,
                'emergencyPhone'   => $patient->emergency_contact_number,
                'status'           => $latestAdmission ? strtoupper($latestAdmission->status) : 'OUTPATIENT',
                'admissionDate'    => $latestAdmission?->admission_date ?? 'N/A',
                'room'             => $latestAdmission?->room?->room_location ?? 'N/A',
                'doctor'           => $latestAdmission?->staff ? "Dr. {$latestAdmission->staff->last_name}" : 'N/A',
                'diagnosis'        => $latestAdmission?->diagnosis ?? 'No diagnosis recorded.',
                // Current Vitals
                'weight'           => $latestVisit?->weight ?? '—',
                'bp'               => $latestVisit?->blood_pressure ?? '—', 
                'hr'               => $latestVisit?->heart_rate ?? '—', 
                'temp'             => $latestVisit?->temperature ?? '—',
            ],  

            'availableBatches' => MedicineBatch::where('expiry_date', '>', now())
            ->where('current_quantity', '>', 0)
            ->get()
            ->map(function ($batch) {
                return [
                    'sku_batch_id'     => $batch->sku_batch_id,
                    'medicine_id'      => (int) $batch->medicine_id, // Ensure it's a number
                    'current_quantity' => (int) $batch->current_quantity,
                    'expiry_date'      => $batch->expiry_date
                ];
            }),

            'prescriptionHistory' => $patient->prescriptions->sortByDesc('created_at')->values()->map(function($pres) {
                if ($pres->medicine) {
                    $displayName = $pres->medicine->brand_name 
                        ? "{$pres->medicine->generic_name} ({$pres->medicine->brand_name})" 
                        : $pres->medicine->generic_name;
                    } else {
                        $displayName = $pres->medicine_name ?? 'Unknown';
                }
                return [
                    'id'            => $pres->id,
                    'medicine_id'   => $pres->medicine_id,
                    'medicine_name' => $displayName,
                    'dosage' => $pres->dosage ?? 'N/A',
                    'frequency' => $pres->frequency ?? 'N/A',
                    'time' => $pres->schedule_time ?? 'N/A',
                    'date' => $pres->date_prescribed ?? 'N/A',
                    'last_administered' => $pres->logs()->latest()->first()?->administered_at ?? 'Never',
                ];
            }),

            'vitalsHistory' => $patient->visits->sortByDesc('visit_date')->values()->map(function($visit) {
                return [
                    'id'    => $visit->id,
                    'date'  => $visit->visit_date,
                    'bp'    => $visit->blood_pressure,
                    'hr'    => $visit->heart_rate,
                    'temp'  => $visit->temperature,
                    'w'     => $visit->weight,
                    'recorded_by' => $visit->staff ? $visit->staff->last_name : 'System',
                ];
            }),

            'admissionHistory' => $patient->admissions->map(fn($adm) => [
            'id'         => 'A-' . str_pad($adm->id, 5, '0', STR_PAD_LEFT),
            'admitted'   => $adm->admission_date,
            'discharged' => $adm->discharge_date ?? 'Active',
            'reason'     => $adm->diagnosis,
            ])->toArray(),

            'auth' => [
                'user' => array_merge(auth()->user()->toArray(), [
                    'db_id' => auth()->user()->id,
                    'name'  => "Nurse. " . auth()->user()->last_name,
                    'id'    => auth()->user()->staff_id,
                ])
            ],

            'medicalNotes' => $patient->visits->map(function($visit) {
                $staffRole = $visit->staff?->role ?? 'unknown';
                $staffName = $visit->staff?->last_name ?? 'System';
                return [
                    'id' => $visit->id,
                    'staff_id' => $visit->staff_id,
                    'doctor' => ($staffRole === 'nurse' ? 'Nurse ' : 'Dr. ') . $staffName,
                    'date' => $visit->created_at,
                    'note' => $visit->reason, 
                    'is_nurse_note' => $staffRole === 'nurse' 
                ];
            })->sortByDesc('date')->values()
        ]);
    }

    public function updateVitals(Request $request, $id)
    {
        $numericId = is_numeric($id) ? (int)$id : (int)str_replace('P-', '', $id);

        $validated = $request->validate([
            'blood_pressure' => ['required', 'string', 'regex:/^\d{2,3}\/\d{2,3}$/'],
                function ($attribute, $value, $fail) {
                $parts = explode('/', $value);
                $systolic = (int) $parts[0];
                $diastolic = (int) $parts[1];

                if ($systolic > 250 || $systolic < 70) {
                    $fail('Systolic pressure (top) must be between 70 and 250.');
                }
                if ($diastolic > 150 || $diastolic < 40) {
                    $fail('Diastolic pressure (bottom) must be between 40 and 150.');
                }
                if ($systolic <= $diastolic) {
                    $fail('Systolic pressure must be higher than diastolic pressure.');
                }
            },
            'heart_rate'     => 'required|numeric|between:40,180',
            'temperature'    => 'required|numeric|between:34,42',
            'weight'         => 'required|numeric|between:35,400',
            'visit_date'     => 'required|date|before_or_equal:today',
            'reason'         => 'nullable|string|max:500',
        ]);

        PatientVisit::create([
            'patient_id'     => $numericId,
            'staff_id'       => auth()->id(),
            'visit_date'     => $validated['visit_date'],
            'blood_pressure' => $validated['blood_pressure'],
            'heart_rate'     => $validated['heart_rate'],
            'temperature'    => $validated['temperature'],
            'weight'         => $validated['weight'],
            'reason'         => $validated['reason'] ?? 'Routine Vitals Check', 
        ]);

        return back()->with('success', 'Vitals recorded successfully!');
    }

    public function administerMedication(Request $request)
    {
        $validated = $request->validate([
            'prescription_id' => 'required|exists:prescriptions,id',
            'sku_batch_id'    => 'required|string',
        ]);

        // 1. Eager load medicine and patient.active_admission
        $prescription = \App\Models\Prescriptions::with(['medicine', 'patient.active_admission'])
            ->findOrFail($validated['prescription_id']);
        
        $admission = $prescription->patient->active_admission;

        if (!$admission || $admission->status !== 'admitted') {
            return back()->withErrors(['error' => 'Action Denied: Patient has been discharged or is not admitted.']);
        }

        // 2. Validate Inventory Batch
        $batch = \App\Models\MedicineBatch::where('sku_batch_id', $validated['sku_batch_id'])
            ->where('medicine_id', $prescription->medicine_id) 
            ->lockForUpdate()
            ->first();

        if (!$batch) return back()->withErrors(['sku_batch_id' => 'Invalid batch selected.']);
        if ($batch->current_quantity <= 0) return back()->withErrors(['sku_batch_id' => 'Out of stock.']);

        // 3. Prep Price and Medicine Data
        $medicine = $prescription->medicine;
        if (!$medicine) {
            return back()->withErrors(['error' => 'Prescription is not linked to catalog.']);
        }
        
        // Ensure you use the correct column name (price_per_unit or price)
        $unitPrice = (float)($medicine->price_per_unit ?? $medicine->price ?? 0); 

        return DB::transaction(function () use ($prescription, $batch, $admission, $unitPrice, $medicine) {
            // 1. Deduct Inventory
            $batch->decrement('current_quantity', 1);

            // 2. Ensure current month exists (October Logic)
            $admission->generateMonthlyBills();

            // 3. Find the statement covering TODAY
            $today = now()->toDateString();
            $activeBill = $admission->bills()
                ->where('period_start', '<=', $today)
                ->where('period_end', '>=', $today)
                ->first();

            if (!$activeBill) {
                $activeBill = $admission->bills()->latest('month_number')->first();
            }

            // 4. Create the Billing Line Item
            \App\Models\InpatientBillItem::create([
                'admission_id' => $admission->id,
                'bill_id'      => $activeBill->id,
                'medicine_id'  => $prescription->medicine_id,
                'batch_id'     => $batch->id,
                'description'  => "{$medicine->generic_name} ({$medicine->brand_name}) - Administered",
                'quantity'     => 1,
                'unit_price'   => $unitPrice,
                'total_price'  => $unitPrice,
            ]);

            // --- THE MISSING FIX FOR THE BALANCE ---
            // We MUST update the total_amount column in the bill_details table
            // so that the balance calculation (total_amount - amount_paid) stays accurate.
            $activeBill->increment('total_amount', $unitPrice);

            // 5. Create Administration Log
            \App\Models\MedicationLog::create([
                'prescription_id' => $prescription->id,
                'nurse_id'        => auth()->id(),
                'batch_number'    => $batch->sku_batch_id, 
                'administered_at' => now(),
            ]);

            // 6. Sync Global Admission Totals (Total Bill & Global Balance)
            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', "Medication charged to Month #{$activeBill->month_number} statement.");
        });
    }

    public function administerOutside($id)
    {
        // 1. Find the prescription with patient and active admission
        $prescription = \App\Models\Prescriptions::with(['patient.active_admission'])
            ->findOrFail($id);

        // 2. Security Check: Validate that it's actually an "outside" med
        if ($prescription->medicine_id !== null) {
            return back()->withErrors(['error' => 'This is not an outside medication. Use the standard administration flow instead.']);
        }

        $admission = $prescription->patient->active_admission;
        if (!$admission || $admission->status !== 'admitted') {
            return back()->withErrors(['error' => 'Cannot log outside medication for a discharged patient.']);
        }

        return DB::transaction(function () use ($prescription, $admission) {
            // A. Ensure current month exists (October Logic)
            // This checks if we need to spawn new months up to today.
            $admission->generateMonthlyBills();

            // B. Find the statement covering TODAY
            $today = now()->toDateString();
            $activeBill = $admission->bills()
                ->where('period_start', '<=', $today)
                ->where('period_end', '>=', $today)
                ->first();

            // Fallback to the latest month if today is somehow outside the generated range
            if (!$activeBill) {
                $activeBill = $admission->bills()->latest('month_number')->first();
            }

            // C. Create the Billing Line Item (Documentation only, Price = 0)
            \App\Models\InpatientBillItem::create([
                'admission_id' => $admission->id,
                'bill_id'      => $activeBill->id,
                'medicine_id'  => null, // No catalog record
                'batch_id'     => null, // No inventory batch
                'description'  => "{$prescription->medicine_name} - Outside Procured (Administered)",
                'quantity'     => 1,
                'unit_price'   => 0,
                'total_price'  => 0,
            ]);

            // D. Create the administration log entry
            \App\Models\MedicationLog::create([
                'prescription_id' => $prescription->id,
                'nurse_id'        => auth()->id(),
                'batch_number'    => 'OUTSIDE-PROCURED',
                'administered_at' => now(),
            ]);

            // E. Force Sync
            // Recalculates the total bill and balance (even though we added 0, this keeps data healthy)
            $admission->refresh();
            $admission->syncLiveTotals();

            return back()->with('success', "Outside medication logged and attached to Month #{$activeBill->month_number} statement.");
        });
    }

    public function destroyVitals($id)
    {
        $visit = PatientVisit::findOrFail($id);

        // Security Check: Ensure the nurse owns this record
        if ($visit->staff_id !== auth()->id()) {
            return back()->withErrors(['error' => 'You do not have permission to delete this record.']);
        }

        $visit->delete();

        return back()->with('success', 'Note deleted successfully.');
    }
}