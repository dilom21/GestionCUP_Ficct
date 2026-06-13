<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdmisionCarrera extends Model
{
    protected $table = 'admision_carrera';
    public $timestamps = false;

    protected $fillable = [
        'id_resultado_cup',
        'id_carrera_asignada',
        'tipo_asignacion',
        'puntaje_orden_merito',
        'estado_admision',
        'fecha_admision',
    ];

    protected function casts(): array
    {
        return [
            'fecha_admision' => 'date',
        ];
    }

    public function resultadoCup()
    {
        return $this->belongsTo(ResultadoCup::class, 'id_resultado_cup');
    }

    public function carreraAsignada()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera_asignada', 'id_carrera');
    }
}