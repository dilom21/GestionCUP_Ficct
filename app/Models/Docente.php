<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    protected $table = 'docente';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'ci',
        'profesion',
        'area_profesional',
        'grado_academico',
        'maestria',
        'diplomado_educacion_superior',
        'experiencia_anios',
        'maximo_grupos',
        'id_postulacion_docente',
    ];

    protected function casts(): array
    {
        return [
            'maestria' => 'boolean',
            'diplomado_educacion_superior' => 'boolean',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}