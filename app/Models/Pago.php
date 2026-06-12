<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id_postulacion',
        'monto',
        'fecha_pago',
        'referencia',
        'estado_pago',
        'cod_transaccion',
    ];

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_postulacion', 'id');
    }
}