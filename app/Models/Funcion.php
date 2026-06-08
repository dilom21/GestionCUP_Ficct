<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Funcion extends Model
{
    protected $table = 'funcion';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'permiso',
        'id_modulo',
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'id_modulo', 'id');
    }

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_funcion', 'id_funcion', 'id_rol')
            ->withPivot('descripcion');
    }
}