<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use Inertia\Inertia;
use App\Models\Staff;
use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\BillDetail;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Staff::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return Inertia::render('Dashboard', [
            'doctors' => (clone $query)->where('role', 'Doctor')->get(),
            'nurses'  => (clone $query)->where('role', 'Nurse')->get(),
            
            'filters' => $request->only(['search']),
            
            'criticalStock' => MedicineCatalog::whereHas('batches', function($q) {
                $q->where('current_quantity', '<=', 10);
            })->count(),
            'expiringSoon'  => MedicineBatch::where('expiry_date', '<=', now()->addMonths(3))->count(),
            'admittedCount' => Admission::where('status', 'Active')->count(),
            'billsAlert'    => BillDetail::where('payment_status', 'Pending')->count(),
        ]);
    }
}