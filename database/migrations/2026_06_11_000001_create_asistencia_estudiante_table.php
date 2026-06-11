<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencia_estudiante', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_inscripcion_cup');
            $table->integer('id_asignacion_academica');
            $table->date('fecha_clase');
            $table->time('hora_registro');
            $table->string('token_usado', 64);
            $table->string('estado_asistencia', 50)->default('Presente');

            $table->foreign('id_inscripcion_cup')
                ->references('id')
                ->on('inscripcion_cup');

            $table->foreign('id_asignacion_academica')
                ->references('id')
                ->on('asignacion_academica')
                ->onDelete('cascade');

            $table->index('token_usado');
            $table->unique(['id_inscripcion_cup', 'id_asignacion_academica', 'fecha_clase'], 'uq_asistencia_estudiante_clase');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencia_estudiante');
    }
};
