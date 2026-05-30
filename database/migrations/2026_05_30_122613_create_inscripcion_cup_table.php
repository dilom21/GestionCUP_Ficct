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
    Schema::create('inscripcion_cup', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_postulacion');
        $table->integer('id_grupo');
        $table->integer('id_gestion_cup');
        $table->timestamp('fecha_inscripcion')->useCurrent();
        $table->string('estado', 50)->default('Inscrito');

        $table->foreign('id_postulacion')
            ->references('id')
            ->on('postulacion');

        $table->foreign('id_grupo')
            ->references('id')
            ->on('grupo');

        $table->foreign('id_gestion_cup')
            ->references('id')
            ->on('gestion_cup');
    });
}

public function down(): void
{
    Schema::dropIfExists('inscripcion_cup');
}
};
