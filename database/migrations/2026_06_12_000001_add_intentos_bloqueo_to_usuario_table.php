<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->integer('intentos_fallidos')->default(0)->after('telefono');
            $table->timestamp('bloqueado_hasta')->nullable()->after('intentos_fallidos');
        });
    }

    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn(['intentos_fallidos', 'bloqueado_hasta']);
        });
    }
};
