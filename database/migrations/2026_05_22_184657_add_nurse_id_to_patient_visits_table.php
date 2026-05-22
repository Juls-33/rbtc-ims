<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('patient_visits', function (Blueprint $table) {
            $table->unsignedBigInteger('nurse_id')->nullable()->after('staff_id');
            $table->foreign('nurse_id')->references('id')->on('staff')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('patient_visits', function (Blueprint $table) {
            $table->dropForeign(['nurse_id']);
            $table->dropColumn('nurse_id');
        });
    }
};
