<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluacion';
    public $timestamps = false;

    protected $fillable = [
        'id_materia',
        'id_gestion_cup',
        'nombre',
        'porcentaje',
        'puntaje_maximo',
        'fecha_evaluacion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_evaluacion' => 'date',
            'porcentaje' => 'integer',
            'puntaje_maximo' => 'integer',
        ];
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia', 'id_materia');
    }

    public function gestionCup()
    {
        return $this->belongsTo(GestionCup::class, 'id_gestion_cup');
    }
}