<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';
    protected $primaryKey = 'id';
    protected $guarded = [];
    public $timestamps = false;

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_postulacion', 'id');
    }
}