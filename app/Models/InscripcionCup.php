<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscripcionCup extends Model
{
    protected $table = 'inscripcion_cup';
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion',
        'id_grupo',
        'id_gestion_cup',
        'fecha_inscripcion',
        'estado',
    ];

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_postulacion');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'id_grupo');
    }

    public function gestionCup()
    {
        return $this->belongsTo(GestionCup::class, 'id_gestion_cup');
    }

    public function asignacionesAcademicas()
    {
        return $this->hasMany(AsignacionAcademica::class, 'id_grupo', 'id_grupo');
    }

    public function resultado()
    {
        return $this->hasOne(ResultadoCup::class, 'id_inscripcion_cup');
    }
}
