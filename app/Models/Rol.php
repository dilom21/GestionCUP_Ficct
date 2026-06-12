<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'rol';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'id_rol', 'id');
    }

    /**
     * Relación muchos a muchos con funciones (permisos) a través de rol_funcion.
     */
    public function funciones()
    {
        return $this->belongsToMany(Funcion::class, 'rol_funcion', 'id_rol', 'id_funcion')
            ->withPivot('descripcion');
    }

    /**
     * Obtiene los módulos con sus funciones asociadas a este rol.
     */
    public function modulosConPermisos()
    {
        return Modulo::with(['funciones' => function ($query) {
            $query->whereHas('roles', function ($q) {
                $q->where('rol.id', $this->id);
            });
        }])->get();
    }

    /**
     * Verifica si el rol tiene un permiso específico.
     */
    public function tienePermiso(string $permiso): bool
    {
        return $this->funciones()
            ->where('funcion.permiso', $permiso)
            ->exists();
    }

    /**
     * Obtiene todos los permisos del rol como array de strings.
     */
    public function getPermisosArray(): array
    {
        return $this->funciones()->pluck('funcion.permiso')->toArray();
    }
}