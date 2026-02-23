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
        Schema::create('inpatient_bill_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_id')->constrained()->onDelete('cascade');
            $table->string('description'); // e.g., "Paracetamol 500mg" or "X-Ray Fee"
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            // Optional: link to inventory if it's a medicine
            $table->foreignId('medicine_id')->nullable()->constrained('medicine_catalog');
            $table->foreignId('batch_id')->nullable()->constrained('medicine_batches');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inpatient_bill_items');
    }
};
