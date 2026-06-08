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
        // 1. Eliminar FK en tablas dependientes
        Schema::table('director_carrera', function (Blueprint $table) {
            $table->dropForeign(['id_carrera']);
        });

        Schema::table('cupo_carrera', function (Blueprint $table) {
            $table->dropForeign(['id_carrera']);
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->dropForeign(['id_carrera_opcion_1']);
            $table->dropForeign(['id_carrera_opcion_2']);
        });

        // 2. Renombrar columna id → id_carrera en carrera
        Schema::table('carrera', function (Blueprint $table) {
            $table->renameColumn('id', 'id_carrera');
        });

        // 3. Re-crear FK en tablas dependientes
        Schema::table('director_carrera', function (Blueprint $table) {
            $table->foreign('id_carrera')
                ->references('id_carrera')
                ->on('carrera');
        });

        Schema::table('cupo_carrera', function (Blueprint $table) {
            $table->foreign('id_carrera')
                ->references('id_carrera')
                ->on('carrera');
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->foreign('id_carrera_opcion_1')
                ->references('id_carrera')
                ->on('carrera');

            $table->foreign('id_carrera_opcion_2')
                ->references('id_carrera')
                ->on('carrera');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Eliminar FK
        Schema::table('director_carrera', function (Blueprint $table) {
            $table->dropForeign(['id_carrera']);
        });

        Schema::table('cupo_carrera', function (Blueprint $table) {
            $table->dropForeign(['id_carrera']);
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->dropForeign(['id_carrera_opcion_1']);
            $table->dropForeign(['id_carrera_opcion_2']);
        });

        // 2. Renombrar columna id_carrera → id
        Schema::table('carrera', function (Blueprint $table) {
            $table->renameColumn('id_carrera', 'id');
        });

        // 3. Re-crear FK originales
        Schema::table('director_carrera', function (Blueprint $table) {
            $table->foreign('id_carrera')
                ->references('id')
                ->on('carrera');
        });

        Schema::table('cupo_carrera', function (Blueprint $table) {
            $table->foreign('id_carrera')
                ->references('id')
                ->on('carrera');
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->foreign('id_carrera_opcion_1')
                ->references('id')
                ->on('carrera');

            $table->foreign('id_carrera_opcion_2')
                ->references('id')
                ->on('carrera');
        });
    }
};