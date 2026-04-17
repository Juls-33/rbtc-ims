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

        $months = collect(range(5, 0))->map(function ($i) {
            return now()->subMonths($i);
        });

        // Generate Financial Trends
        $revenueTrends = $months->map(function ($date) {
            $inpatient = \App\Models\Admission::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->sum('amount_paid');
            $outpatient = \App\Models\PatientVisit::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->sum('amount_paid');
            return [
                'label'      => $date->format('M y'),
                'inpatient'  => (float)$inpatient,
                'outpatient' => (float)$outpatient,
                'total'      => (float)($inpatient + $outpatient),
            ];
        });

        // Generate Patient Volume Trends
        $censusTrends = $months->map(function ($date) {
            return [
                'label'      => $date->format('M y'),
                'admissions' => \App\Models\Admission::whereMonth('admission_date', $date->month)->whereYear('admission_date', $date->year)->count(),
                'outpatient' => \App\Models\PatientVisit::whereMonth('visit_date', $date->month)->whereYear('visit_date', $date->year)->count(),
            ];
        });

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
                'unpaidAdmitted'   => Admission::where('status', 'ADMITTED')->where('balance', '>', 0)->count(),
                'unpaidDischarged' => Admission::where('status', 'DISCHARGED')->where('balance', '>', 0)->count(),
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

            'revenueTrends' => $revenueTrends,
            'censusTrends'  => $censusTrends,
        ]);
    }
}