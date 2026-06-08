<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequisitoDocente extends Model
{
    protected $table = 'requisito_docente';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'obligatorio',
        'estado',
    ];
}