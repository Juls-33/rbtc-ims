<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        // 1. Fetch selection data for Admitting/Editing admissions
        $selectablePatients = Patient::orderBy('last_name')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->full_name,
        ]);

        // Fetch ALL rooms (including status) so the Edit modal can show current vs other rooms
        $rooms = Room::select('id', 'room_location', 'room_rate', 'status')->get();

        // Fetch Doctors for attending physician dropdowns
        $doctors = Staff::where('role', 'Doctor')
            ->select('id', 'first_name', 'last_name')
            ->get();

        $patients = Patient::with(['admissions.room', 'admissions.staff'])
            ->latest()
            ->get() 
            ->map(function ($patient) {
                // Get the current active admission
                $active = $patient->admissions->where('status', 'Admitted')->first();
                
                return [
                    'id'         => $patient->id,
                    'patient_id' => $patient->patient_id,
                    'name'       => $patient->full_name,
                    'contact_no' => $patient->contact_no,
                    
                    // Personal Information (for EditPatientModal)
                    'first_name'   => $patient->first_name, 
                    'last_name'    => $patient->last_name,
                    'dob'          => $patient->birth_date,
                    'gender'       => $patient->gender,
                    'civil_status' => $patient->civil_status,
                    'address'      => $patient->address,
                    
                    // Emergency Contact Details
                    'emergency_contact_name'     => $patient->emergency_contact_name,
                    'emergency_contact_relation' => $patient->emergency_contact_relation,
                    'emergency_contact_number'   => $patient->emergency_contact_number,
                    
                    // Status Logic for Inpatient Table
                    'status'      => $active ? 'ADMITTED' : 'OUTPATIENT',
                    'bill_status' => 'PAID', // Placeholder: Update when Billing module is ready
                    'type'        => $active ? 'inpatient' : 'outpatient',
                    
                    // Clinical Details for Inpatient View/Profile
                    'current_room'        => $active?->room?->room_location ?? 'N/A',
                    'admission_date'      => $active?->admission_date,
                    'attending_physician' => $active?->staff ? "Dr. {$active->staff->first_name} {$active->staff->last_name}" : 'N/A',

                    // DATA OBJECT FOR EditAdmissionModal
                    'active_admission' => $active ? [
                        'id'                 => $active->id,
                        'patient_name'       => $patient->full_name,
                        'patient_id_display' => $patient->patient_id,
                        'admission_date'     => date('Y-m-d\TH:i', strtotime($active->admission_date)),
                        'staff_id'           => $active->staff_id,
                        'room_id'            => $active->room_id,
                        'diagnosis'          => $active->diagnosis,
                    ] : null,
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
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Male,Female,Other',
            'contact_no' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'civil_status' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:20',
        ]);

        $patient->update($validated); 

        return redirect()->back()->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete(); 
        return redirect()->back()->with('success', 'Patient record deleted.');
    }
}