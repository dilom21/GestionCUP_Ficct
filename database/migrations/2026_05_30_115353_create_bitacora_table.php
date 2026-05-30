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
    Schema::create('bitacora', function (Blueprint $table) {
        $table->bigIncrements('id');
        $table->string('accion', 100);
        $table->timestamp('fecha_hora')->useCurrent();
        $table->string('ip', 45);
        $table->integer('id_usuario');
        $table->string('tabla_afectada', 100);

        $table->foreign('id_usuario')
            ->references('id')
            ->on('usuario')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('bitacora');
}
};
