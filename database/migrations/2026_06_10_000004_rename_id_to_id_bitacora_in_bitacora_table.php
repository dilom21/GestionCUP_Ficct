<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->renameColumn('id', 'id_bitacora');
        });
    }

    public function down(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->renameColumn('id_bitacora', 'id');
        });
    }
};
