<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscripcion_cup', function (Blueprint $table) {
            $table->unique('id_postulacion', 'inscripcion_cup_id_postulacion_unique');
        });
    }

    public function down(): void
    {
        Schema::table('inscripcion_cup', function (Blueprint $table) {
            $table->dropUnique('inscripcion_cup_id_postulacion_unique');
        });
    }
};
