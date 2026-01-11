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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id(); // room_id from your diagram
            $table->string('room_location', 100);
            $table->decimal('room_rate', 10, 2);
            
            // Using string for ENUM flexibility as per your diagram
            $table->string('status'); 
            
            $table->timestamps(); // Handles date_created and date_updated
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
