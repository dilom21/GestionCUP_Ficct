<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DirectorCarrera extends Model
{
    protected $table = 'director_carrera';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_carrera',
        'fecha_inicio',
        'fecha_fin',
    ];
}