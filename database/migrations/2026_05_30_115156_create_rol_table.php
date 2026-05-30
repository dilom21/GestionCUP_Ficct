<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('rol', function (Blueprint $table) {
        // En lugar de $table->id(); pon esto:
        $table->id('id_rol'); 
        
        $table->string('nombre');
        // $table->timestamps(); // (Mantenlo o bórralo según tu diseño)
    });
}

public function down(): void
{
    Schema::dropIfExists('rol');
}
};
