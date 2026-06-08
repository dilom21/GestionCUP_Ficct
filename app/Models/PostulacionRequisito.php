<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostulacionRequisito extends Model
{
    protected $table = 'postulacion_requisito';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion',
        'id_requisito',
        'estado_requisito',
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
        return $this->belongsTo(Postulacion::class, 'id_postulacion');
    }

    public function requisito()
    {
        return $this->belongsTo(Requisito::class, 'id_requisito');
    }
}
