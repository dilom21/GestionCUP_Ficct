<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funcion', function (Blueprint $table) {
            $table->id(); // Crea la llave primaria estándar llamada 'id'
            $table->string('nombre', 100);
            $table->string('descripcion', 255)->nullable();
            $table->string('permiso', 100)->unique();
            
            // Llave foránea hacia modulo (asegúrate de que tabla modulo también use $table->id())
            $table->foreignId('id_modulo')->constrained('modulo')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funcion');
    }
};