<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrera extends Model
{
    protected $table = 'carrera';
    protected $primaryKey = 'id_carrera';

    public $timestamps = false;

    protected $fillable = [
        'sigla',
        'nombre',
    ];

    /**
     * Relación: Una carrera tiene muchos Directores de Carrera.
     */
    public function directores()
    {
        return $this->hasMany(DirectorCarrera::class, 'id_carrera', 'id_carrera');
    }

    /**
     * Relación: Una carrera tiene muchos Cupos por gestión.
     */
    public function cupos()
    {
        return $this->hasMany(CupoCarrera::class, 'id_carrera', 'id_carrera');
    }
}