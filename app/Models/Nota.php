<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Nota extends Model
{
    use HasFactory;

    protected $table = 'nota';
    protected $primaryKey = 'id_nota';
    protected $guarded = [];
    public $timestamps = false;

    protected $fillable = [
        'id_evaluacion',
        'id_inscripcion_cup',
        'nota_obtenida',
    ];

    public function evaluacion()
    {
        return $this->belongsTo(Evaluacion::class, 'id_evaluacion');
    }

    public function inscripcionCup()
    {
        return $this->belongsTo(InscripcionCup::class, 'id_inscripcion_cup');
    }
}