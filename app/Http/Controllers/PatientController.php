<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    // app/Http/Controllers/PatientController.php
    public function index(Request $request)
    {
        $query = Patient::query();

        // 1. FILTER: Tab (Inpatient/Outpatient)
        if ($request->filled('tab') && $request->tab !== 'all') {
            if ($request->tab === 'inpatient') {
                $query->whereHas('admissions');
            } else {
                $query->whereDoesntHave('admissions');
            }
        }

        // 2. SEARCH: Using Blind Indexes
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereBlindIndex('first_name', 'first_name_index', $search)
                ->orWhereBlindIndex('last_name', 'last_name_index', $search);
            });
        }

        $patients = $query->with('admissions')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($patient) => [
                'id' => $patient->id,
                'patient_id' => $patient->patient_id,
                'name' => $patient->full_name,
                'dob' => $patient->birth_date,
                'contact' => $patient->contact_no,
                'status' => 'Stable',
                'bill_status' => 'PAID',
                'type' => $patient->admissions->isNotEmpty() ? 'inpatient' : 'outpatient',
            ]);

        return Inertia::render('Admin/PatientManagement', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'tab']),
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
            // CipherSweet hooks here to encrypt data before saving
            Patient::create($validated);
            return redirect()->back()->with('success', 'Patient record created successfully.');
        });
    }
}