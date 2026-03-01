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
        // 1. Add the column. We make it nullable so old notes don't break.
        // 2. 'constrained' tells Laravel it links to the 'staff' table.
        // 3. 'after' just places it nicely in your database view.
        $table->foreignId('staff_id')
              ->nullable()
              ->after('patient_id') 
              ->constrained('staff')
              ->onDelete('set null'); 
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_visits', function (Blueprint $table) {
        // Drop the foreign key first, then the column
        $table->dropForeign(['staff_id']);
        $table->dropColumn('staff_id');
    });
    }
};
