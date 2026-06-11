<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionAcademica extends Model
{
    protected $table = 'asignacion_academica';
    public $timestamps = false;

    protected $fillable = [
        'id_materia',
        'id_grupo',
        'id_docente',
        'id_gestion_cup',
        'carga_horaria',
        'estado',
    ];

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia', 'id_materia');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'id_grupo');
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class, 'id_docente');
    }

    public function gestionCup()
    {
        return $this->belongsTo(GestionCup::class, 'id_gestion_cup');
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'id_asignacion_academica');
    }
}
