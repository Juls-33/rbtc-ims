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
            Schema::table('patient_visits', function (Blueprint $table) {
            
                $table->string('blood_pressure')->nullable()->after('visit_date');
                $table->string('heart_rate')->nullable()->after('blood_pressure');
                $table->string('temperature')->nullable()->after('heart_rate');
            });
        }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_visits', function (Blueprint $table) {
        $table->dropColumn(['blood_pressure', 'heart_rate', 'temperature']);
        });
    }
};
