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

        $rooms = Room::select('id', 'room_location', 'room_rate', 'status')->get();

        $doctors = Staff::where('role', 'Doctor')
            ->select('id', 'first_name', 'last_name')
            ->get();

        $patients = Patient::with(['admissions.room', 'admissions.staff', 'visits'])
            ->latest()
            ->get() 
            ->map(function ($patient) {
                // Get the most recent admission record (active or historical)
                $latest = $patient->admissions->sortByDesc('admission_date')->first();
                
                // Specifically find the ACTIVE one for the Edit Modal
                $active = $patient->admissions->where('status', 'Admitted')->first();
                $type = $latest ? 'inpatient' : 'outpatient';

                return [
                    'id'         => $patient->id,
                    'patient_id' => $patient->patient_id,
                    'name'       => $patient->full_name,
                    'contact_no' => $patient->contact_no,
                    
                    // Personal Information
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
                    
        
                    'status'     => $latest ? strtoupper($latest->status) : 'OUTPATIENT',
                    'bill_status' => 'UNPAID', // Placeholder: logic for unpaid bills here
                    'type'       => $latest ? 'inpatient' : 'outpatient',
                    
                    // Clinical Details (Shows info for the most recent stay)
                    'current_room'        => $latest?->room?->room_location ?? 'N/A',
                    'admission_date'      => $latest?->admission_date,
                    'discharge_date'      => $latest?->discharge_date, // Added for historical view
                    'attending_physician' => $latest?->staff ? "Dr. {$latest->staff->first_name} {$latest->staff->last_name}" : 'N/A',

                    // DATA OBJECT FOR EditAdmissionModal (Only if currently admitted)
                    'active_admission' => $active ? [
                        'id'                 => $active->id,
                        'patient_name'       => $patient->full_name,
                        'patient_id_display' => $patient->patient_id,
                        'admission_date'     => date('Y-m-d\TH:i', strtotime($active->admission_date)),
                        'staff_id'           => $active->staff_id,
                        'room_id'            => $active->room_id,
                        'diagnosis'          => $active->diagnosis,
                    ] : null,
                    'visit_history' => $patient->visits->sortByDesc('visit_date')->map(fn($visit) => [
                        'id'         => $visit->id,
                        'visit_id' => 'V-' . str_pad($visit->id, 5, '0', STR_PAD_LEFT),
                        'date'     => $visit->visit_date,
                        'weight'   => $visit->weight ? "{$visit->weight}KG" : 'N/A',
                        'reason'   => $visit->reason,
                ]),
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

    public function destroy(Request $request, Patient $patient)
    {
        $request->validate([
            'password' => ['required', 'current_password'], // Laravel helper to check auth user password
            'reason'   => 'required|string',
        ]);

        // Log the deletion reason for accountability
        \Log::info("Patient {$patient->id} deleted by " . auth()->user()->name . ". Reason: " . $request->reason);

        $patient->delete();

        return redirect()->route('admin.patients')->with('success', 'Record removed.');
    }
}