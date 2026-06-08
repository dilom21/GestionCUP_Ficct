<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentoPostulacionDocente extends Model
{
    protected $table = 'documento_postulacion_docente';
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion_docente',
        'tipo_documento',
        'nombre_archivo',
        'ruta_archivo',
        'mime_type',
        'tamanio',
        'fecha_subida',
    ];

    protected function casts(): array
    {
        return [
            'fecha_subida' => 'datetime',
        ];
    }

    public function postulacion()
    {
        return $this->belongsTo(PostulacionDocente::class, 'id_postulacion_docente');
    }
}