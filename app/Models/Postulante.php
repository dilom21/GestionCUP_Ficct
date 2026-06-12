<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulante extends Model
{
    use HasFactory;

    protected $table = 'postulante';
    protected $primaryKey = 'id_postulante';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'nombre',
        'apellidos',
        'correo',
        'telefono',
        'ci',
        'fecha_nacimiento',
        'sexo',
        'direccion',
        'colegio_procedencia',
        'ciudad',
        'estado_postulante',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    public function postulaciones()
    {
        return $this->hasMany(Postulacion::class, 'id_postulante');
    }
}