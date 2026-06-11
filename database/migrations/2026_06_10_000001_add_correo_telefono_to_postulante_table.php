<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postulante', function (Blueprint $table) {
            $table->string('correo', 255)->nullable()->after('id_usuario');
            $table->string('telefono', 20)->nullable()->after('correo');
        });
    }

    public function down(): void
    {
        Schema::table('postulante', function (Blueprint $table) {
            $table->dropColumn(['correo', 'telefono']);
        });
    }
};
