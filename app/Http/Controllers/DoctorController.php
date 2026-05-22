<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Prescriptions;
use App\Models\MedicineCatalog;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function dashboard()
    {
        $doctorId = auth()->id();
        $today = now()->startOfDay();

        $todayVisits = PatientVisit::with('patient')
            ->where('staff_id', $doctorId)
            ->whereDate('visit_date', now()->today())
            ->get();

        $appointments = $todayVisits->map(fn($v) => [
            'time' => $v->created_at->format('g:i A'),
            'id' => $v->patient->patient_id,
            'db_id' => $v->patient->id,
            'name' => $v->patient->full_name,
            'reason' => $v->reason,
        ]);

        $stats = [
            'seen_count' => $todayVisits->count(),
            'total_target' => 15, 
            'prescriptions_count' => Prescriptions::where('staff_id', $doctorId)
                                        ->whereDate('created_at', now()->today())
                                        ->count(),
            'next_patient' => $appointments->first(), 
        ];

        return Inertia::render('Doctor/Dashboard', [
            'appointments' => $appointments,
            'stats' => $stats
        ]);
    } 

    // Inside DoctorController.php
    public function patients(Request $request)
    {
        $doctorId = auth()->id();

        // Scope queries strictly to patients assigned to this doctor
        // via active admissions OR historic direct clinical visits
        $query = Patient::where(function($q) use ($doctorId) {
            $q->whereHas('admissions', function($sub) use ($doctorId) {
                $sub->where('staff_id', $doctorId);
            })->orWhereHas('visits', function($sub) use ($doctorId) {
                $sub->where('staff_id', $doctorId);
            });
        });

        // Search Filter (Scoped safely within the doctor's assigned boundary)
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('id', 'like', "%{$searchTerm}%");
            });
        }

        // Apply classification filters directly to the server database builder query
        if ($request->status) {
            $statusFilter = strtolower($request->status);
            if ($statusFilter === 'inpatient') {
                // Patient has an active admission under this doctor
                $query->whereHas('admissions', function($sub) use ($doctorId) {
                    $sub->where('staff_id', $doctorId)->where('status', 'Admitted');
                });
            } elseif ($statusFilter === 'outpatient') {
                // Patient has checked in under this doctor but has no active admission room
                $query->whereDoesntHave('admissions', function($sub) {
                    $sub->where('status', 'Admitted');
                });
            }
        }

        // Fetch paginated results ensuring relationship metrics are loaded
        $patientsData = $query->with(['visits' => function($q) use ($doctorId) {
            $q->where('staff_id', $doctorId)->latest('visit_date');
        }])->paginate(10)->withQueryString();

        // Explicitly map values safely for React UI consumption
        $transformedPatients = [
            'data' => collect($patientsData->items())->map(function($patient) use ($doctorId) {
                // Grab the last recorded visit logged under this specific doctor
                $latestVisit = $patient->visits->first();
                
                // Establish active listing classification status contextually
                $isActiveInpatient = $patient->admissions()->where('staff_id', $doctorId)->where('status', 'Admitted')->exists();
                $classification = $isActiveInpatient ? 'INPATIENT' : 'OUTPATIENT';

                return [
                    'id' => $patient->id,
                    'name' => "{$patient->first_name} {$patient->last_name}",
                    'phone' => $patient->phone ?? $patient->contact_number ?? 'None Recorded',
                    'latest_visit' => $latestVisit ? \Carbon\Carbon::parse($latestVisit->visit_date)->format('Y-m-d H:i') : 'No visits recorded',
                    'status' => $classification,
                ];
            }),
            'links' => $patientsData->linkCollection()->toArray(),
            'current_page' => $patientsData->currentPage(),
            'last_page' => $patientsData->lastPage(),
            'total' => $patientsData->total(),
        ];

        return Inertia::render('Doctor/Patients', [
            'patients' => $transformedPatients,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }
    public function showPatient($id)
    {
        $numericId = is_numeric($id) ? (int)$id : (int)str_replace('P-', '', $id);

        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits.staff', 'prescriptions.medicine'])
            ->findOrFail($numericId);

        $latestAdmission = $patient->admissions->sortByDesc('admission_date')->first();
        $latestVisit = $patient->visits()->latest()->first();

        $nurses = Staff::where('role', 'Nurse')
            ->orderBy('last_name')
            ->get()
            ->map(fn($n) => [
                'id'   => $n->id, // primary database key
                'name' => "Nurse " . $n->last_name . ", " . $n->first_name,
            ]);

        return Inertia::render('Doctor/PatientProfile', [
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
                'doctor'           => $latestAdmission?->staff ? "Dr. {$latestAdmission->staff->last_name}" : 'N/A',
                'room'             => $latestAdmission?->room?->room_location ?? 'N/A',
                'diagnosis'        => $latestAdmission?->diagnosis ?? 'No diagnosis recorded.',
                'latestNote'       => $latestVisit ? $latestVisit->reason : 'No consultation notes available.',
                // Safeguard the vitals so React doesn't crash on undefined properties
                'weight' => $latestVisit->weight ?? '—',
                'bp'     => $latestVisit->blood_pressure ?? '—', 
                'hr'     => $latestVisit->heart_rate ?? '—', 
                'temp'   => $latestVisit->temperature ?? '—',
            ],  

            'nurses'  => $nurses,

            'prescriptionHistory' => $patient->prescriptions
                ->sortByDesc('created_at')
                ->values()
                ->map(function($pres) {
                    // Step 1: Determine the best name to display
                    if ($pres->medicine) {
                        $displayName = $pres->medicine->brand_name 
                            ? "{$pres->medicine->generic_name} ({$pres->medicine->brand_name})" 
                            : $pres->medicine->generic_name;
                    } else {
                        // Fallback to the manual name column, or a placeholder if empty
                        $displayName = $pres->medicine_name ?? 'Manual Entry Missing';
                    }

                    return [
                        'id'            => $pres->id,
                        'medicine_id'   => $pres->medicine_id,
                        'medicine_name' => $displayName, 
                        'dosage'        => $pres->dosage,
                        'frequency'     => $pres->frequency,
                        'time'          => $pres->schedule_time, // Added this so Edit works better
                        'date'          => $pres->date_prescribed,
                    ];
            }),
            'consultationHistory' => $patient->visits->sortByDesc('visit_date')->values()->map(function($visit) {
                return [
                    'id'         => $visit->id,
                    'date'       => $visit->visit_date, // Format this as needed
                    'note'       => $visit->reason,
                    'doctor' => $visit->staff 
                        ? "Dr. " . $visit->staff->last_name 
                        : "Missing ID: " . $visit->staff_id,
                    'nurse'      => $visit->nurse ? "Nurse " . $visit->nurse->last_name : null,    
                    'vitals'     => [
                        'bp'   => $visit->blood_pressure,
                        'hr'   => $visit->heart_rate,
                        'temp' => $visit->temperature,
                        'w'    => $visit->weight,
                    ]
                ];
            }),

            'medicines' => MedicineCatalog::orderBy('generic_name')->get()->map(function($med) {
            return [
                'id'   => $med->id,
                'name' => $med->brand_name ? "{$med->generic_name} ({$med->brand_name})" : $med->generic_name,
            ];
        }),
            'auth' => [
                'user' => array_merge(auth()->user()->toArray(), [
                    'db_id' => auth()->user()->id,
                    'name'  => "Dr. " . auth()->user()->last_name,
                    'id'    => auth()->user()->staff_id,
                ])
            ],
            'admissionHistory' => $patient->admissions->map(fn($adm) => [
                'id'         => 'A-' . str_pad($adm->id, 5, '0', STR_PAD_LEFT),
                'admitted'   => $adm->admission_date,
                'discharged' => $adm->discharge_date ?? 'Active',
                'reason'     => $adm->diagnosis,
            ])->toArray(),
        ]);
    }

    public function updateVitals(Request $request, $id)
    {
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
            'patient_id'     => $id, 
            'staff_id'       => auth()->id(),
            'visit_date'     => $validated['visit_date'],
            'blood_pressure' => $validated['blood_pressure'],
            'heart_rate'     => $validated['heart_rate'],
            'temperature'    => $validated['temperature'],
            'weight'         => $validated['weight'],
            'reason'         => $validated['reason'], 
        ]);

        return back()->with('message', 'Vitals updated successfully!');
    }

    public function storePrescription(Request $request, $id)
    {
        $patient = Patient::with('active_admission')->findOrFail($id);
        if (!$patient->active_admission || $patient->active_admission->status !== 'admitted') {
            return back()->withErrors(['error' => 'Cannot prescribe: Patient is not currently admitted.']);
        }
        $validated = $request->validate([
            'medicine_id'     => 'nullable',
            'medicine_name'   => 'nullable|string|max:255',
            'dosage'          => 'required|string|max:100',
            'frequency'       => 'required|string|max:100',
            'time'            => 'required', 
            'date_prescribed' => 'required|date',
        ]);

        $finalMedicineId = ($request->medicine_id === 'other' || !$request->medicine_id) 
                        ? null 
                        : $request->medicine_id;

    
        $finalMedicineName = $request->medicine_name;


        if ($finalMedicineId) {
            $catalogItem = MedicineCatalog::find($finalMedicineId);
            if ($catalogItem) {
                $finalMedicineName = $catalogItem->brand_name 
                    ? "{$catalogItem->generic_name} ({$catalogItem->brand_name})" 
                    : $catalogItem->generic_name;
            }
        }

        if (!$finalMedicineName) {
        return back()->withErrors(['medicine_name' => 'The system could not determine the medicine name. Please re-select.']);
    }

        Prescriptions::create([
            'patient_id'      => $id, // This is the Patient's ID from the URL
            'staff_id'        => auth()->id(), 
            'medicine_id'     => $finalMedicineId,
            'medicine_name'   => $finalMedicineName,
            'dosage'          => $validated['dosage'],
            'frequency'       => $validated['frequency'],
            'schedule_time'   => $validated['time'], 
            'date_prescribed' => $validated['date_prescribed'],
        ]);
        
        return back()->with('message', 'Prescription added successfully!');
    }

    public function updatePrescription(Request $request, $id)
    {
        $validated = $request->validate([
            'medicine_id'     => 'nullable',
            'medicine_name'   => 'required|string|max:255',
            'dosage'          => 'required|string|max:100',
            'frequency'       => 'required|string|max:100',
            'time'            => 'required', 
            'date_prescribed' => 'required|date',
        ]);

        $prescription = Prescriptions::findOrFail($id);

        $admission = $prescription->patient->active_admission;
        if (!$admission || $admission->status !== 'admitted') {
            return back()->withErrors(['error' => 'Cannot update: Patient is no longer admitted.']);
        }

        $finalMedicineId = ($request->medicine_id === 'other' || !$request->medicine_id) 
                           ? null 
                           : $request->medicine_id;

        $finalMedicineName = $validated['medicine_name'];
        if ($finalMedicineId) {
            $catalogItem = MedicineCatalog::find($finalMedicineId);
            if ($catalogItem) {
                $finalMedicineName = $catalogItem->brand_name 
                    ? "{$catalogItem->generic_name} ({$catalogItem->brand_name})" 
                    : $catalogItem->generic_name;
            }
        }


        $prescription->update([
            'medicine_id'     => $finalMedicineId,
            'medicine_name'   => $finalMedicineName,
            'dosage'          => $validated['dosage'],
            'frequency'       => $validated['frequency'],
            'schedule_time'   => $validated['time'], 
            'date_prescribed' => $validated['date_prescribed'],
        ]);

        return back()->with('message', 'Prescription updated successfully!');
    }

    public function destroyPrescription($id)
    {
        $prescription = Prescriptions::findOrFail($id);
        $prescription->delete();

        return back()->with('message', 'Prescription deleted successfully!');
    }

    public function storeConsultation(Request $request, $id)
    {
        $validated = $request->validate([
            'note'       => 'required|string',
            'visit_date' => 'required|date',
            'nurse_id'   => 'nullable|exists:staff,id',
        ]);

        // This creates a NEW entry in patient_visits
        PatientVisit::create([
            'patient_id' => $id,
            'staff_id'   => auth()->id(), 
            'visit_date' => $validated['visit_date'],
            'reason'     => $validated['note'], 
            'nurse_id'   => $validated['nurse_id'] ?? null,
        ]);

        return back()->with('message', 'Consultation note added successfully!');
    }
    public function destroyConsultation($id)
    {
        $visit = PatientVisit::findOrFail($id);
        $visit->delete();

        return back()->with('message', 'Consultation note deleted.');
    }

    public function getSelectablePatients()
    {
        $doctorId = auth()->id();

        // Only populate the Add Outpatient selection list with patients 
        // that the admin has officially connected or assigned to this doctor
        $selectablePatients = Patient::whereHas('admissions', function($q) use ($doctorId) {
            $q->where('staff_id', $doctorId);
        })->orWhereHas('visits', function($q) use ($doctorId) {
            $q->where('staff_id', $doctorId);
        })->get()->map(fn($patient) => [
            'id' => $patient->id,
            'name' => "{$patient->first_name} {$patient->last_name}",
        ]);

        return response()->json([
            'selectablePatients' => $selectablePatients
        ]);
    }

    public function storeOutpatientVisit(Request $request)
    {
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'visit_date'     => 'required|date',
            'blood_pressure' => 'nullable|string',
            'heart_rate'     => 'nullable|string',
            'temperature'    => 'nullable|string',
            'weight'         => 'nullable|string',
            'reason'         => 'required|string|max:255',
        ]);

        // Create the new outpatient visit entry assigning the current authenticated doctor
        PatientVisit::create([
            'patient_id'     => $validated['patient_id'],
            'staff_id'       => auth()->id(), // Automatically logs the active doctor
            'visit_date'     => $validated['visit_date'],
            'blood_pressure' => $validated['blood_pressure'],
            'heart_rate'     => $validated['heart_rate'],
            'temperature'    => $validated['temperature'],
            'weight'         => $validated['weight'],
            'reason'         => $validated['reason'],
            'status'         => 'Completed',
        ]);

        return redirect()->back()->with('success', 'Outpatient records recorded successfully!');
    }
}