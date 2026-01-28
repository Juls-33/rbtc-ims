<?php

namespace App\Http\Controllers;

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
        return Inertia::render('Doctor/Patients');
    }

    /**
     * Display a specific Patient's Profile
     */
    public function showPatient($id)
    {
        // We pass the 'patientId' to the React component
        return Inertia::render('Doctor/PatientProfile', [
            'patientId' => $id
        ]);
    }
}