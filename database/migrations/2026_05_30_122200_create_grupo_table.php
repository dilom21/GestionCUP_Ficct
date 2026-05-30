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
    Schema::create('grupo', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_gestion_cup');
        $table->string('sigla', 50);
        $table->integer('cupo_maximo');
        $table->string('turno', 50);
        $table->string('modalidad', 100)->default('Presencial');
        $table->string('estado', 50)->default('Activo');

        $table->foreign('id_gestion_cup')
            ->references('id')
            ->on('gestion_cup');
    });
}

public function down(): void
{
    Schema::dropIfExists('grupo');
}
};
