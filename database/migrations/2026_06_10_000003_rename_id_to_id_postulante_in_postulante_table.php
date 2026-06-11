<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postulacion', function (Blueprint $table) {
            $table->dropForeign(['id_postulante']);
        });

        Schema::table('postulante', function (Blueprint $table) {
            $table->renameColumn('id', 'id_postulante');
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->foreign('id_postulante')
                ->references('id_postulante')
                ->on('postulante');
        });
    }

    public function down(): void
    {
        Schema::table('postulacion', function (Blueprint $table) {
            $table->dropForeign(['id_postulante']);
        });

        Schema::table('postulante', function (Blueprint $table) {
            $table->renameColumn('id_postulante', 'id');
        });

        Schema::table('postulacion', function (Blueprint $table) {
            $table->foreign('id_postulante')
                ->references('id')
                ->on('postulante');
        });
    }
};
