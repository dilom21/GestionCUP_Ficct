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
    Schema::create('asignacion_academica', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_materia');
        $table->integer('id_grupo');
        $table->integer('id_docente');
        $table->integer('id_gestion_cup');
        $table->integer('carga_horaria');
        $table->string('estado', 50)->default('Activo');

        $table->foreign('id_materia')
            ->references('id')
            ->on('materia');

        $table->foreign('id_grupo')
            ->references('id')
            ->on('grupo');

        $table->foreign('id_docente')
            ->references('id')
            ->on('docente');

        $table->foreign('id_gestion_cup')
            ->references('id')
            ->on('gestion_cup');
    });
}

public function down(): void
{
    Schema::dropIfExists('asignacion_academica');
}
};
