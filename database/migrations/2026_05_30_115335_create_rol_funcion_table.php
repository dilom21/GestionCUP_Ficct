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
    Schema::create('rol_funcion', function (Blueprint $table) {
        $table->integer('id_rol');
        $table->integer('id_funcion');
        $table->string('descripcion', 255)->nullable();

        $table->primary(['id_rol', 'id_funcion']);

        $table->foreign('id_rol')
            ->references('id')
            ->on('rol')
            ->onDelete('cascade');

        $table->foreign('id_funcion')
            ->references('id')
            ->on('funcion')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('rol_funcion');
}
};
