<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admissions', function (Blueprint $table) {
            $table->id(); // This acts as your admission_id
            
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');

    
            $table->string('diagnosis', 100); 
            $table->string('status', 100); 
            $table->date('admission_date');
            $table->date('discharge_date')->nullable(); // Set to nullable if patient is still admitted
            
            $table->timestamps(); // Generates created_at and updated_at
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
