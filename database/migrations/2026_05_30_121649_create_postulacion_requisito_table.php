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
    Schema::create('postulacion_requisito', function (Blueprint $table) {
        $table->integer('id_postulacion');
        $table->integer('id_requisito');
        $table->string('estado_requisito', 50)->default('Pendiente');
        $table->string('observacion', 255)->nullable();
        $table->timestamp('fecha_revision')->nullable();

        $table->primary(['id_postulacion', 'id_requisito']);

        $table->foreign('id_postulacion')
            ->references('id')
            ->on('postulacion')
            ->onDelete('cascade');

        $table->foreign('id_requisito')
            ->references('id')
            ->on('requisitos');
    });
}

public function down(): void
{
    Schema::dropIfExists('postulacion_requisito');
}
};
