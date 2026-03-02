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
    public function index(Request $request)
    {
        // 1. Build the Query with Server-Side Filters
        $query = Patient::query();

        if ($request->search) {
            $searchTerm = $request->search;

            $query->where(function($q) use ($searchTerm) {
                $q->whereBlind('first_name', 'first_name_index', $searchTerm)
                ->orWhereBlind('last_name', 'last_name_index', $searchTerm)
                ->orWhere('id', $searchTerm); 
            });
        }

        if ($request->tab === 'inpatient') {
            $query->has('admissions');
        } elseif ($request->tab === 'outpatient') {
            $query->has('visits');
        }

        // 2. Fetch Paginated Results (This prevents the lag)
        $patientsPaginator = $query->with([
            'admissions.room', 
            'admissions.staff', 
            'admissions.roomStays', 
            'admissions.billItems',
            'visits.bill_items.medicine', 
            'visits.bill_items.batch'      
        ])
        ->latest()
        ->paginate(10)
        ->withQueryString();

        // 3. 🔥 TRANSFORM: Map only the 10 records on the current page
        $patientsPaginator->getCollection()->transform(function ($patient) {
            
            // JIT SYNC: Only runs for the 10 patients currently visible
            $patient->admissions->each(function($adm) {
                if (strtolower($adm->status) === 'admitted') {
                    $adm->syncLiveTotals(); 
                }
            });

            // Deterministic sort for admissions
            $allAdmissions = $patient->admissions->sort(function($a, $b) {
                if ($a->admission_date === $b->admission_date) {
                    return $b->id <=> $a->id;
                }
                return strtotime($b->admission_date) <=> strtotime($a->admission_date);
            })->values();

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
                
                'is_admitted'     => $active !== null, 
                'has_admissions'  => $allAdmissions->count() > 0,
                'has_visits'      => $patient->visits->count() > 0,
                'latest_admission_status' => $latest ? strtoupper($latest->status) : null,
                'status'     => $active ? 'ADMITTED' : ($latest ? strtoupper($latest->status) : 'OUTPATIENT'),
                'type'       => ($active || $latest) ? 'inpatient' : 'outpatient',
                
                'current_room'        => $active?->room?->room_location ?? 'N/A',
                'admission_date'      => $active?->admission_date,
                'discharge_date'      => $active?->discharge_date, 
                'attending_physician' => $active?->staff ? "Dr. {$active->staff->first_name} {$active->staff->last_name}" : 'N/A',
                
                'admission_history' => $allAdmissions->map(fn($adm) => [
                    'id'             => $adm->id,
                    'admission_date' => $adm->admission_date,
                    'discharge_date' => $adm->discharge_date,
                    'diagnosis'      => $adm->diagnosis,
                    'total_bill'     => (float)$adm->total_bill,   
                    'balance'        => (float)$adm->balance, 
                    'amount_paid'    => (float)$adm->amount_paid,
                    'statements'     => $adm->getStatements(),
                    'room_stays'     => $adm->roomStays,
                    'bill_items'     => $adm->billItems,
                    'staff'          => $adm->staff,
                    'room'           => $adm->room,
                ])->values(),

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
                    'total_bill'         => (float)$active->total_bill,
                    'balance'            => (float)$active->balance,
                    'room_stays'         => $active->roomStays, 
                    'bill_items'         => $active->billItems,
                ] : null,

                'visit_history' => $patient->visits->sortByDesc('visit_date')->values()->map(fn($visit) => [
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
                        'medicine'    => $item->medicine ? [
                            'generic_name' => $item->medicine->generic_name,
                            'brand_name'   => $item->medicine->brand_name,
                        ] : null,
                        'quantity'    => $item->quantity,
                        'unit_price'  => (float)$item->unit_price,
                        'total_price' => (float)$item->total_price,
                    ]),
                ]),
            ];
        });

        // 4. Auxiliary Data for Modals
        $selectablePatients = Patient::with(['admissions' => fn($q) => $q->latest()])
            ->orderBy('last_name')
            ->get()
            ->map(fn($p) => [
                'id'   => $p->id,
                'name' => $p->full_name,
                'status' => ($p->admissions->first() && strtolower($p->admissions->first()->status) === 'admitted') ? 'ADMITTED' : 'OUTPATIENT',
            ]);

        $rooms = Room::select('id', 'room_location', 'room_rate', 'status')->get();
        $doctors = Staff::whereRaw('LOWER(role) = ?', ['doctor'])->select('id', 'first_name', 'last_name')->get();

        $inventory = \App\Models\MedicineCatalog::with(['batches' => fn($q) => $q->where('current_quantity', '>', 0)->orderBy('expiry_date', 'asc')])
        ->get()
        ->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->generic_name,
            'brand_name' => $m->brand_name,
            'price' => (float)$m->price_per_unit,
            'sku_id' => $m->sku_id, 
            'totalStock' => (int)$m->batches->sum('current_quantity'),
            'batches' => $m->batches->map(fn($b) => [
                'id' => $b->id, 
                'sku_id' => $b->sku_batch_id, 
                'expiry' => $b->expiry_date, 
                'stock' => (int)$b->current_quantity,
            ]),
        ]);

        return Inertia::render('Admin/PatientManagement', [
            'patients'           => $patientsPaginator, // 🔥 Corrected: Passing the Paginator object
            'selectablePatients' => $selectablePatients,
            'rooms'              => $rooms,
            'inventory'          => $inventory,
            'doctors'            => $doctors,
            'filters'            => $request->only(['search', 'tab']) // Pass filters back to React
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'contact_no' => 'nullable|string|size:11',
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
            'password' => ['required', 'current_password'],
            'reason'   => 'required|string|min:5',
        ]);

        $staff = auth()->user();
        $patientName = $patient->full_name;

        // 🔥 Archive instead of delete
        $patient->archive($request->reason, $staff->id);

        // 🔥 Audit Trail
        \App\Models\PatientLog::create([
            'staff_id'    => $staff->id,
            'patient_id'  => null, // Null because the original record is gone
            'action'      => 'ARCHIVED',
            'description' => "Patient {$patientName} (ID: {$patient->patient_id}) archived. Reason: {$request->reason}",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->route('admin.patients')
            ->with('success', "Patient record for {$patientName} has been moved to the Archive.");
    }

    public function show($id)
    {
        // Load patient with all necessary history
        $patient = Patient::with(['admissions.room', 'admissions.staff', 'visits', 'prescriptions.medicine'])->findOrFail($id);

        $allAdmissions = $patient->admissions->sort(function($a, $b) {
            if ($a->admission_date === $b->admission_date) {
                return $b->id <=> $a->id;
            }
            return strtotime($b->admission_date) <=> strtotime($a->admission_date);
        });
        $activeAdmission = $allAdmissions->first(fn($adm) => strtolower($adm->status) === 'admitted');
        $latestAdmission = $allAdmissions->first();
        
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
                'status' => $activeAdmission ? 'ADMITTED' : ($latestAdmission ? strtoupper($latestAdmission->status) : 'OUTPATIENT'),
                'admissionDate' => ($activeAdmission ?? $latestAdmission)?->admission_date ?? 'N/A',
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