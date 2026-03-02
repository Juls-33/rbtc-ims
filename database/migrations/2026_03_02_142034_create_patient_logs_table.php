<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_logs', function (Blueprint $table) {
            $table->id();
            
            // Who did it?
            $table->foreignId('staff_id')->constrained('staff');
            
            // To which patient? (Nullable if the patient is permanently deleted later)
            $table->foreignId('patient_id')->nullable()->constrained('patients')->onDelete('set null');
            
            // What happened?
            $table->string('action'); // e.g., 'CREATED', 'UPDATED', 'ARCHIVED'
            $table->text('description');
            
            // Security metadata
            $table->string('ip_address')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_logs');
    }
};