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
    Schema::create('aula', function (Blueprint $table) {
        $table->increments('id');
        $table->string('codigo', 50)->unique();
        $table->string('nombre', 100);
        $table->integer('capacidad_maxima');
        $table->string('ubicacion', 150)->nullable();
        $table->string('estado', 50)->default('Activo');
    });
}

public function down(): void
{
    Schema::dropIfExists('aula');
}
};
