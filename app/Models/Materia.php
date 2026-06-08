<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    protected $table = 'materia';

    protected $primaryKey = 'id_materia';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'estado',
    ];

    /**
     * Relación: Una materia tiene muchas Evaluaciones.
     */
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_materia', 'id_materia');
    }

    /**
     * Relación: Una materia pertenece a muchos Docentes (a través de docente_materia).
     */
    public function docentes()
    {
        return $this->belongsToMany(Docente::class, 'docente_materia', 'id_materia', 'id_docente');
    }
}