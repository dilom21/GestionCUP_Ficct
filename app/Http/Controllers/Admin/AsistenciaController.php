<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AsistenciaDocente;
use App\Models\AsistenciaEstudiante;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Docente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'docente');
        $periodo = $request->get('periodo', 'dia');
        $fechaInicio = $request->get('fecha_inicio');
        $fechaFin = $request->get('fecha_fin');

        [$fechaInicio, $fechaFin] = $this->calcularRangoFechas($periodo, $fechaInicio, $fechaFin);

        $filtros = [
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'periodo' => $periodo,
            'id_grupo' => $request->get('id_grupo'),
            'id_materia' => $request->get('id_materia'),
            'id_docente' => $request->get('id_docente'),
            'estado' => $request->get('estado'),
        ];

        $grupos = Grupo::where('estado', 'Activo')->orderBy('sigla')->get()->map(fn ($g) => [
            'id' => $g->id,
            'sigla' => $g->sigla,
            'turno' => $g->turno,
        ]);

        $materias = Materia::where('estado', 'Activo')->orderBy('nombre')->get()->map(fn ($m) => [
            'id_materia' => $m->id_materia,
            'nombre' => $m->nombre,
        ]);

        $docentes = Docente::with('usuario')->get()->map(fn ($d) => [
            'id' => $d->id,
            'nombre' => $d->usuario?->nombre . ' ' . $d->usuario?->apellidos,
        ]);

        $asistencias = $tab === 'estudiante'
            ? $this->getAsistenciaEstudiante($filtros)
            : $this->getAsistenciaDocente($filtros);

        return Inertia::render('Admin/Asistencia/Index', [
            'tab' => $tab,
            'asistencias' => $asistencias,
            'filtros' => $filtros,
            'grupos' => $grupos,
            'materias' => $materias,
            'docentes' => $docentes,
        ]);
    }

    private function calcularRangoFechas(string $periodo, ?string $fechaInicio, ?string $fechaFin): array
    {
        return match ($periodo) {
            'semana' => [
                now()->startOfWeek()->toDateString(),
                now()->endOfWeek()->toDateString(),
            ],
            'mes' => [
                now()->startOfMonth()->toDateString(),
                now()->endOfMonth()->toDateString(),
            ],
            'rango' => [
                $fechaInicio ?? now()->startOfMonth()->toDateString(),
                $fechaFin ?? now()->toDateString(),
            ],
            default => [
                now()->toDateString(),
                now()->toDateString(),
            ],
        };
    }

    private function getAsistenciaDocente(array $filtros): array
    {
        $query = AsistenciaDocente::with([
            'asignacionAcademica.materia',
            'asignacionAcademica.grupo',
            'asignacionAcademica.docente.usuario',
        ])
        ->whereBetween('fecha_clase', [$filtros['fecha_inicio'], $filtros['fecha_fin']])
        ->orderBy('fecha_clase', 'desc')
        ->orderBy('hora_entrada', 'desc');

        if ($filtros['id_grupo']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_grupo', $filtros['id_grupo']));
        }
        if ($filtros['id_materia']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_materia', $filtros['id_materia']));
        }
        if ($filtros['id_docente']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_docente', $filtros['id_docente']));
        }
        if ($filtros['estado']) {
            $query->where('estado_asistencia', $filtros['estado']);
        }

        $items = $query->paginate(25);

        $items->getCollection()->transform(function ($a) {
            $asig = $a->asignacionAcademica;
            return [
                'id' => $a->id,
                'fecha' => $a->fecha_clase,
                'hora_entrada' => $a->hora_entrada,
                'hora_salida' => $a->hora_salida,
                'estado' => $a->estado_asistencia,
                'tipo_registro' => $a->tipo_registro,
                'docente' => $asig?->docente?->usuario?->nombre . ' ' . $asig?->docente?->usuario?->apellidos,
                'materia' => $asig?->materia?->nombre,
                'grupo' => $asig?->grupo?->sigla,
            ];
        });

        return [
            'data' => $items->items(),
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'total' => $items->total(),
        ];
    }

    private function getAsistenciaEstudiante(array $filtros): array
    {
        $query = AsistenciaEstudiante::with([
            'asignacionAcademica.materia',
            'asignacionAcademica.grupo',
            'asignacionAcademica.docente.usuario',
            'inscripcionCup.postulacion.postulante.usuario',
        ])
        ->whereBetween('fecha_clase', [$filtros['fecha_inicio'], $filtros['fecha_fin']])
        ->orderBy('fecha_clase', 'desc')
        ->orderBy('hora_registro', 'desc');

        if ($filtros['id_grupo']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_grupo', $filtros['id_grupo']));
        }
        if ($filtros['id_materia']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_materia', $filtros['id_materia']));
        }
        if ($filtros['id_docente']) {
            $query->whereHas('asignacionAcademica', fn ($q) => $q->where('id_docente', $filtros['id_docente']));
        }
        if ($filtros['estado']) {
            $query->where('estado_asistencia', $filtros['estado']);
        }

        $items = $query->paginate(25);

        $items->getCollection()->transform(function ($a) {
            $asig = $a->asignacionAcademica;
            $usuario = $a->inscripcionCup?->postulacion?->postulante?->usuario;
            return [
                'id' => $a->id,
                'fecha' => $a->fecha_clase,
                'hora_registro' => $a->hora_registro,
                'estado' => $a->estado_asistencia,
                'tipo_registro' => $a->tipo_registro,
                'estudiante' => $usuario ? ($usuario->nombre . ' ' . $usuario->apellidos) : '—',
                'materia' => $asig?->materia?->nombre,
                'grupo' => $asig?->grupo?->sigla,
                'docente' => $asig?->docente?->usuario?->nombre . ' ' . $asig?->docente?->usuario?->apellidos,
            ];
        });

        return [
            'data' => $items->items(),
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'total' => $items->total(),
        ];
    }
}
