<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    protected $table = 'aula';
    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'capacidad_maxima',
        'ubicacion',
        'estado',
    ];

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'id_aula');
    }
}
