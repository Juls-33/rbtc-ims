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
        Schema::create('room_stays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained();
            // We snapshot the rate here in case the room price changes next year
            $table->decimal('daily_rate', 10, 2); 
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable(); // Null means they are currently in this room
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_stays');
    }
};
