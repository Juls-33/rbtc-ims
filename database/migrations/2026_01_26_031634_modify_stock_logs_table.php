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
    Schema::table('stock_logs', function (Blueprint $table) {
        // 1. Make batch_id nullable for catalog-level logs
        $table->foreignId('batch_id')->nullable()->change();
        
        // 2. Add medicine_id to ensure logs persist if a batch is deleted
        // and to track catalog-wide changes
        $table->foreignId('medicine_id')->after('id')->nullable()
              ->constrained('medicine_catalog')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('stock_logs', function (Blueprint $table) {
        $table->dropForeign(['medicine_id']);
        $table->dropColumn('medicine_id');
        $table->foreignId('batch_id')->nullable(false)->change();
    });
}
};
