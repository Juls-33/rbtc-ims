<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            
            $table->string('archivable_type'); 
            $table->unsignedBigInteger('archivable_id');
            
            $table->json('data'); 
            
            $table->string('reason')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('staff');
            
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('scheduled_deletion_at')->nullable(); // Set to +5 years from archived_at
            
            $table->timestamps();

            $table->index(['archivable_type', 'archivable_id']);
            $table->index('scheduled_deletion_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};