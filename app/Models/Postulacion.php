<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulacion extends Model
{
    use HasFactory;

    protected $table = 'postulacion';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id_postulante',
        'id_carrera_opcion_1',
        'id_carrera_opcion_2',
        'fecha_postulacion',
        'nro_formulario',
        'observacion_general',
        'fecha_revision',
        'id_usuario_revisor',
        'estado_postulacion',
        'token_pago',
        'turno',
        'id_usuario_creado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_postulacion' => 'datetime',
            'fecha_revision' => 'datetime',
        ];
    }

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante', 'id_postulante');
    }

    public function carrera1()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera_opcion_1', 'id_carrera');
    }

    public function carrera2()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera_opcion_2', 'id_carrera');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'id_usuario_revisor');
    }

    public function requisitos()
    {
        return $this->hasMany(PostulacionRequisito::class, 'id_postulacion');
    }

    public function documentos()
    {
        return $this->hasMany(DocumentoPostulacionPostulante::class, 'id_postulacion');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'id_postulacion', 'id');
    }

    public function inscripcionCup()
    {
        return $this->hasOne(InscripcionCup::class, 'id_postulacion');
    }
}