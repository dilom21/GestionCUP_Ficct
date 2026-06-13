<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificacion', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 200);
            $table->text('mensaje')->nullable();
            $table->string('tipo', 50)->default('info');
            $table->string('icono', 10)->default('🔔');
            $table->string('link', 500)->nullable();
            $table->unsignedInteger('id_usuario')->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificacion');
    }
};
