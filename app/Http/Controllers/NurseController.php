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
        $search = strtolower($request->input('search'));

        $allPatients = Patient::with(['admissions'])->latest()->get();

        $filteredPatients = $allPatients->filter(function ($p) use ($search) {
            if (!$search) return true;
            return str_contains(strtolower($p->first_name), $search) ||
                   str_contains(strtolower($p->last_name), $search) ||
                   str_contains(strtolower($p->patient_id), $search);
        });

        $patients = $filteredPatients->map(function ($p) {
            $latest = $p->admissions->sortByDesc('admission_date')->first();
            return [
                'id'      => $p->id,
                'p_id'    => $p->patient_id, 
                'name'    => $p->full_name,   
                'dob'     => $p->birth_date,
                'contact' => $p->contact_no,
                'status'  => $latest ? strtoupper($latest->status) : 'OUTPATIENT',
            ];
        })->values();

        return Inertia::render('Nurse/Patients', [
            'patients' => $patients,
            'filters'  => $request->only(['search'])
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
                'weight' => $latestVisit?->weight ?? '—',
                'bp'     => $latestVisit?->blood_pressure ?? '—', 
                'hr'     => $latestVisit?->heart_rate ?? '—', 
                'temp'   => $latestVisit?->temperature ?? '—',
            ],  

            'batches' => MedicineBatch::where('expiry_date', '>', now())->get(),

            'prescriptionHistory' => $patient->prescriptions->sortByDesc('created_at')->values()->map(function($pres) {
                return [
                    'id'            => $pres->id,
                    'medicine_name' => $pres->medicine ? ($pres->medicine->brand_name ?? $pres->medicine->generic_name) : $pres->medicine_name, 
                    'dosage'        => $pres->dosage,
                    'frequency'     => $pres->frequency,
                    'time'          => $pres->schedule_time,
                    'date'          => $pres->date_prescribed,
                    'last_administered' => $pres->logs()->latest()->first()?->administered_at,
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
                    'name'  => "Nurse " . auth()->user()->last_name,
                    'role'  => 'nurse'
                ])
            ],
        ]);
    }

    public function updateVitals(Request $request, $id)
    {
        $validated = $request->validate([
            'blood_pressure' => ['required', 'string', 'regex:/^\d{2,3}\/\d{2,3}$/'],
            'heart_rate'     => 'required|numeric|between:30,220',
            'temperature'    => 'required|numeric|between:30,45',
            'weight'         => 'required|numeric|between:1,500',
            'visit_date'     => 'required|date',
            'reason'         => 'nullable|string|max:255',
        ]);

        PatientVisit::create([
            'patient_id'     => $id, 
            'staff_id'       => auth()->id(),
            'visit_date'     => $validated['visit_date'],
            'blood_pressure' => $validated['blood_pressure'],
            'heart_rate'     => $validated['heart_rate'],
            'temperature'    => $validated['temperature'],
            'weight'         => $validated['weight'],
            'reason'         => $validated['reason'] ?? 'Routine Vitals Check', 
        ]);

        return back()->with('message', 'Vitals recorded successfully!');
    }

    public function administerMedication(Request $request, $prescriptionId)
    {
        $request->validate([
            'batch_number' => 'required|string',
        ]);

        $batch = MedicineBatch::where('batch_number', $request->batch_number)->first();

        if (!$batch || $batch->quantity <= 0) {
            return back()->withErrors(['batch_number' => 'This batch is out of stock.']);
        }

        $batch->decrement('quantity', 1); 

        MedicationLog::create([
            'prescription_id' => $prescriptionId,
            'nurse_id' => auth()->id(),
            'batch_number' => $request->batch_number,
            'administered_at' => now(),
        ]);

        return back()->with('message', 'Medication administered and stock updated!');
    }
}