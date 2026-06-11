<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolFuncionSeeder extends Seeder
{
    public function run(): void
    {
        // ──────────────────────────────────────────────
        // MÓDULOS DEL SISTEMA (sidebar)
        // ──────────────────────────────────────────────
        $modulos = [
            ['nombre' => 'Dashboard',              'descripcion' => 'Panel principal de administración'],
            ['nombre' => 'Postulaciones y Requisitos','descripcion' => 'Gestión de postulaciones y sus requisitos'],
            ['nombre' => 'Pagos y Habilitación',    'descripcion' => 'Gestión de pagos y habilitación de postulantes'],
            ['nombre' => 'Grupos Horarios y Aulas', 'descripcion' => 'Gestión de grupos, horarios y aulas'],
            ['nombre' => 'Docentes y Carga Horaria','descripcion' => 'Gestión de docentes y su carga horaria'],
            ['nombre' => 'Materias y Notas',        'descripcion' => 'Gestión de materias y notas'],
            ['nombre' => 'Cupos y Admisión',        'descripcion' => 'Gestión de cupos y admisión'],
            ['nombre' => 'Usuarios y Seguridad',    'descripcion' => 'Gestión de usuarios, roles y permisos'],
            ['nombre' => 'Asistencia y Control',    'descripcion' => 'Gestión de asistencia de docentes y estudiantes'],
            ['nombre' => 'Reportes',               'descripcion' => 'Reportes del sistema'],
        ];

        $moduloIds = [];
        foreach ($modulos as $mod) {
            $existing = DB::table('modulo')->where('nombre', $mod['nombre'])->first();
            if (!$existing) {
                $moduloIds[$mod['nombre']] = DB::table('modulo')->insertGetId($mod);
            } else {
                $moduloIds[$mod['nombre']] = $existing->id;
            }
        }

        // ──────────────────────────────────────────────
        // FUNCIONES (permisos) por módulo
        //
        // IMPORTANTE: Las funciones aquí definidas corresponden ÚNICAMENTE
        // a los botones/items definidos en resources/js/Data/sidebarConfig.js.
        //
        // Cada función sigue el patrón: {entidad}.{accion}
        //   - entidad: identificador del botón (ej: 'usuarios', 'roles')
        //   - accion: 'leer' o 'escribir'
        //
        // Para agregar un nuevo permiso para un botón del sidebar:
        // 1. Agrega el botón en sidebarConfig.js (dentro de children del módulo)
        // 2. Agrega aquí las funciones correspondientes con el mismo nombre de entidad
        // 3. Asigna las funciones al rol Administrador
        //
        // Mientras un módulo no tenga botones hijos en sidebarConfig, NO debe tener
        // funciones aquí, para que en "Permisos por Módulo" aparezca vacío.
        // ──────────────────────────────────────────────
        $funcionesData = [
            // Módulo: Dashboard
            ['nombre' => 'Ver Dashboard',            'permiso' => 'dashboard.leer',              'modulo' => 'Dashboard'],
            // Módulo: Postulaciones y Requisitos
            ['nombre' => 'Ver Postulantes',                'permiso' => 'postulantes.leer',                  'modulo' => 'Postulaciones y Requisitos'],
            ['nombre' => 'Ver Postulaciones Docentes',     'permiso' => 'postulaciones_docentes.leer',       'modulo' => 'Postulaciones y Requisitos'],
            ['nombre' => 'Gestionar Postulaciones Docentes','permiso' => 'postulaciones_docentes.escribir',   'modulo' => 'Postulaciones y Requisitos'],
            ['nombre' => 'Ver Postulaciones Postulantes',  'permiso' => 'postulaciones_postulantes.leer',    'modulo' => 'Postulaciones y Requisitos'],
            ['nombre' => 'Gestionar Postulaciones Postul.','permiso' => 'postulaciones_postulantes.escribir', 'modulo' => 'Postulaciones y Requisitos'],
            // Módulo: Pagos y Habilitación
            ['nombre' => 'Ver Pagos',                'permiso' => 'pagos.leer',                  'modulo' => 'Pagos y Habilitación'],
            ['nombre' => 'Ver Listado de Pagos',     'permiso' => 'pagos_listado.leer',          'modulo' => 'Pagos y Habilitación'],
            ['nombre' => 'Gestionar Pagos',          'permiso' => 'pagos_listado.escribir',      'modulo' => 'Pagos y Habilitación'],
            // Módulo: Grupos Horarios y Aulas
            ['nombre' => 'Ver Grupos y Horarios',    'permiso' => 'grupos_horarios.leer',        'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Ver Aulas',                'permiso' => 'aulas.leer',                  'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Gestionar Aulas',          'permiso' => 'aulas.escribir',              'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Ver Grupos',               'permiso' => 'grupos.leer',                 'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Gestionar Grupos',         'permiso' => 'grupos.escribir',             'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Ver Asignación Académica',  'permiso' => 'asignacion_academica.leer',   'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Gestionar Asignación Académica', 'permiso' => 'asignacion_academica.escribir', 'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Ver Horarios',              'permiso' => 'horarios.leer',               'modulo' => 'Grupos Horarios y Aulas'],
            ['nombre' => 'Gestionar Horarios',        'permiso' => 'horarios.escribir',           'modulo' => 'Grupos Horarios y Aulas'],
            // Módulo: Docentes y Carga Horaria
            ['nombre' => 'Ver Docentes',             'permiso' => 'docentes.leer',               'modulo' => 'Docentes y Carga Horaria'],
            ['nombre' => 'Ver Gestión de Docentes',  'permiso' => 'gestion_docentes.leer',       'modulo' => 'Docentes y Carga Horaria'],
            ['nombre' => 'Gestionar Docentes',       'permiso' => 'gestion_docentes.escribir',   'modulo' => 'Docentes y Carga Horaria'],
            ['nombre' => 'Ver Materias por Docente', 'permiso' => 'docentes_materias.leer',       'modulo' => 'Docentes y Carga Horaria'],
            ['nombre' => 'Gestionar Materias por Docente', 'permiso' => 'docentes_materias.escribir', 'modulo' => 'Docentes y Carga Horaria'],
            // Módulo: Materias y Notas
            ['nombre' => 'Ver Materias y Notas',     'permiso' => 'materias_notas.leer',         'modulo' => 'Materias y Notas'],
            ['nombre' => 'Ver Materias',             'permiso' => 'materias.leer',               'modulo' => 'Materias y Notas'],
            ['nombre' => 'Gestionar Materias',       'permiso' => 'materias.escribir',           'modulo' => 'Materias y Notas'],
            // Módulo: Cupos y Admisión
            ['nombre' => 'Ver Cupos y Admisión',     'permiso' => 'cupos_admision.leer',         'modulo' => 'Cupos y Admisión'],
            // Módulo: Asistencia y Control
            ['nombre' => 'Ver Asistencia Docente',   'permiso' => 'asistencia_docente.leer',     'modulo' => 'Asistencia y Control'],
            ['nombre' => 'Gestionar Asistencia Docente','permiso' => 'asistencia_docente.escribir','modulo' => 'Asistencia y Control'],
            ['nombre' => 'Ver Asistencia Estudiantes','permiso' => 'asistencia_estudiantes.leer', 'modulo' => 'Asistencia y Control'],
            ['nombre' => 'Gestionar Asistencia Estudiantes','permiso' => 'asistencia_estudiantes.escribir','modulo' => 'Asistencia y Control'],
            // Módulo: Reportes
            ['nombre' => 'Ver Reportes',             'permiso' => 'reportes.leer',               'modulo' => 'Reportes'],
            // Módulo: Usuarios y Seguridad
            ['nombre' => 'Ver Usuarios',             'permiso' => 'usuarios.leer',               'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Gestionar Usuarios',       'permiso' => 'usuarios.escribir',           'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Ver Roles',                'permiso' => 'roles.leer',                  'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Gestionar Roles',          'permiso' => 'roles.escribir',              'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Ver Carreras',             'permiso' => 'carreras.leer',               'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Gestionar Carreras',       'permiso' => 'carreras.escribir',           'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Ver Bitácora',             'permiso' => 'bitacora.leer',               'modulo' => 'Usuarios y Seguridad'],
            ['nombre' => 'Gestionar Bitácora',       'permiso' => 'bitacora.escribir',           'modulo' => 'Usuarios y Seguridad'],
        ];

        $funcionIds = [];
        foreach ($funcionesData as $func) {
            $existing = DB::table('funcion')->where('permiso', $func['permiso'])->first();
            if (!$existing) {
                $funcionIds[$func['permiso']] = DB::table('funcion')->insertGetId([
                    'nombre'     => $func['nombre'],
                    'descripcion' => $func['nombre'],
                    'permiso'    => $func['permiso'],
                    'id_modulo'  => $moduloIds[$func['modulo']],
                ]);
            } else {
                $funcionIds[$func['permiso']] = $existing->id;
            }
        }

        // ──────────────────────────────────────────────
        // ASIGNAR TODOS LOS PERMISOS AL ROL ADMINISTRADOR (id_rol = 1)
        // ──────────────────────────────────────────────
        $adminRol = DB::table('rol')->where('nombre', 'Administrador')->first();
        if ($adminRol) {
            foreach ($funcionIds as $permiso => $idFuncion) {
                DB::table('rol_funcion')->insertOrIgnore([
                    'id_rol'     => $adminRol->id,
                    'id_funcion' => $idFuncion,
                    'descripcion' => 'Permiso asignado al Administrador',
                ]);
            }
            $this->command->info('Se asignaron los permisos al rol Administrador.');
        }

        $this->command->info('Módulos y funciones creados correctamente.');
    }
}