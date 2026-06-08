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
        'descripcion',
        'estado',
    ];

    public function postulaciones()
    {
        return $this->belongsToMany(PostulacionDocente::class, 'postulacion_docente_materia', 'id_materia', 'id_postulacion_docente');
    }
}