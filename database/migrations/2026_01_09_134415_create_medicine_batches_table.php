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
        Schema::create('medicine_batches', function (Blueprint $table) {
            $table->id(); // batch_id
            $table->foreignId('medicine_id')->constrained('medicine_catalog')->onDelete('cascade');
            $table->string('sku_batch_id')->unique(); // Custom batch identifier
            $table->integer('current_quantity');
            $table->date('expiry_date');
            $table->date('date_received');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_batch');
    }
};
