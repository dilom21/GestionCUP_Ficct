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
    Schema::create('docente', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_usuario');
        $table->string('ci', 30)->unique();
        $table->string('profesion', 150);
        $table->string('area_profesional', 100);
        $table->string('grado_academico', 100);
        $table->boolean('maestria');
        $table->boolean('diplomado_educacion_superior');
        $table->integer('experiencia_anios');
        $table->integer('maximo_grupos');

        $table->foreign('id_usuario')
            ->references('id')
            ->on('usuario');
    });
}

public function down(): void
{
    Schema::dropIfExists('docente');
}
};
