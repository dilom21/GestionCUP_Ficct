<?php

namespace App\Services;

use App\Models\ResultadoCup;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\Docente;
use App\Models\AsignacionAcademica;
use App\Models\Nota;
use App\Models\Evaluacion;
use Illuminate\Support\Facades\DB;

class InterpretadorConsultaService
{
    public function interpretar(string $texto): array
    {
        $texto = $this->normalizar($texto);

        $mapas = [
            'lista_general' => [
                'palabras' => ['lista general', 'todos los postulantes', 'todos los estudiantes', 'lista completa', 'muéstrame todos'],
                'tipo' => 'lista_general',
                'tabla' => 'postulacion',
            ],
            'aprobados' => [
                'palabras' => ['aprobados', 'que pasaron', 'que aprobaron', 'admitidos'],
                'tipo' => 'aprobados',
                'tabla' => 'resultado_cup',
            ],
            'reprobados' => [
                'palabras' => ['reprobados', 'que no pasaron', 'que no aprobaron', 'suspendidos', 'jalaron'],
                'tipo' => 'reprobados',
                'tabla' => 'resultado_cup',
            ],
            'promedios' => [
                'palabras' => ['promedio', 'nota media', 'promedios', 'calificaciones', 'puntaje'],
                'tipo' => 'promedios',
                'tabla' => 'resultado_cup',
            ],
            'grupos_habilitados' => [
                'palabras' => ['grupos habil', 'cuantos grupos', 'grupos activos', 'grupos disponibles', 'cantidad de grupos'],
                'tipo' => 'grupos_habilitados',
                'tabla' => 'grupo',
            ],
            'estadisticas_materia' => [
                'palabras' => ['estadisticas por materia', 'por materia', 'cada materia', 'materias', 'rendimiento materia'],
                'tipo' => 'estadisticas_materia',
                'tabla' => 'materia',
            ],
            'docentes_grupos' => [
                'palabras' => ['docentes por grupo', 'docentes grupos', 'profesores grupo', 'quien enseña', 'docentes asignados'],
                'tipo' => 'docentes_grupos',
                'tabla' => 'asignacion_academica',
            ],
            'top_grupos' => [
                'palabras' => ['grupos con mas aprobados', 'top grupos', 'mejores grupos', 'grupos con mayor', 'ranking grupos'],
                'tipo' => 'top_grupos',
                'tabla' => 'grupo',
            ],
        ];

        $mejor = ['tipo' => 'lista_general', 'score' => 0, 'filtros' => []];

        foreach ($mapas as $key => $mapa) {
            foreach ($mapa['palabras'] as $palabra) {
                if (str_contains($texto, $palabra)) {
                    $score = strlen($palabra);
                    if ($score > $mejor['score']) {
                        $mejor = ['tipo' => $mapa['tipo'], 'score' => $score, 'filtros' => []];
                    }
                }
            }
        }

        $filtros = $this->extraerFiltros($texto);

        return [
            'tipo' => $mejor['tipo'],
            'filtros' => array_merge($filtros, $mejor['filtros']),
        ];
    }

    private function normalizar(string $texto): string
    {
        $texto = mb_strtolower($texto, 'UTF-8');
        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'];
        $reemplazar = ['a', 'e', 'i', 'o', 'u', 'u', 'n'];
        $texto = str_replace($buscar, $reemplazar, $texto);
        return trim(preg_replace('/[^a-z0-9\s]/', '', $texto));
    }

    private function extraerFiltros(string $texto): array
    {
        $filtros = [];

        if (preg_match('/gestion\s*(\d[-\s]\d{4})/', $texto, $m)) {
            $nombre = str_replace(' ', '', $m[1]);
            $gestion = \App\Models\GestionCup::where('nombre_gestion', $nombre)->first();
            if ($gestion) {
                $filtros['id_gestion'] = $gestion->id;
            }
        }

        if (preg_match('/(\d{4})/', $texto, $m)) {
            if (!isset($filtros['id_gestion'])) {
                $gestion = \App\Models\GestionCup::where('nombre_gestion', 'like', "%{$m[1]}%")->first();
                if ($gestion) {
                    $filtros['id_gestion'] = $gestion->id;
                }
            }
        }

        $carreras = \App\Models\Carrera::all();
        foreach ($carreras as $carrera) {
            $nombreNorm = $this->normalizar($carrera->nombre);
            if (str_contains($texto, $nombreNorm) || (!empty($carrera->sigla) && str_contains($texto, $this->normalizar($carrera->sigla)))) {
                $filtros['id_carrera'] = $carrera->id_carrera;
                break;
            }
        }

        if (preg_match('/\b(manana|tarde|noche)\b/', $texto, $m)) {
            $mapa = ['manana' => 'Mañana', 'tarde' => 'Tarde', 'noche' => 'Noche'];
            $filtros['turno'] = $mapa[$m[1]];
        }

        return $filtros;
    }
}
