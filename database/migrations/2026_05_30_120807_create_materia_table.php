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
    Schema::create('materia', function (Blueprint $table) {
        $table->increments('id');
        $table->string('nombre', 150)->unique();
        $table->string('descripcion', 255)->nullable();
        $table->string('estado', 50)->default('Activo');
    });
}

public function down(): void
{
    Schema::dropIfExists('materia');
}
};
