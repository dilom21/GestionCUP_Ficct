<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsistenciaEstudiante extends Model
{
    protected $table = 'asistencia_estudiante';
    public $timestamps = false;

    protected $fillable = [
        'id_inscripcion_cup',
        'id_asignacion_academica',
        'fecha_clase',
        'hora_registro',
        'token_usado',
        'estado_asistencia',
        'tipo_registro',
        'registrado_por',
    ];

    public function inscripcionCup()
    {
        return $this->belongsTo(InscripcionCup::class, 'id_inscripcion_cup');
    }

    public function asignacionAcademica()
    {
        return $this->belongsTo(AsignacionAcademica::class, 'id_asignacion_academica');
    }

    public function registradoPor()
    {
        return $this->belongsTo(Docente::class, 'registrado_por');
    }
}
