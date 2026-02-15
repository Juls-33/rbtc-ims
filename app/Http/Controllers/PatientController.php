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
        // 1. Fetch selection data
        $selectablePatients = Patient::with(['admissions' => function($query) {
            $query->latest('admission_date');
        }])
        ->orderBy('last_name')
        ->get()
        ->map(fn ($p) => [
            'id'   => $p->id,
            'name' => $p->full_name,
            'patient_id' => $p->patient_id,
            'status' => ($p->admissions->first() && strtolower($p->admissions->first()->status) === 'admitted') 
                        ? 'ADMITTED' 
                        : 'OUTPATIENT',
        ]);

        $rooms = Room::select('id', 'room_location', 'room_rate', 'status')->get();

        // FIXED: Case-insensitive role check for Doctors
        $doctors = Staff::whereRaw('LOWER(role) = ?', ['doctor'])
            ->select('id', 'first_name', 'last_name')
            ->get();

        $patients = Patient::with([
            'admissions.room', 
            'admissions.staff', 
            'visits.bill_items.medicine', // Load items and medicine details
            'visits.bill_items.batch'      // Load batch details
        ])
        ->latest()
        ->get() 
        ->map(function ($patient){
                $latest = $patient->admissions->sortByDesc('admission_date')->first();
                
                // FIXED: Case-insensitive status check to find the active admission
                $active = $patient->admissions->first(function ($adm) {
                    return strtolower($adm->status) === 'admitted';
                });

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
                    
                    'status'      => $latest ? strtoupper($latest->status) : 'OUTPATIENT',
                    'bill_status' => 'UNPAID', 
                    'type'        => $latest ? 'inpatient' : 'outpatient',
                    
                    // Clinical Details
                    'current_room'        => $latest?->room?->room_location ?? 'N/A',
                    'admission_date'      => $latest?->admission_date,
                    'discharge_date'      => $latest?->discharge_date, 
                    'attending_physician' => $latest?->staff ? "Dr. {$latest->staff->first_name} {$latest->staff->last_name}" : 'N/A',

                    // FIXED: Ensure every field is explicitly mapped for the Edit Modal
                    'active_admission' => $active ? [
                        'id'                 => $active->id,
                        'patient_name'       => $patient->full_name,
                        'patient_id_display' => $patient->patient_id,
                        'admission_date'     => date('Y-m-d\TH:i', strtotime($active->admission_date)),
                        'staff_id'           => (int)$active->staff_id, // Cast to int for safety
                        'room_id'            => (int)$active->room_id,
                        'diagnosis'          => $active->diagnosis,
                    ] : null,

                    'visit_history' => $patient->visits->sortByDesc('visit_date')->map(fn($visit) => [
                        'id'       => $visit->id,
                        'visit_id' => 'V-' . str_pad($visit->id, 5, '0', STR_PAD_LEFT),
                        'date'     => $visit->visit_date,
                        'weight'   => $visit->weight ? "{$visit->weight}KG" : 'N/A',
                        'reason'   => $visit->reason,
                        'checkup_fee' => $visit->checkup_fee, 
                        'bill_items'  => $visit->bill_items->map(fn($item) => [
                            'id'          => $item->id,
                            'medicine_id' => $item->medicine_id,
                            'batch_id'    => $item->batch_id,
                            'quantity'    => $item->quantity,
                            'unit_price'  => $item->unit_price,
                            'total_price' => $item->total_price,
                            'medicine'    => $item->medicine ? [
                                'generic_name' => $item->medicine->generic_name,
                                'brand_name'   => $item->medicine->brand_name,
                            ] : null,
                            'batch'       => $item->batch ? [
                                'sku_batch_id' => $item->batch->sku_batch_id,
                            ] : null, 
                        ]),
                    ]),
                ];
            });
        dd($patient->prescriptions->toArray());        $inventory = \App\Models\MedicineCatalog::with(['batches' => function($query) {
            $query->where('current_quantity', '>', 0)->orderBy('expiry_date', 'asc');
        }])->get()->map(function($m) {
            return [
                'id' => $m->id,
                'name' => $m->generic_name,
                'brand_name' => $m->brand_name,
                'price' => $m->price_per_unit,
                'totalStock' => $m->batches->sum('current_quantity'),
                'is_available' => $m->batches->sum('current_quantity') > 0,
                'batches' => $m->batches->map(fn($b) => [
                    'id'     => $b->id,           
                    'sku_id' => $b->sku_batch_id, 
                    'expiry' => $b->expiry_date,
                    'stock'  => $b->current_quantity,
                ]),
            ];
        })->sortByDesc('is_available')->values();

        return Inertia::render('Admin/PatientManagement', [
            'patients'           => $patients,
            'selectablePatients' => $selectablePatients,
            'rooms'              => $rooms,
            'inventory'          => $inventory,
            'doctors'            => $doctors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'contact_no' => 'required|string|max:20',
            'address' => 'required|string',
            'civil_status' => 'required|string',
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

    public function show($id)
    {
        // Load patient with all necessary history
        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits', 'prescriptions.medicine'])->findOrFail($id);

        // Get the most recent admission for "Current Status"
        $latestAdmission = $patient->admissions->sortByDesc('admission_date')->first();
        
        // Get latest vitals from PatientVisit model
        $latestVisit = $patient->visits->sortByDesc('visit_date')->first();

        return Inertia::render('Doctor/PatientProfile', [
            'patient' => [
                'id'               => $patient->patient_id, // Accessor from your model
                'name'             => $patient->full_name,  // Accessor from your model
                'dob'              => $patient->birth_date,
                'gender'           => $patient->gender,
                'phone'            => $patient->contact_no,
                'email'            => $patient->email ?? 'N/A', // Suggestion: add 'email' to migration later
                'address'          => $patient->address,
                'emergencyContact' => $patient->emergency_contact_name,
                'emergencyPhone'   => $patient->emergency_contact_number,
                'status'           => $latestAdmission ? strtoupper($latestAdmission->status) : 'OUTPATIENT',
                'admissionDate'    => $latestAdmission?->admission_date ?? 'N/A',
                'doctor'           => $latestAdmission?->staff ? "Dr. {$latestAdmission->staff->last_name}" : 'N/A',
                'room'             => $latestAdmission?->room?->room_location ?? 'N/A',
                'diagnosis'        => $latestAdmission?->diagnosis ?? 'No active diagnosis.',
                'latestNote'       => $patient->medical_history ?? 'No recent notes.',
                
                // Mapping Vitals from the visits table
                'bp'     => $latestVisit->blood_pressure ?? '—', 
                'hr'     => $latestVisit->heart_rate ?? '—',
                'temp'   => $latestVisit->temperature ?? '—',
                'weight' => $latestVisit->weight ?? '—',
            ],
            'admissionHistory' => $patient->admissions->map(fn($adm) => [
                'id'         => 'A-' . str_pad($adm->id, 5, '0', STR_PAD_LEFT),
                'admitted'   => $adm->admission_date,
                'discharged' => $adm->discharge_date ?? 'Active',
                'reason'     => $adm->diagnosis,
            ]),
            'prescriptionHistory' => $patient->prescriptions->map(fn($pres) => [
            'id'        => $pres->id,
            'date'      => $pres->date_prescribed, 
            'medicine'  => $pres->medicine ? $pres->medicine->medicine_name : 'Unknown', 
            'dosage'    => $pres->dosage,
            'frequency' => $pres->frequency,
        ]),
        'medicines' => \App\Models\MedicineCatalog::all(),
        ]);
    }
}