<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulante extends Model
{
    use HasFactory;

    protected $table = 'postulante';
    protected $primaryKey = 'id_postulante';
    protected $guarded = [];
    public $timestamps = false;
}