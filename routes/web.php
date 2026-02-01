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
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\PatientVisitController;


Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

//Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        // Add placeholders for Inventory, Patients, Staff
        Route::post('/inventory', [MedicineController::class, 'store'])->name('inventory.store');
        Route::put('/inventory/{id}', [MedicineController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{id}', [MedicineController::class, 'destroy'])->name('inventory.destroy');
        Route::post('/inventory/{id}/batches', [MedicineController::class, 'updateBatches'])->name('inventory.batches.update');
        Route::get('/inventory', [MedicineController::class, 'index'])->name('inventory.index');
        //patient management
        //Route::get('/patients', fn() => Inertia::render('Admin/PatientManagement'))->name('admin.patients');
        Route::get('/patients', [PatientController::class, 'index'])->name('admin.patients');
        Route::post('/patients', [PatientController::class, 'store'])->name('admin.patients.store');
        Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('admin.patients.update');
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('admin.patients.destroy');
        
        //CRUD for staff management
        // 1. Directory List & Search
        Route::get('/staff', [StaffController::class, 'index'])->name('admin.staff');

        // 2. Create New Personnel
        Route::post('/staff', [StaffController::class, 'store'])->name('admin.staff.store');

        // 3. Update Existing Personnel Details
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('admin.staff.update');

        // 4. Deactivate/Activate Toggle (using PUT for state change)
        Route::put('/staff/{staff}/deactivate', [StaffController::class, 'deactivate'])->name('admin.staff.deactivate');

        // 5. Permanent Deletion
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('admin.staff.destroy');

        // 6. Password Reset (Optional - pointing to a method we can build next)
        Route::put('/staff/{staff}/reset-password', [StaffController::class, 'resetPassword'])->name('admin.staff.reset-password');


        
        //CRUD for admission
        Route::post('/admissions', [AdmissionController::class, 'store'])->name('admin.admissions.store');
        Route::put('/admissions/{admission}', [AdmissionController::class, 'update'])->name('admin.admissions.update');        
        //  Discharge Route
        Route::post('/admissions/discharge', [AdmissionController::class, 'discharge'])->name('admin.admissions.discharge');

        Route::post('/visits', [PatientVisitController::class, 'store'])->name('admin.visits.store');
        

    });

    // Doctor Routes
    Route::prefix('doctor')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard'])->name('doctor.dashboard');
        Route::get('/patients', [DoctorController::class, 'patients'])->name('doctor.patients');
        Route::get('/patients/{id}', [DoctorController::class, 'showPatient'])->name('doctor.patients.profile');
        Route::get('/profile', fn() => Inertia::render('Doctor/Profile'))->name('doctor.profile');
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
