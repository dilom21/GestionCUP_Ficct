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
        return self::expandirPermisosLegacy(
            $this->funciones()->pluck('funcion.permiso')->toArray()
        );
    }

    public static function expandirPermisosLegacy(array $permisos): array
    {
        $equivalencias = [
            'dashboard_lectura' => ['dashboard.leer'],
            'postulantes_lectura_escritura' => [
                'postulaciones_docentes.leer',
                'postulaciones_docentes.escribir',
                'postulaciones_postulantes.leer',
                'postulaciones_postulantes.escribir',
            ],
            'pagos_lectura_escritura' => [
                'pagos_listado.leer',
                'pagos_listado.escribir',
            ],
            'horarios_solo_lectura' => [
                'aulas.leer',
                'grupos.leer',
                'asignacion_academica.leer',
                'horarios.leer',
            ],
            'horarios_lectura_escritura' => [
                'aulas.leer',
                'aulas.escribir',
                'grupos.leer',
                'grupos.escribir',
                'asignacion_academica.leer',
                'asignacion_academica.escribir',
                'horarios.leer',
                'horarios.escribir',
            ],
            'docentes_solo_lectura' => [
                'gestion_docentes.leer',
                'docentes_materias.leer',
            ],
            'docentes_lectura_escritura' => [
                'gestion_docentes.leer',
                'gestion_docentes.escribir',
                'docentes_materias.leer',
                'docentes_materias.escribir',
            ],
            'notas_lectura_escritura' => [
                'materias.leer',
                'materias.escribir',
                'evaluaciones.leer',
                'evaluaciones.escribir',
                'resultados_cup.leer',
                'resultados_cup.escribir',
            ],
            'admision_lectura_escritura' => [
                'cupos_carrera.leer',
                'cupos_carrera.escribir',
                'asignacion_carrera.leer',
                'asignacion_carrera.escribir',
                'resultados_admision.leer',
                'resultados_admision.escribir',
            ],
            'seguridad_lectura_escritura' => [
                'usuarios.leer',
                'usuarios.escribir',
                'roles.leer',
                'roles.escribir',
                'carreras.leer',
                'carreras.escribir',
                'bitacora.leer',
                'bitacora.escribir',
            ],
            'reportes_generacion' => ['reportes.leer'],
        ];

        $expandidos = $permisos;

        foreach ($permisos as $permiso) {
            $expandidos = [
                ...$expandidos,
                ...($equivalencias[$permiso] ?? []),
            ];
        }

        return array_values(array_unique($expandidos));
    }
}
