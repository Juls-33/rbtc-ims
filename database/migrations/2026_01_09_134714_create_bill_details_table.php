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
        Schema::create('bill_details', function (Blueprint $table) {
            $table->id(); // billing_id
            $table->foreignId('admission_id')->constrained('admissions')->onDelete('cascade');
            $table->decimal('facility_fee', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_status', ['PAID', 'UNPAID'])->default('UNPAID');
            $table->dateTime('date_issued');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_details');
    }
};
