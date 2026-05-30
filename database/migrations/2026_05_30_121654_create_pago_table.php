<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('pago', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('id_postulacion');
        $table->decimal('monto', 10, 2);
        $table->timestamp('fecha_pago')->useCurrent();
        $table->string('referencia', 100)->nullable();
        $table->string('estado_pago', 50)->default('Pendiente');
        $table->string('cod_transaccion', 150)->unique();

        $table->foreign('id_postulacion')
            ->references('id')
            ->on('postulacion');
    });
}

public function down(): void
{
    Schema::dropIfExists('pago');
}
};
