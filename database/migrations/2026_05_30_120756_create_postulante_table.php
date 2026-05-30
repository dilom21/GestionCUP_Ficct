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
    Schema::create('postulante', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_usuario')->nullable();
        $table->string('ci', 30)->unique();
        $table->date('fecha_nacimiento');
        $table->char('sexo', 1);
        $table->string('direccion', 255)->nullable();
        $table->string('colegio_procedencia', 150)->nullable();
        $table->string('ciudad', 100)->nullable();
        $table->string('estado_postulante', 100)->default('Registrado');

        $table->foreign('id_usuario')
            ->references('id')
            ->on('usuario')
            ->nullOnDelete();
    });
}

public function down(): void
{
    Schema::dropIfExists('postulante');
}
};
