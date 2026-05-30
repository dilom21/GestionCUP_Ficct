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
    Schema::create('docente_materia', function (Blueprint $table) {
        $table->integer('id_materia');
        $table->integer('id_docente');
        $table->string('estado', 50)->default('Activo');

        $table->primary(['id_materia', 'id_docente']);

        $table->foreign('id_materia')
            ->references('id')
            ->on('materia')
            ->onDelete('cascade');

        $table->foreign('id_docente')
            ->references('id')
            ->on('docente')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('docente_materia');
}
};
