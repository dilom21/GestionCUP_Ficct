<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';
    public $timestamps = false;

    protected $fillable = [
        'correo',
        'password',
        'estado',
        'nombre',
        'apellidos',
        'telefono',
        'id_rol',
        'intentos_fallidos',
        'bloqueado_hasta',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function docente()
    {
        return $this->hasOne(Docente::class, 'id_usuario');
    }
}
