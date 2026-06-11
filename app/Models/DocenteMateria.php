<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocenteMateria extends Model
{
    protected $table = 'docente_materia';
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = [
        'id_materia',
        'id_docente',
        'estado',
    ];

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia', 'id_materia');
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class, 'id_docente');
    }
}
