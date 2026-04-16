<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bill_details', function (Blueprint $table) {
            // Adds the column right after payment_status
            $table->string('payment_source')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('bill_details', function (Blueprint $table) {
            $table->dropColumn('payment_source');
        });
    }
};