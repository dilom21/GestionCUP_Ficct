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
    Schema::create('usuario', function (Blueprint $table) {
        $table->increments('id');
        $table->string('correo', 255)->unique();
        $table->string('password', 255);
        $table->string('estado', 50)->default('Activo');
        $table->string('nombre', 100);
        $table->string('apellidos', 150);
        $table->string('telefono', 20)->nullable();

        $table->integer('id_rol');

        $table->foreign('id_rol')
            ->references('id')
            ->on('rol');
    });
}

public function down(): void
{
    Schema::dropIfExists('usuario');
}
};
