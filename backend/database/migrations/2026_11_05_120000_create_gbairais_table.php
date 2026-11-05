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
        Schema::create('gbairais', function (Blueprint $table) {
            $table->id();
            $table->string('device_id_hash', 64)->index();
            $table->text('content');
            $table->string('location')->nullable()->index();
            $table->unsignedInteger('likes_count')->default(0)->index();
            $table->unsignedInteger('reports_count')->default(0);
            $table->enum('status', ['active', 'hidden', 'banned'])->default('active')->index();
            $table->timestamps();

            // Composite indexes for fast feed sorting
            $table->index(['status', 'created_at']);
            $table->index(['status', 'likes_count']);
            $table->index(['status', 'location', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gbairais');
    }
};

