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
    Schema::create('nota', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_evaluacion');
        $table->integer('id_inscripcion_cup');
        $table->decimal('nota_obtenida', 5, 2);
        $table->timestamp('fecha_registro')->useCurrent();

        $table->foreign('id_evaluacion')
            ->references('id')
            ->on('evaluacion');

        $table->foreign('id_inscripcion_cup')
            ->references('id')
            ->on('inscripcion_cup')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('nota');
}
};
