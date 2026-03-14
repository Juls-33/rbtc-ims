<?php
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\NurseController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\RecoveryController;
use App\Http\Controllers\StaffLogController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\OutpatientBillController;
use App\Http\Controllers\InpatientBillController;
use App\Http\Controllers\ArchiveController;

Route::get('/', function () {
    if (auth()->check()) {
        $role = auth()->user()->role;
        return redirect()->route($role === 'Admin' ? 'dashboard' : strtolower($role) . '.dashboard');
    }

    return Inertia::render('Welcome', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->name('welcome');

Route::post('/recover-admin', [RecoveryController::class, 'recoverAdmin'])->name('admin.recover');
// Route::post('/request-reset', [RecoveryController::class, 'requestReset'])->name('staff.request_reset');
Route::get('/admin/staff-management/logs', [StaffLogController::class, 'index'])->name('admin.staff.logs');
Route::get('billing/inpatient/{id}/pdf', [InpatientBillController::class, 'generatePDF'])->name('admin.billing.inpatient.pdf');
Route::get('billing/outpatient/{id}/pdf', [OutpatientBillController::class, 'generatePDF'])->name('admin.billing.outpatient.pdf');

Route::middleware(['auth'])->group(function () {
    Route::get('/force-password-change', function () {
        return Inertia::render('Auth/ForceChangePassword');
    })->name('password.force-change');

    Route::post('/force-password-change', [StaffController::class, 'forceUpdatePassword'])
        ->name('password.force-update');
});

// --- AUTHENTICATED SYSTEM ROUTES ---
Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/notifications/dismiss', [NotificationController::class, 'dismiss'])->name('notifications.dismiss');
    Route::post('/notifications/dismiss-all', [NotificationController::class, 'dismissAll'])->name('notifications.dismiss_all');

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Inventory
        Route::get('/inventory', [MedicineController::class, 'index'])->name('inventory.index');
        Route::post('/inventory', [MedicineController::class, 'store'])->name('inventory.store');
        Route::put('/inventory/{id}', [MedicineController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{id}', [MedicineController::class, 'destroy'])->name('inventory.destroy');
        Route::post('/inventory/{id}/batches', [MedicineController::class, 'updateBatches'])->name('inventory.batches.update');

        // Patients
        Route::get('/patients', [PatientController::class, 'index'])->name('admin.patients');
        Route::post('/patients', [PatientController::class, 'store'])->name('admin.patients.store');
        Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('admin.patients.update');
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('admin.patients.destroy');

        // Staff
        Route::get('/staff', [StaffController::class, 'index'])->name('admin.staff');
        Route::post('/staff', [StaffController::class, 'store'])->name('admin.staff.store');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('admin.staff.update');
        Route::put('/staff/{staff}/deactivate', [StaffController::class, 'deactivate'])->name('admin.staff.deactivate');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('admin.staff.destroy');
        Route::put('/staff/{staff}/reset-password', [StaffController::class, 'resetPassword'])->name('admin.staff.reset-password');

        // Admissions & Visits
        Route::post('/admissions', [AdmissionController::class, 'store'])->name('admin.admissions.store');
        Route::put('/admissions/{admission}', [AdmissionController::class, 'update'])->name('admin.admissions.update');
        Route::post('/admissions/discharge', [AdmissionController::class, 'discharge'])->name('admin.admissions.discharge');
        Route::post('/visits', [PatientVisitController::class, 'store'])->name('admin.visits.store');
        Route::delete('/admissions/{id}', [AdmissionController::class, 'destroy'])->name('admin.admissions.destroy');

        // Rooms
        Route::get('/rooms', [RoomController::class, 'index'])->name('admin.rooms');
        Route::post('/rooms', [RoomController::class, 'store'])->name('admin.rooms.store');
        Route::put('/rooms/{room}', [RoomController::class, 'update'])->name('admin.rooms.update');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('admin.rooms.destroy');

        // Outpatient Billing
        Route::post('billing/outpatient', [OutpatientBillController::class, 'store'])->name('admin.billing.outpatient.store');
        Route::post('billing/add-item', [OutpatientBillController::class, 'addItem'])->name('admin.billing.addItem');
        Route::put('billing/update-item/{id}', [OutpatientBillController::class, 'updateItem'])->name('admin.billing.updateItem');
        Route::delete('billing/remove-item/{id}', [OutpatientBillController::class, 'removeItem'])->name('admin.billing.removeItem');
        Route::delete('/admin/visits/{id}', [PatientVisitController::class, 'destroy'])->name('admin.visits.destroy');
        Route::put('visits/{id}/fee', [PatientVisitController::class, 'updateFee'])->name('admin.visits.updateFee');

        // Inpatient Billing
        Route::prefix('billing/inpatient')->group(function () {
            Route::post('add-item', [InpatientBillController::class, 'addItem'])->name('admin.billing.inpatient.addItem');
            Route::put('update-item/{id}', [InpatientBillController::class, 'updateItem'])->name('admin.billing.inpatient.updateItem');
            Route::delete('remove-item/{id}', [InpatientBillController::class, 'removeItem'])->name('admin.billing.inpatient.removeItem');
            Route::post('pay', [InpatientBillController::class, 'pay'])->name('admin.billing.inpatient.pay');
        });
        Route::get('/archive', [ArchiveController::class, 'index'])->name('admin.archive');
        Route::post('/archive/{id}/restore', [ArchiveController::class, 'restore'])->name('admin.archive.restore');
        Route::get('/patient-logs', [App\Http\Controllers\PatientLogController::class, 'index'])->name('admin.patient.logs');
        Route::delete('/archive/{id}', [ArchiveController::class, 'destroy'])->name('admin.archive.destroy');
    });

    // Doctor Routes
    Route::middleware(['doctor'])->group(function () {
        Route::get('/doctor/dashboard', [DoctorController::class, 'dashboard'])->name('doctor.dashboard');
        Route::get('/doctor/patients', [DoctorController::class, 'patients'])->name('doctor.patients');
        Route::get('/doctor/patients/{id}', [DoctorController::class, 'showPatient'])->name('doctor.patients.profile');
        
        // Vitals
        Route::post('/doctor/patients/{id}/vitals', [DoctorController::class, 'updateVitals'])->name('doctor.patients.vitals.update');
        
        // Prescriptions
        Route::post('/doctor/patients/{id}/prescriptions', [DoctorController::class, 'storePrescription'])->name('doctor.prescriptions.store');
        Route::put('/doctor/prescriptions/{id}', [DoctorController::class, 'updatePrescription'])->name('doctor.prescriptions.update');
        Route::delete('/doctor/prescriptions/{id}', [DoctorController::class, 'destroyPrescription'])->name('doctor.prescriptions.destroy');

        // Consultation Note
        Route::post('/doctor/patients/{id}/consultation', [DoctorController::class, 'storeConsultation'])->name('doctor.patients.consultation.store');
        Route::delete('/doctor/consultations/{id}', [DoctorController::class, 'destroyConsultation'])->name('doctor.patients.consultation.destroy');
    });

    // Nurse Routes
    Route::middleware(['nurse'])->prefix('nurse')->group(function () {
        Route::get('/dashboard', [NurseController::class, 'dashboard'])->name('nurse.dashboard');
        Route::get('/patients', [NurseController::class, 'patients'])->name('nurse.patients');
        Route::get('/patients/{id}', [NurseController::class, 'showPatient'])->name('nurse.patients.profile');
        Route::post('/patients/{id}/vitals', [NurseController::class, 'updateVitals'])->name('nurse.vitals.update');
        Route::post('/prescriptions/{prescription}/administer', [NurseController::class, 'administerMedication'])
            ->name('nurse.prescriptions.administer');
    });
});

require __DIR__.'/auth.php';