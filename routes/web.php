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
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\RecoveryController;
use App\Http\Controllers\StaffLogController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\OutpatientBillController;

Route::get('/', function () {
    // If already logged in, send them to their dashboard
    if (auth()->check()) {
        $role = auth()->user()->role;
        return redirect()->route($role === 'Admin' ? 'dashboard' : strtolower($role) . '.dashboard');
    }

    // Otherwise, render the integrated Welcome/Login page
    return Inertia::render('Welcome', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->name('welcome');

//Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/recover-admin', [RecoveryController::class, 'recoverAdmin'])->name('admin.recover');
Route::post('/request-reset', [RecoveryController::class, 'requestReset'])->name('staff.request_reset');
Route::get('/admin/staff-management/logs', [StaffLogController::class, 'index'])->name('admin.staff.logs');
//Route::get('/admin/rooms', [RoomController::class, 'index'])->name('admin.rooms');
Route::middleware(['auth', 'verified'])->group(function () {
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

        // Rooms - CLEANED UP
        Route::get('/rooms', [RoomController::class, 'index'])->name('admin.rooms');
        Route::post('/rooms', [RoomController::class, 'store'])->name('admin.rooms.store');
        Route::put('/rooms/{room}', [RoomController::class, 'update'])->name('admin.rooms.update');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('admin.rooms.destroy');

        // Outpatient Billing
        Route::post('billing/outpatient', [OutpatientBillController::class, 'store'])
         ->name('admin.billing.outpatient.store');
        Route::post('billing/add-item', [OutpatientBillController::class, 'addItem'])
            ->name('admin.billing.addItem');
        Route::put('billing/update-item/{id}', [OutpatientBillController::class, 'updateItem'])->name('admin.billing.updateItem');
        Route::delete('billing/remove-item/{id}', [OutpatientBillController::class, 'removeItem'])->name('admin.billing.removeItem');
    });

    // Doctor Routes
    Route::middleware(['auth', 'doctor'])->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard'])->name('doctor.dashboard');
        Route::get('/patients', [DoctorController::class, 'patients'])->name('doctor.patients');
        Route::get('/patients/{id}', [DoctorController::class, 'showPatient'])->name('doctor.patients.profile');
        Route::get('/profile', fn() => Inertia::render('Doctor/Profile'))->name('doctor.profile');
        
        // Vitals
        Route::post('/patients/{id}/vitals', [DoctorController::class, 'updateVitals'])->name('doctor.patients.vitals.update');
        
        // Prescriptions - POINT THESE TO DoctorController
        Route::post('/patients/{id}/prescriptions', [DoctorController::class, 'storePrescription'])->name('doctor.prescriptions.store');
        Route::put('/prescriptions/{id}', [DoctorController::class, 'updatePrescription'])->name('doctor.prescriptions.update');
        
        // If you have a delete method in DoctorController, point it there too
        Route::delete('/prescriptions/{id}', [DoctorController::class, 'destroyPrescription'])->name('doctor.prescriptions.destroy');
    });

    // Nurse Routes
    Route::prefix('nurse')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Nurse/Dashboard'))->name('nurse.dashboard');
    Route::get('/patients', fn() => Inertia::render('Nurse/Patients'))->name('nurse.patients');
    Route::get('/patients/{id}', fn($id) => Inertia::render('Nurse/PatientProfile', ['id' => $id])) ->name('nurse.patients.profile');
    Route::get('/profile', fn() => Inertia::render('Nurse/Profile'))->name('nurse.profile');
});
});


require __DIR__.'/auth.php';
