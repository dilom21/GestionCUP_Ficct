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
    Schema::create('evaluacion', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_materia');
        $table->integer('id_gestion_cup');
        $table->string('nombre', 150);
        $table->decimal('porcentaje', 5, 2);
        $table->integer('puntaje_maximo');
        $table->date('fecha_evaluacion')->nullable();

        $table->foreign('id_materia')
            ->references('id')
            ->on('materia');

        $table->foreign('id_gestion_cup')
            ->references('id')
            ->on('gestion_cup');
    });
}

public function down(): void
{
    Schema::dropIfExists('evaluacion');
}
};
