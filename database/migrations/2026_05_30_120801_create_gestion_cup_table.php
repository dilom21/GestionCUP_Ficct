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
    Schema::create('gestion_cup', function (Blueprint $table) {
        $table->increments('id');
        $table->string('nombre_gestion', 50)->unique();
        $table->date('fecha_inicio_inscripcion');
        $table->date('fecha_fin_inscripcion');
        $table->date('fecha_inicio_clases');
        $table->date('fecha_fin_clases');
    });
}

public function down(): void
{
    Schema::dropIfExists('gestion_cup');
}
};
