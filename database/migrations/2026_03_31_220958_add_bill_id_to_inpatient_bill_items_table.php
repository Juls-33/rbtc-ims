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
        Schema::table('inpatient_bill_items', function (Blueprint $table) {
            $table->foreignId('bill_id')
                ->nullable()
                ->constrained('bill_details')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('inpatient_bill_items', function (Blueprint $table) {
            $table->dropForeign(['bill_id']); // drops FK constraint
            $table->dropColumn('bill_id');    // drops the column
        });
    }
};
