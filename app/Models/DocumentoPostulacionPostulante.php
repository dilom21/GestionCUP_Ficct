<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentoPostulacionPostulante extends Model
{
    protected $table = 'documento_postulacion_postulante';
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion',
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
        return $this->belongsTo(Postulacion::class, 'id_postulacion');
    }
}