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
        Route::get('/staff', fn() => Inertia::render('Admin/StaffManagement'))->name('admin.staff');
        Route::post('/staff', [StaffController::class, 'store'])->name('admin.staff.store');
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
