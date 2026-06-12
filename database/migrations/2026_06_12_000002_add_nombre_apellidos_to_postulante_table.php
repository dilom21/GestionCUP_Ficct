<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postulante', function (Blueprint $table) {
            $table->string('nombre', 100)->nullable()->after('id_usuario');
            $table->string('apellidos', 150)->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('postulante', function (Blueprint $table) {
            $table->dropColumn(['nombre', 'apellidos']);
        });
    }
};
