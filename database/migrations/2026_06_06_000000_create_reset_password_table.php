<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reset_password', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_usuario');
            $table->string('token', 64)->unique();
            $table->timestamp('created_at');
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);

            $table->foreign('id_usuario')
                ->references('id')
                ->on('usuario')
                ->cascadeOnDelete();

            $table->index(['id_usuario', 'used']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reset_password');
    }
};
