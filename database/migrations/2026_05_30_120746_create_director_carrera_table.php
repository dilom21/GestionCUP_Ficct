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
    Schema::create('director_carrera', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_usuario');
        $table->integer('id_carrera');
        $table->date('fecha_inicio');
        $table->date('fecha_fin')->nullable();

        $table->foreign('id_usuario')
            ->references('id')
            ->on('usuario');

        $table->foreign('id_carrera')
            ->references('id')
            ->on('carrera');
    });
}

public function down(): void
{
    Schema::dropIfExists('director_carrera');
}
};
