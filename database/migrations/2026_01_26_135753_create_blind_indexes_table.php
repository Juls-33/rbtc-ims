<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blind_indexes', function (Blueprint $table) {
            $table->id();
            $table->string('indexable_type');
            $table->unsignedBigInteger('indexable_id');
            $table->string('name');
            $table->string('value');
            $table->timestamps();

            $table->index(['indexable_type', 'indexable_id']);
            $table->unique(['indexable_type', 'indexable_id', 'name']);
        });
    }
};
