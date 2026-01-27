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
        Schema::create('patients', function (Blueprint $table) {
        $table->id();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('first_name_index')->nullable()->index();
        $table->string('last_name_index')->nullable()->index();
        $table->date('birth_date')->nullable();

        $table->enum('gender', ['Male', 'Female', 'Other']);
        
        $table->string('contact_no')->nullable();
        $table->text('address')->nullable();
        $table->text('civil_status')->nullable();
        
        // Clinical Notes (To be encrypted in the Model)
        $table->text('medical_history')->nullable();
        $table->text('diagnosis_notes')->nullable();
        
        $table->string('emergency_contact_name')->nullable();
        $table->string('emergency_contact_relation')->nullable();
        $table->string('emergency_contact_number')->nullable();
        
        
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
