<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $table = 'horario';
    public $timestamps = false;

    protected $fillable = [
        'id_asignacion_academica',
        'id_aula',
        'dia_semana',
        'horario_inicio',
        'horario_fin',
    ];

    public function asignacionAcademica()
    {
        return $this->belongsTo(AsignacionAcademica::class, 'id_asignacion_academica');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'id_aula');
    }
}
