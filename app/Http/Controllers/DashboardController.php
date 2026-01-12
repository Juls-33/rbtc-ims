<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use Inertia\Inertia;
use App\Models\Staff;
use App\Models\MedicineCatalog;
use App\Models\MedicineBatch;
use App\Models\BillDetail;
use Illuminate\Http\Request;
// Added the missing EncryptedField import
use ParagonIE\CipherSweet\EncryptedField;
use ParagonIE\CipherSweet\BlindIndex;
use ParagonIE\CipherSweet\CipherSweet;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Staff::query();

        if ($search) {
            $engine = app(CipherSweet::class);

            // 1. Calculate Blind Index for First Name
            $firstNameField = (new EncryptedField($engine, 'staff', 'first_name'))
                ->addBlindIndex(new BlindIndex('first_name_index'));
            $firstNameHash = $firstNameField->getBlindIndex($search, 'first_name_index');

            // 2. Calculate Blind Index for Last Name
            $lastNameField = (new EncryptedField($engine, 'staff', 'last_name'))
                ->addBlindIndex(new BlindIndex('last_name_index'));
            $lastNameHash = $lastNameField->getBlindIndex($search, 'last_name_index');

            // 3. Filter the query
            $query->where('first_name_index', $firstNameHash)
                  ->orWhere('last_name_index', $lastNameHash);
        }

        return Inertia::render('Dashboard', [
            // Use the $query we built above
            'doctors' => (clone $query)->where('role', 'Doctor')->get(),
            
            'nurses'  => Staff::where('role', 'Nurse')->limit(5)->get(),
            
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