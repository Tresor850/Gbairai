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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gbairai_id')->constrained('gbairais')->cascadeOnDelete();
            $table->string('device_id_hash', 64)->index();
            $table->string('random_pseudo', 60);
            $table->text('content');
            $table->timestamps();

            // Indexes for retrieval and pseudo lookups
            $table->index(['gbairai_id', 'created_at']);
            $table->index(['gbairai_id', 'device_id_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};

