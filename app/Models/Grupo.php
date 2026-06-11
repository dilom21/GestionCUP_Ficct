<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $table = 'grupo';
    public $timestamps = false;

    protected $fillable = [
        'id_gestion_cup',
        'sigla',
        'cupo_maximo',
        'turno',
        'modalidad',
        'estado',
    ];

    public function gestionCup()
    {
        return $this->belongsTo(GestionCup::class, 'id_gestion_cup');
    }

    public function asignacionesAcademicas()
    {
        return $this->hasMany(AsignacionAcademica::class, 'id_grupo');
    }

    public function inscripciones()
    {
        return $this->hasMany(InscripcionCup::class, 'id_grupo');
    }
}
