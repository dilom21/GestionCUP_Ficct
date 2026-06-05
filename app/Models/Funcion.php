<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Funcion extends Model
{
    protected $table = 'funcion';
    
    // Eliminamos protected $primaryKey porque Laravel ya asume que es 'id'
    
    // Lo pongo en false porque en tu migración no agregaste $table->timestamps()
    public $timestamps = false; 

    protected $fillable = [
        'nombre',
        'descripcion',
        'permiso',
        'id_modulo'
    ];
}