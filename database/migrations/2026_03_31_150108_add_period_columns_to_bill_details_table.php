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
        Schema::table('bill_details', function (Blueprint $table) {
            $table->integer('month_number')->after('admission_id')->nullable();
            $table->datetime('period_start')->after('month_number')->nullable();
            $table->datetime('period_end')->after('period_start')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bill_details', function (Blueprint $table) {
            $table->dropColumn(['month_number', 'period_start', 'period_end']);
        });
    }
};
