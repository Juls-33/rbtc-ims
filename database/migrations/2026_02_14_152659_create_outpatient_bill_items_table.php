<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outpatient_bill_items', function (Blueprint $table) {
            $table->id();
            
            // Links to the specific visit
            $table->foreignId('visit_id')
                ->constrained('patient_visits')
                ->onDelete('cascade');

            // Links to the medicine in the catalog
            $table->foreignId('medicine_id')
                ->constrained('medicine_catalog');

            // Links to the specific batch used (Critical for inventory tracking)
            $table->foreignId('batch_id')
                ->constrained('medicine_batches');

            $table->integer('quantity');
            
            // We store the price at the time of sale in case catalog prices change later
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outpatient_bill_items');
    }
};
