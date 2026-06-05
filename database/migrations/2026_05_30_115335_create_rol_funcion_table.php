<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rol_funcion', function (Blueprint $table) {
            // Laravel buscará automáticamente la columna 'id' en las tablas 'rol' y 'funcion'
            $table->foreignId('id_rol')->constrained('rol')->onDelete('cascade');
            $table->foreignId('id_funcion')->constrained('funcion')->onDelete('cascade');
            
            $table->string('descripcion', 255)->nullable();
            
            // Llave primaria compuesta
            $table->primary(['id_rol', 'id_funcion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rol_funcion');
    }
};