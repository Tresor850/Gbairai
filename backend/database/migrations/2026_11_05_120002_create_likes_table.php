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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gbairai_id')->constrained('gbairais')->cascadeOnDelete();
            $table->string('device_id_hash', 64)->index();
            $table->timestamps();

            // Enforce uniqueness: one like per device per gbairai
            $table->unique(['gbairai_id', 'device_id_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};

