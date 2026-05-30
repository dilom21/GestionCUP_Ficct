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
    Schema::create('cupo_carrera', function (Blueprint $table) {
        $table->integer('id_gestion_cup');
        $table->integer('id_carrera');
        $table->integer('cantidad_cupos');
        $table->integer('cupos_ocupados')->default(0);

        $table->primary(['id_gestion_cup', 'id_carrera']);

        $table->foreign('id_gestion_cup')
            ->references('id')
            ->on('gestion_cup');

        $table->foreign('id_carrera')
            ->references('id')
            ->on('carrera');
    });
}

public function down(): void
{
    Schema::dropIfExists('cupo_carrera');
}
};
