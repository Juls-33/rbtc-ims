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
        Schema::create('medicine_catalog', function (Blueprint $table) {
            $table->id(); // medicine_id
            $table->string('sku_id')->unique();
            $table->string('generic_name');
            $table->string('brand_name')->nullable();
            $table->string('category'); // e.g., Antibiotic, Painkiller
            $table->string('dosage'); // e.g., Tablet, Syrup
            $table->integer('reorder_point')->default(10); // For low stock alerts
            $table->decimal('price_per_unit', 10, 2); //
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_catalog');
    }
};
