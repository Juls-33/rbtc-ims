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
        return Inertia::render('Doctor/Dashboard');
    }

    public function patients()
    {
        return Inertia::render('Doctor/Patients', [
            'patients' => Patient::all()->map(function($patient) {
                return [
                    'id'      => $patient->id,           // The numeric ID for the URL
                    'p_id'    => $patient->patient_id,   // The "P-00001" for display
                    'name'    => $patient->full_name,
                    'dob'     => $patient->birth_date,
                    'contact' => $patient->contact_no,
                    // Pulling the status from the latest admission
                    'status'  => $patient->admissions->last()?->status ?? 'OUTPATIENT',
                ];
            })
        ]);
    }

    /**
     * Display a specific Patient's Profile
     */
    public function showPatient($id)
    {
        $numericId = is_numeric($id) ? (int)$id : (int)str_replace('P-', '', $id);

        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits', 'prescriptions.medicine'])
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
                'latestNote'       => $patient->medical_history ?? 'No consultation notes available.',
                // Safeguard the vitals so React doesn't crash on undefined properties
                'weight' => $latestVisit->weight ?? '—',
                'bp'     => $latestVisit->blood_pressure ?? '—', 
                'hr'     => $latestVisit->heart_rate ?? '—', 
                'temp'   => $latestVisit->temperature ?? '—',
                'latestNote' => $latestVisit ? $latestVisit->reason : 'No consultation notes available.',
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
            'blood_pressure' => [
            'required', 
            'string', 
            'regex:/^([7-9][0-9]|1[0-9]{2})\/([4-9][0-9]|1[0-3][0-9])$/'
            ],

            'heart_rate' => [
            'required', 
            'numeric', 
            'between:30,220'
            ],
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
}