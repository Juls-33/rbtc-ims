<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Drop the old messy table
        Schema::dropIfExists('bill_details');

        Schema::create('bill_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_id')->constrained()->onDelete('cascade');
            $table->integer('month_number'); // 1, 2, 3...
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('facility_fee', 15, 2); // The 10k monthly rate
            $table->decimal('total_amount', 15, 2); // facility_fee + meds
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->string('payment_status')->default('UNPAID'); // UNPAID, PARTIAL, PAID
            $table->date('date_issued');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('bill_details');
    }
};
