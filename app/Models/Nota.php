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
}