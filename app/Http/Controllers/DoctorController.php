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

    public function patients(Request $request)
    {
        $search = strtolower($request->input('search'));

        // 1. Get ALL patients (or a reasonably large chunk)
        $allPatients = Patient::with(['admissions'])->latest()->get();

        // 2. Filter the collection in PHP (where decryption happens automatically)
        $filteredPatients = $allPatients->filter(function ($p) use ($search) {
            if (!$search) return true;

            // Check if search matches decrypted name or ID
            return str_contains(strtolower($p->first_name), $search) ||
                str_contains(strtolower($p->last_name), $search) ||
                str_contains(strtolower($p->patient_id), $search);
        });

        // 3. Map the filtered results for the frontend
        $patients = $filteredPatients->map(function ($p) {
            $latest = $p->admissions->sortByDesc('admission_date')->first();
            return [
                'id'      => $p->id,
                'p_id'    => $p->patient_id, // Decrypted via Model casting
                'name'    => $p->full_name,   // Decrypted via Model casting
                'dob'     => $p->birth_date,
                'contact' => $p->contact_no,
                'status'  => $latest ? strtoupper($latest->status) : 'OUTPATIENT',
            ];
        })->values(); // Reset array keys for JSON

        return Inertia::render('Doctor/Patients', [
            'patients' => $patients,
            'filters'  => $request->only(['search'])
        ]);
    }

    public function showPatient($id)
    {
        $numericId = is_numeric($id) ? (int)$id : (int)str_replace('P-', '', $id);

        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits.staff', 'prescriptions.medicine'])
            ->findOrFail($numericId);

        $latestAdmission = $patient->admissions->sortByDesc('admission_date')->first();
        $latestVisit = $patient->visits()->latest()->first();

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
            'heart_rate' => ['required', 'numeric', 'between:30,220'],
            'temperature'    => 'required|numeric|between:30,45',
            'weight'         => 'required|numeric|between:1,500',
            'visit_date'     => 'required|date',
            'reason'         => 'required|string|max:255',
            ], [
            'blood_pressure.regex' => 'Please enter a valid BP (e.g., 120/80). Systolic: 70-190, Diastolic: 40-130.',
            'heart_rate.between'   => 'Heart rate must be between 30 and 220 bpm.',
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
        $validated = $request->validate([
            'medicine_id'     => 'nullable',
            'medicine_name'   => 'required|string|max:255',
            'dosage'          => 'required|string|max:100',
            'frequency'       => 'required|string|max:100',
            'time'            => 'required', 
            'date_prescribed' => 'required|date',
        ]);

        // Clean the ID: If 'other' or empty, it must be null in DB
        $finalMedicineId = ($request->medicine_id === 'other' || !$request->medicine_id) 
                           ? null 
                           : $request->medicine_id;

        Prescriptions::create([
            'patient_id'      => $id, // This is the Patient's ID from the URL
            'staff_id'        => auth()->id(), 
            'medicine_id'     => $finalMedicineId,
            'medicine_name'   => $validated['medicine_name'],
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

        // Here $id IS the Prescription ID
        $prescription = Prescriptions::findOrFail($id);

        $finalMedicineId = ($request->medicine_id === 'other' || !$request->medicine_id) 
                           ? null 
                           : $request->medicine_id;

        $prescription->update([
            'medicine_id'     => $finalMedicineId,
            'medicine_name'   => $validated['medicine_name'],
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
        ]);

        // This creates a NEW entry in patient_visits
        PatientVisit::create([
            'patient_id' => $id,
            'staff_id'   => auth()->id(), // Automatic from the logged-in doctor
            'visit_date' => $validated['visit_date'],
            'reason'     => $validated['note'], // This maps to your "latestNote" logic
            // Vitals can remain null for consultation-only visits
        ]);

        return back()->with('message', 'Consultation note added successfully!');
    }
    public function destroyConsultation($id)
    {
        $visit = PatientVisit::findOrFail($id);
        $visit->delete();

        return back()->with('message', 'Consultation note deleted.');
    }
}