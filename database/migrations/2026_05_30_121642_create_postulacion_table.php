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
    Schema::create('postulacion', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_postulante');
        $table->integer('id_carrera_opcion_1');
        $table->integer('id_carrera_opcion_2')->nullable();
        $table->timestamp('fecha_postulacion')->useCurrent();
        $table->string('nro_formulario', 50)->unique();

        $table->foreign('id_postulante')
            ->references('id')
            ->on('postulante');

        $table->foreign('id_carrera_opcion_1')
            ->references('id')
            ->on('carrera');

        $table->foreign('id_carrera_opcion_2')
            ->references('id')
            ->on('carrera');
    });
}

public function down(): void
{
    Schema::dropIfExists('postulacion');
}
};
