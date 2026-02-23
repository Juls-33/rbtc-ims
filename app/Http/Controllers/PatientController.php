<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use App\Models\PatientVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        // 1. Fetch selection data for Modals
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

        $doctors = Staff::whereRaw('LOWER(role) = ?', ['doctor'])
            ->select('id', 'first_name', 'last_name')
            ->get();

        // 2. Fetch Patients and PERFORM ACTIVE SYNC
        $patients = Patient::with([
            'admissions.room', 
            'admissions.staff', 
            'admissions.roomStays', 
            'admissions.billItems',
            'visits.bill_items.medicine', 
            'visits.bill_items.batch'      
        ])
        ->latest()
        ->get() 
        ->map(function ($patient) {
            
            // 🔥 THE JIT SYNC: Ensure database columns are updated for time elapsed
            // This fixes the "Started Feb 21, now Feb 23" discrepancy.
            $patient->admissions->each(function($adm) {
                if (strtolower($adm->status) === 'admitted') {
                    $adm->syncLiveTotals(); 
                }
            });

            $allAdmissions = $patient->admissions->sortByDesc('admission_date');

            // Re-fetch the collections after sync to get fresh data in memory
            $active = $allAdmissions->first(fn($adm) => strtolower($adm->status) === 'admitted');
            $latest = $allAdmissions->first();

            return [
                'id'         => $patient->id,
                'patient_id' => $patient->patient_id,
                'name'       => $patient->full_name,
                'contact_no' => $patient->contact_no,
                'first_name' => $patient->first_name, 
                'last_name'  => $patient->last_name,
                'dob'        => $patient->birth_date,
                'gender'     => $patient->gender,
                'civil_status' => $patient->civil_status,
                'address'    => $patient->address,
                'emergency_contact_name'   => $patient->emergency_contact_name,
                'emergency_contact_relation' => $patient->emergency_contact_relation,
                'emergency_contact_number' => $patient->emergency_contact_number,
                
                'bill_status' => 'UNPAID', 
                'status'     => $latest ? strtoupper($latest->status) : 'OUTPATIENT',
                'type'       => ($active || $latest) ? 'inpatient' : 'outpatient',
                
                'current_room'        => $active?->room?->room_location ?? 'N/A',
                'admission_date'      => $active?->admission_date,
                'discharge_date'      => $active?->discharge_date, 
                'attending_physician' => $active?->staff ? "Dr. {$active->staff->first_name} {$active->staff->last_name}" : 'N/A',
                
                // --- ADMISSION HISTORY TABLE ---
                'admission_history' => $allAdmissions->map(function ($adm) {
                    return [
                        'id'             => $adm->id,
                        'admission_date' => $adm->admission_date,
                        'discharge_date' => $adm->discharge_date,
                        'diagnosis'      => $adm->diagnosis,
                        'total_bill'     => (float)$adm->total_bill,   
                        'balance'        => (float)$adm->balance, 
                        'amount_paid'    => (float)$adm->amount_paid,
                    ];
                })->values(),

                // --- ACTIVE ADMISSION (FOR MODAL) ---
                'active_admission' => $active ? [
                    'id'                 => $active->id,
                    'patient_name'       => $patient->full_name,
                    'patient_id_display' => $patient->patient_id,
                    'admission_date'     => date('Y-m-d\TH:i', strtotime($active->admission_date)),
                    'staff_id'           => (int)$active->staff_id,
                    'room_id'            => (int)$active->room_id,
                    'diagnosis'          => $active->diagnosis,
                    'status'             => $active->status,
                    'statements'         => $active->getStatements(), 
                    'amount_paid'        => (float)$active->amount_paid,
                    // Use database snapshots updated by the sync above
                    'total_bill'         => (float)$active->total_bill,
                    'balance'            => (float)$active->balance,
                    'room_stays'         => $active->roomStays, 
                    'bill_items'         => $active->billItems,
                ] : null,

                'visit_history' => $patient->visits->sortByDesc('visit_date')->map(fn($visit) => [
                    'id'       => $visit->id,
                    'visit_id' => 'V-' . str_pad($visit->id, 5, '0', STR_PAD_LEFT),
                    'date'     => $visit->visit_date,
                    'weight'   => $visit->weight ? "{$visit->weight}KG" : 'N/A',
                    'reason'   => $visit->reason,
                    'checkup_fee' => (float)$visit->checkup_fee, 
                    'total_bill'  => (float)($visit->total_bill ?? $visit->checkup_fee),
                    'amount_paid' => (float)($visit->amount_paid ?? 0),
                    'balance'     => (float)($visit->balance ?? $visit->checkup_fee),
                    'status'      => $visit->status,
                    'bill_items'  => $visit->bill_items->map(fn($item) => [
                        'id'          => $item->id,
                        'medicine_id' => $item->medicine_id,
                        'batch_id'    => $item->batch_id,
                        'quantity'    => $item->quantity,
                        'unit_price'  => (float)$item->unit_price,
                        'total_price' => (float)$item->total_price,
                        'medicine'    => $item->medicine ? [
                            'generic_name' => $item->medicine->generic_name,
                            'brand_name'   => $item->medicine->brand_name,
                        ] : null,
                    ]),
                ]),
            ];
        });      

        $inventory = \App\Models\MedicineCatalog::with(['batches' => function($query) {
            $query->where('current_quantity', '>', 0)->orderBy('expiry_date', 'asc');
        }])->get()->map(function($m) {
            return [
                'id' => $m->id,
                'name' => $m->generic_name,
                'brand_name' => $m->brand_name,
                'price' => (float)$m->price_per_unit,
                'totalStock' => (int)$m->batches->sum('current_quantity'),
                'is_available' => $m->batches->sum('current_quantity') > 0,
                'batches' => $m->batches->map(fn($b) => [
                    'id'     => $b->id,           
                    'sku_id' => $b->sku_batch_id, 
                    'expiry' => $b->expiry_date,
                    'stock'  => (int)$b->current_quantity,
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