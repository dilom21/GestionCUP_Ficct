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
    Schema::create('admision_carrera', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_resultado_cup');
        $table->integer('id_carrera_asignada');
        $table->string('tipo_asignacion', 100);
        $table->integer('puntaje_orden_merito')->nullable();
        $table->string('estado_admision', 100)->default('Pendiente');
        $table->date('fecha_admision');

        $table->foreign('id_resultado_cup')
            ->references('id')
            ->on('resultado_cup')
            ->onDelete('cascade');

        $table->foreign('id_carrera_asignada')
            ->references('id')
            ->on('carrera');
    });
}

public function down(): void
{
    Schema::dropIfExists('admision_carrera');
}
};
