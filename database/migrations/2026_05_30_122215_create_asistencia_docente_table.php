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
    Schema::create('asistencia_docente', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_asignacion_academica');
        $table->date('fecha_clase');
        $table->time('hora_entrada');
        $table->time('hora_salida')->nullable();
        $table->string('estado_asistencia', 50);
        $table->string('tipo_registro', 50)->default('QR');
        $table->string('observacion', 255)->nullable();

        $table->foreign('id_asignacion_academica')
            ->references('id')
            ->on('asignacion_academica')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('asistencia_docente');
}
};
