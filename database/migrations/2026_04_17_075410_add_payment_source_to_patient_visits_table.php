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
                $table->string('payment_source')->nullable()->after('reason');
            });
        }

        public function down(): void
        {
            Schema::table('patient_visits', function (Blueprint $table) {
                $table->dropColumn('payment_source');
            });
        }
};
