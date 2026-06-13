<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consulta_voz', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->text('consulta_texto');
            $table->string('tipo_reporte', 50)->nullable();
            $table->jsonb('parametros')->nullable();
            $table->text('resultado_resumen')->nullable();
            $table->jsonb('resultado_datos')->nullable();
            $table->string('ip', 45)->nullable();
            $table->boolean('procesado')->default(true);
            $table->timestamps();

            $table->foreign('id_usuario')->references('id')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consulta_voz');
    }
};
