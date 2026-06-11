<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsistenciaDocente extends Model
{
    protected $table = 'asistencia_docente';
    public $timestamps = false;

    protected $fillable = [
        'id_asignacion_academica',
        'fecha_clase',
        'hora_entrada',
        'hora_salida',
        'estado_asistencia',
        'tipo_registro',
        'observacion',
    ];

    public function asignacionAcademica()
    {
        return $this->belongsTo(AsignacionAcademica::class, 'id_asignacion_academica');
    }
}
