<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_visits', function (Blueprint $blueprint) {
            $blueprint->id();
            // Link to the patients table
            $blueprint->foreignId('patient_id')
                      ->constrained('patients')
                      ->onDelete('cascade');
            
            // Clinical Data from Modal
            $blueprint->date('visit_date');
            $blueprint->string('weight')->nullable(); // String to allow '65kg' or encrypted values
            $blueprint->text('reason'); // Text for longer clinical notes
            
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_visits');
    }
};