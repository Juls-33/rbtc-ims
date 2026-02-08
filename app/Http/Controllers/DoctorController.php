<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Display the Doctor Dashboard
     */
    public function dashboard()
    {
        return Inertia::render('Doctor/Dashboard');
    }

    /**
     * Display the Patient List
     */
    public function patients()
    {
        // This sends the REAL data from MySQL to your React page
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

        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits'])
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
}