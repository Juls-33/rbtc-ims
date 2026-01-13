<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;



Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

//Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        // Add placeholders for Inventory, Patients, Staff
        Route::get('/inventory', fn() => Inertia::render('Admin/Inventory'))->name('admin.inventory');
        Route::get('/staff', fn() => Inertia::render('Admin/StaffManagement'))->name('admin.staff');
    });

    // Doctor Routes
    Route::prefix('doctor')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Doctor/Dashboard'))->name('doctor.dashboard');
        Route::get('/patients', fn() => Inertia::render('Doctor/Patients'))->name('doctor.patients');
    });

    // Nurse Routes
    Route::prefix('nurse')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Nurse/Dashboard'))->name('nurse.dashboard');
        Route::get('/patients', fn() => Inertia::render('Nurse/Patients'))->name('nurse.patients');
    });
});

require __DIR__.'/auth.php';
