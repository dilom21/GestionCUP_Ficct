<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asistencia_estudiante', function (Blueprint $table) {
            $table->string('tipo_registro', 20)->default('QR')->after('token_usado');
            $table->integer('registrado_por')->nullable()->after('tipo_registro');
            $table->string('token_usado', 64)->nullable()->change();

            $table->foreign('registrado_por')
                ->references('id')
                ->on('docente')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('asistencia_estudiante', function (Blueprint $table) {
            $table->dropForeign(['registrado_por']);
            $table->dropColumn('tipo_registro');
            $table->dropColumn('registrado_por');
            $table->string('token_usado', 64)->nullable(false)->change();
        });
    }
};
