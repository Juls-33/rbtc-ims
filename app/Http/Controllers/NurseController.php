<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use App\Models\Patient;
use App\Models\Prescriptions;
use App\Models\MedicineCatalog;
use App\Models\MedicationLog;
use App\Models\MedicineBatch;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NurseController extends Controller
{
    public function dashboard()
    {
        $nurseId = auth()->id();
        
        $myRecords = PatientVisit::with('patient')
            ->where('staff_id', $nurseId)
            ->whereDate('visit_date', now()->today())
            ->get();

        $stats = [
            'vitals_taken_today' => $myRecords->count(),
            'active_admissions' => Patient::whereHas('admissions', function($q) {
                $q->where('status', 'admitted');
            })->count(),
        ];

        return Inertia::render('Nurse/Dashboard', [
            'recentActivity' => $myRecords->take(5),
            'stats' => $stats
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
                'status'           => $latestAdmission ? strtoupper($latestAdmission->status) : 'OUTPATIENT',
                'room'             => $latestAdmission?->room?->room_location ?? 'N/A',
                'doctor'           => $latestAdmission?->staff ? "Dr. {$latestAdmission->staff->last_name}" : 'N/A',
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
            'heart_rate'     => 'required|numeric|between:30,220',
            'temperature'    => 'required|numeric|between:30,45',
            'weight'         => 'required|numeric|between:1,500',
            'visit_date'     => 'required|date',
            'reason'         => 'nullable|string|max:255',
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

    public function administerMedication(Request $request, $prescriptionId)
    {
        $prescription = Prescriptions::findOrFail($prescriptionId);
        
        // 1. Perform validation first (outside transaction to save resources)
        $batch = MedicineBatch::where('sku_batch_id', $request->sku_batch_id)
        // Add this check to ensure they match
        ->where('medicine_id', $prescription->medicine_id) 
        ->lockForUpdate()
        ->first();

        if (!$batch) {
            return back()->withErrors(['sku_batch_id' => 'Invalid batch for this medication.']);
        }
        if ($batch->current_quantity <= 0) return back()->withErrors(['sku_batch_id' => 'Out of stock.']);
        if (now()->parse($batch->expiry_date)->isPast()) return back()->withErrors(['sku_batch_id' => 'Expired.']);

        try {
            DB::transaction(function () use ($prescription, $batch) {
                // 2. Perform updates
                $batch->decrement('current_quantity', 1);

                MedicationLog::create([
                    'prescription_id' => $prescription->id,
                    'nurse_id'        => auth()->id(),
                    'batch_number'    => $batch->sku_batch_id, 
                    'administered_at' => now(),
                ]);
            });

            // 3. Return response AFTER transaction succeeds
            return back()->with('success', 'Medication administered and stock updated!');
            
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function administerOutside($id)
    {
        // 1. Find the prescription
        $prescription = Prescriptions::findOrFail($id);

        // 2. Validate that it's actually an "outside" med
        if ($prescription->medicine_id !== null) {
            return back()->withErrors(['success' => 'This is not an outside medication.']);
        }

        // 3. Create the log entry
        MedicationLog::create([
            'prescription_id' => $prescription->id,
            'nurse_id'        => auth()->id(),
            'batch_number'    => 'OUTSIDE-PROCURED',
            'administered_at' => now(),
        ]);

        // 4. Return success to the Inertia frontend
        return back()->with('success', 'Outside medication logged successfully!');
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