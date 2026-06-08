<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulacion extends Model
{
    use HasFactory;

    protected $table = 'postulacion';
    protected $primaryKey = 'id';
    protected $guarded = [];
    public $timestamps = false;

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante', 'id');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'id_postulacion', 'id');
    }
}