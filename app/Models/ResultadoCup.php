<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResultadoCup extends Model
{
    protected $table = 'resultado_cup';
    public $timestamps = false;

    protected $fillable = [
        'id_inscripcion_cup',
        'promedio_general',
        'estado_resultado',
        'observacion',
    ];

    public function inscripcionCup()
    {
        return $this->belongsTo(InscripcionCup::class, 'id_inscripcion_cup');
    }

    public function admisionCarreras()
    {
        return $this->hasMany(AdmisionCarrera::class, 'id_resultado_cup');
    }
}