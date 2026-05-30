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
    Schema::create('funcion', function (Blueprint $table) {
        $table->increments('id');
        $table->string('nombre', 100);
        $table->string('descripcion', 255)->nullable();
        $table->string('permiso', 100)->unique();

        $table->integer('id_modulo');

        $table->foreign('id_modulo')
            ->references('id')
            ->on('modulo')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('funcion');
}
};
