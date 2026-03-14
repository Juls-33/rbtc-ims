<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\PatientVisit;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $staffQuery = Staff::query();

        if ($search) {
            $staffQuery->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return Inertia::render('Dashboard', [
            'doctors' => (clone $staffQuery)->where('role', 'Doctor')->get(),
            'nurses'  => (clone $staffQuery)->where('role', 'Nurse')->get(),
            'filters' => $request->only(['search']),

            // 1. Fixed Room Stats
            'roomStats' => [
                'total'     => Room::count(),
                'available' => Room::where('status', 'Available')->count(),
                'occupied'  => Room::where('status', 'Occupied')->count(),
            ],

            // 2. Fixed Patient Census
            'patientStats' => [
                'total'    => Patient::count(),
                'admitted' => Admission::where('status', 'ADMITTED')->count(),
            ],

            // 3. Fixed Billing Stats (Sums Inpatient + Outpatient revenue)
            'billingStats' => [
                'monthlyEarnings'  => (float)Admission::whereMonth('created_at', now()->month)->sum('amount_paid') + 
                                     (float)PatientVisit::whereMonth('created_at', now()->month)->sum('amount_paid'),
                'unpaidInpatient'  => Admission::where('status', 'ADMITTED')->where('balance', '>', 0)->count(),
                'unpaidOutpatient' => PatientVisit::where('balance', '>', 0)->count(),
            ],

            // 4. Fixed High Balance List (Matches frontend 'unpaidList' key)
            'unpaidList' => Admission::with('patient')
                ->where('status', 'ADMITTED')
                ->where('balance', '>', 0)
                ->orderByDesc('balance')
                ->limit(5)
                ->get()
                ->map(fn($a) => [
                    'name'    => $a->patient->full_name,
                    'balance' => $a->balance,
                ]),

            // 5. Fixed Inventory Stats
            'inventoryStats' => [
                'critical' => MedicineCatalog::whereHas('batches', function($q) {
                    $q->where('current_quantity', '<=', 10);
                })->count(),
                'expired'  => MedicineBatch::where('expiry_date', '<', now())->count(),
                'expiring' => MedicineBatch::whereBetween('expiry_date', [now(), now()->addMonths(3)])->count(),
            ],
        ]);
    }
}