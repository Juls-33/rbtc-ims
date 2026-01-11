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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id(); // prescription_id
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->foreignId('medicine_id')->constrained('medicine_catalog')->onDelete('cascade');
            $table->string('dosage');
            $table->string('frequency');
            $table->string('schedule_time');
            $table->date('date_prescribed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
