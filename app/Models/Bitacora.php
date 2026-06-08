<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bitacora extends Model
{
    protected $table = 'bitacora';
    protected $primaryKey = 'id_bitacora';

    public $timestamps = false;

    protected $fillable = [
        'accion',
        'fecha_hora',
        'ip',
        'id_usuario',
        'tabla_afectada',
    ];
}