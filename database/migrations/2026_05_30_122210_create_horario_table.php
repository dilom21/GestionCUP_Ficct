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
    Schema::create('horario', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_asignacion_academica');
        $table->integer('id_aula');
        $table->string('dia_semana', 20);
        $table->time('horario_inicio');
        $table->time('horario_fin');

        $table->foreign('id_asignacion_academica')
            ->references('id')
            ->on('asignacion_academica')
            ->onDelete('cascade');

        $table->foreign('id_aula')
            ->references('id')
            ->on('aula')
            ->onDelete('cascade');

        $table->unique(
            ['id_aula', 'dia_semana', 'horario_inicio', 'horario_fin'],
            'uq_aula_horario'
        );

        $table->unique(
            ['id_asignacion_academica', 'dia_semana', 'horario_inicio', 'horario_fin'],
            'uq_grupo_horario'
        );
    });
}

public function down(): void
{
    Schema::dropIfExists('horario');
}
};
