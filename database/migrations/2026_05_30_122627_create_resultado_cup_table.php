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
    Schema::create('resultado_cup', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_inscripcion_cup');
        $table->decimal('promedio_general', 5, 2);
        $table->string('estado_resultado', 100);
        $table->string('observacion', 255)->nullable();

        $table->foreign('id_inscripcion_cup')
            ->references('id')
            ->on('inscripcion_cup')
            ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::dropIfExists('resultado_cup');
}
};
