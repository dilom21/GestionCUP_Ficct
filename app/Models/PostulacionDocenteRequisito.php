<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostulacionDocenteRequisito extends Model
{
    protected $table = 'postulacion_docente_requisito';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion_docente',
        'id_requisito',
        'estado',
        'observacion',
        'fecha_revision',
    ];

    protected function casts(): array
    {
        return [
            'fecha_revision' => 'datetime',
        ];
    }

    public function postulacion()
    {
        return $this->belongsTo(PostulacionDocente::class, 'id_postulacion_docente');
    }

    public function requisito()
    {
        return $this->belongsTo(RequisitoDocente::class, 'id_requisito');
    }
}