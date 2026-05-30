<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; // Cambia esto para que sirva para el Login
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Usuario extends Authenticatable
{
    use HasFactory;

    // 1. Forzar el nombre de la tabla en singular como tu diseño físico
    protected $table = 'usuario';

    // 2. Definir tu llave primaria personalizada
    protected $primaryKey = 'id_usuario';

    // 3. Permitir inserciones masivas desde seeders o formularios
    protected $guarded = [];

    // 4. Desactivar timestamps si tu tabla no tiene created_at ni updated_at
    public $timestamps = false;
}