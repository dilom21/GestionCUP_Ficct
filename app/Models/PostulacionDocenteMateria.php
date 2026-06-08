<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostulacionDocenteMateria extends Model
{
    protected $table = 'postulacion_docente_materia';
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion_docente',
        'id_materia',
    ];

    public function postulacion()
    {
        return $this->belongsTo(PostulacionDocente::class, 'id_postulacion_docente');
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia');
    }
}