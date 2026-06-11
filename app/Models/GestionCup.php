<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GestionCup extends Model
{
    protected $table = 'gestion_cup';
    public $timestamps = false;

    protected $fillable = [
        'nombre_gestion',
        'fecha_inicio_inscripcion',
        'fecha_fin_inscripcion',
        'fecha_inicio_clases',
        'fecha_fin_clases',
    ];

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'id_gestion_cup');
    }

    public function cuposCarrera()
    {
        return $this->hasMany(CupoCarrera::class, 'id_gestion_cup');
    }

    public function asignacionesAcademicas()
    {
        return $this->hasMany(AsignacionAcademica::class, 'id_gestion_cup');
    }
}
