<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CupoCarrera extends Model
{
    protected $table = 'cupo_carrera';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_gestion_cup',
        'id_carrera',
        'cantidad_cupos',
        'cupos_ocupados',
        'estado',
    ];

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera', 'id_carrera');
    }

    public function gestionCup()
    {
        return $this->belongsTo(GestionCup::class, 'id_gestion_cup');
    }
}