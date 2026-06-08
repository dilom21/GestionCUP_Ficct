<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostulacionDocente extends Model
{
    protected $table = 'postulacion_docente';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellido',
        'correo',
        'telefono',
        'ci',
        'profesion',
        'experiencia_anios',
        'disponibilidad_horaria',
        'estado_postulacion',
        'observacion_general',
        'grado_academico',
        'fecha_postulacion',
        'fecha_revision',
        'id_usuario_revisor',
        // 'id_usuario_creado', // Comentado: se usará cuando se implemente creación de usuarios
    ];

    protected function casts(): array
    {
        return [
            'fecha_postulacion' => 'datetime',
            'fecha_revision' => 'datetime',
        ];
    }

    public function documentos()
    {
        return $this->hasMany(DocumentoPostulacionDocente::class, 'id_postulacion_docente');
    }

    public function requisitos()
    {
        return $this->hasMany(PostulacionDocenteRequisito::class, 'id_postulacion_docente');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'id_usuario_revisor');
    }

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'postulacion_docente_materia', 'id_postulacion_docente', 'id_materia');
    }
}