<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postulacion', function (Blueprint $table) {
            $table->string('estado_postulacion', 50)->default('Pendiente')->after('nro_formulario');
            $table->string('turno', 20)->nullable()->after('estado_postulacion');
            $table->text('observacion_general')->nullable()->after('turno');
            $table->timestamp('fecha_revision')->nullable()->after('observacion_general');
            $table->unsignedInteger('id_usuario_revisor')->nullable()->after('fecha_revision');
        });
    }

    public function down(): void
    {
        Schema::table('postulacion', function (Blueprint $table) {
            $table->dropColumn([
                'estado_postulacion',
                'turno',
                'observacion_general',
                'fecha_revision',
                'id_usuario_revisor',
            ]);
        });
    }
};
