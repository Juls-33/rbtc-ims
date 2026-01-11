<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Staff;
//use App\Models\MedicineBatch; // Assuming you have this model
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Fetch Stats for the top cards
        $admittedCount = Admission::where('status', 'Active')->count();
        $criticalStock = 4; // Placeholder for now
        $expiringSoon = 4; // Placeholder for now
        $billsAlert = 1;   // Placeholder for now

        // 2. Fetch Doctors and Nurses for the bottom lists
        $doctors = Staff::where('role', 'Doctor')->get();
        $nurses = Staff::where('role', 'Nurse')->get();

        return view('dashboard', compact(
            'admittedCount', 
            'criticalStock', 
            'expiringSoon', 
            'billsAlert',
            'doctors',
            'nurses'
        ));
    }
}
