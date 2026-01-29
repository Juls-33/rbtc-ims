<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        $selectablePatients = Patient::orderBy('last_name')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->full_name,
        ]);

        // 2. Fetch Rooms using your migration columns
        $rooms = \App\Models\Room::select('id', 'room_location', 'room_rate', 'status')
            ->where('status', 'Available') // Only show available rooms for new admissions
            ->get();

        // 3. Fetch Doctors (Staff)
        $doctors = \App\Models\Staff::where('role', 'Doctor')
            ->select('id', 'first_name', 'last_name')
            ->get();

        $patients = Patient::with(['admissions.room', 'admissions.staff'])
            ->latest()
            ->get() 
            ->map(function ($patient) {
                $latestAdmission = $patient->admissions->sortByDesc('admission_date')->first();
                return [
                    'id'         => $patient->id,
                    'patient_id' => $patient->patient_id,
                    'name'       => $patient->full_name, // For the table display
                    'contact_no'   => $patient->contact_no,
                    // Individual fields added for Edit Modal autofill
                    'first_name'   => $patient->first_name, 
                    'last_name'    => $patient->last_name,
                    'dob'          => $patient->birth_date,
                    'gender'       => $patient->gender,
                    'civil_status' => $patient->civil_status,
                    'contact'      => $patient->contact_no,
                    'address'      => $patient->address,
                    'emergency_contact_name'     => $patient->emergency_contact_name,
                    'emergency_contact_relation' => $patient->emergency_contact_relation,
                    'emergency_contact_number'   => $patient->emergency_contact_number,
                    
                    'status'       => 'Stable',
                    'bill_status'  => 'PAID',
                    'type'         => $patient->admissions->isNotEmpty() ? 'inpatient' : 'outpatient',
                    // Admission Details for display
                    'current_room' => $latestAdmission?->room?->room_location ?? 'N/A',
                    'attending_physician' => $latestAdmission?->staff ? $latestAdmission->staff->first_name . ' ' . $latestAdmission->staff->last_name : 'N/A',
                ];
            });
                

        return Inertia::render('Admin/PatientManagement', [
            'patients'           => $patients,
            'selectablePatients' => $selectablePatients,
            'rooms'              => $rooms,
            'doctors'            => $doctors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Male,Female,Other',
            'contact_no' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'civil_status' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'diagnosis_notes' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:20',
        ]);

        return DB::transaction(function () use ($validated) {
            Patient::create($validated);
            return redirect()->back()->with('success', 'Patient record created successfully.');
        });
    }

    public function update(Request $request, Patient $patient)
    {
        // Validation now matches the store logic exactly
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Male,Female,Other',
            'contact_no' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'civil_status' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'diagnosis_notes' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:20',
        ]);

        // CipherSweet trait triggers automatically to re-encrypt and re-hash modified fields
        $patient->update($validated); 

        return redirect()->back()->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        // Deleting the model automatically cleans up entries in the blind_indexes table
        $patient->delete(); 
        return redirect()->back()->with('success', 'Patient record deleted.');
    }
}