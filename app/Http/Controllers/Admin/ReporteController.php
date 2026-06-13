<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ReporteExport;
use App\Http\Controllers\Controller;
use App\Models\AsignacionAcademica;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Evaluacion;
use App\Models\GestionCup;
use App\Models\Grupo;
use App\Models\InscripcionCup;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\ResultadoCup;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteController extends Controller
{
    public function index()
    {
        $gestiones = GestionCup::select('id', 'nombre_gestion')->orderBy('nombre_gestion', 'desc')->get();
        $carreras = Carrera::select('id_carrera', 'nombre', 'sigla')->orderBy('nombre')->get();
        $materias = Materia::select('id_materia', 'nombre')->where('estado', 'Activo')->orderBy('nombre')->get();
        $grupos = Grupo::select('id', 'sigla', 'turno')->where('estado', 'Activo')->orderBy('sigla')->get();
        $docentes = Docente::with('usuario:id,nombre,apellidos')->get()->map(fn($d) => [
            'id'   => $d->id,
            'nombre_completo' => ($d->usuario?->nombre ?? '') . ' ' . ($d->usuario?->apellidos ?? ''),
            'ci'   => $d->ci,
        ])->sortBy('nombre_completo')->values();
        $aulas = \App\Models\Aula::select('id', 'codigo', 'nombre')->where('estado', 'Activo')->orderBy('codigo')->get();

        $kpi = [
            'total_postulantes'  => Postulacion::count(),
            'total_aprobados'    => ResultadoCup::where('estado_resultado', 'Aprobado')->count(),
            'total_reprobados'   => ResultadoCup::where('estado_resultado', 'Reprobado')->count(),
            'total_materias'     => Materia::where('estado', 'Activo')->count(),
            'total_grupos'       => Grupo::where('estado', 'Activo')->count(),
            'total_docentes'     => Docente::count(),
        ];

        return inertia('Administrativo/Reportes/Index', [
            'kpi'       => $kpi,
            'gestiones'  => $gestiones,
            'carreras'   => $carreras,
            'materias'   => $materias,
            'grupos'     => $grupos,
            'docentes'   => $docentes,
            'aulas'      => $aulas,
        ]);
    }

    public function generar(Request $request): JsonResponse
    {
        $request->validate([
            'tipo'   => 'required|string|in:lista_general,aprobados,reprobados,promedios,grupos_habilitados,estadisticas_materia,docentes_grupos,top_grupos',
            'filtros' => 'nullable|array',
        ]);

        $tipo = $request->input('tipo');
        $filtros = $request->input('filtros', []);

        $resultado = match ($tipo) {
            'lista_general'       => $this->reporteListaGeneral($filtros),
            'aprobados'           => $this->reporteAprobados($filtros),
            'reprobados'          => $this->reporteReprobados($filtros),
            'promedios'           => $this->reportePromedios($filtros),
            'grupos_habilitados'  => $this->reporteGruposHabilitados($filtros),
            'estadisticas_materia'=> $this->reporteEstadisticasMateria($filtros),
            'docentes_grupos'     => $this->reporteDocentesGrupos($filtros),
            'top_grupos'          => $this->reporteTopGrupos($filtros),
            default               => ['data' => [], 'chart' => null, 'columns' => []],
        };

        return response()->json($resultado);
    }

    private function reporteListaGeneral(array $filtros): array
    {
        $query = Postulacion::with([
            'postulante',
            'carrera1:id_carrera,nombre',
            'carrera2:id_carrera,nombre',
            'pagos' => fn($q) => $q->where('estado_pago', 'Confirmado'),
        ]);

        if (!empty($filtros['id_gestion'])) {
            $query->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $filtros['id_gestion']));
        }
        if (!empty($filtros['id_carrera'])) {
            $query->where(function ($q) use ($filtros) {
                $q->where('id_carrera_opcion_1', $filtros['id_carrera'])
                  ->orWhere('id_carrera_opcion_2', $filtros['id_carrera']);
            });
        }
        if (!empty($filtros['estado'])) {
            $query->where('estado_postulacion', $filtros['estado']);
        }
        if (!empty($filtros['turno'])) {
            $query->where('turno', $filtros['turno']);
        }

        $postulaciones = $query->orderBy('fecha_postulacion', 'desc')->get();

        $data = $postulaciones->map(fn($p) => [
            'nro_formulario'  => $p->nro_formulario,
            'nombre'          => $p->postulante?->nombre ?? '',
            'apellidos'       => $p->postulante?->apellidos ?? '',
            'ci'              => $p->postulante?->ci ?? '',
            'correo'          => $p->postulante?->correo ?? '',
            'telefono'        => $p->postulante?->telefono ?? '',
            'ciudad'          => $p->postulante?->ciudad ?? '',
            'turno'           => $p->turno ?? '',
            'estado'          => $p->estado_postulacion,
            'carrera_1'       => $p->carrera1?->nombre ?? '',
            'carrera_2'       => $p->carrera2?->nombre ?? '',
            'pagado'          => $p->pagos->isNotEmpty() ? 'Sí' : 'No',
        ]);

        $chart = [
            'tipo' => 'bar',
            'datos' => $postulaciones->groupBy('estado_postulacion')->map(fn($g, $k) => [
                'label' => $k, 'valor' => $g->count()
            ])->values(),
            'label' => 'Estado',
            'valor' => 'Cantidad',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Nro Formulario', 'Nombre', 'Apellidos', 'CI', 'Correo', 'Teléfono', 'Ciudad', 'Turno', 'Estado', 'Carrera Op. 1', 'Carrera Op. 2', 'Pagado'],
        ];
    }

    private function reporteAprobados(array $filtros): array
    {
        $query = ResultadoCup::with([
            'inscripcionCup.postulacion.postulante',
            'inscripcionCup.postulacion.carrera1:id_carrera,nombre',
            'inscripcionCup.grupo:id,sigla',
            'admisionCarreras.carreraAsignada:id_carrera,nombre',
        ])->where('estado_resultado', 'Aprobado');

        if (!empty($filtros['id_gestion'])) {
            $query->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $filtros['id_gestion']));
        }
        if (!empty($filtros['id_carrera'])) {
            $query->whereHas('admisionCarreras', fn($q) => $q->where('id_carrera_asignada', $filtros['id_carrera']));
        }

        $resultados = $query->orderBy('promedio_general', 'desc')->get();

        $data = $resultados->map(fn($r) => [
            'nombre'        => $r->inscripcionCup?->postulacion?->postulante?->nombre ?? '',
            'apellidos'     => $r->inscripcionCup?->postulacion?->postulante?->apellidos ?? '',
            'ci'            => $r->inscripcionCup?->postulacion?->postulante?->ci ?? '',
            'promedio'      => number_format($r->promedio_general, 2),
                    'carrera'       => $r->admisionCarreras->first()?->carreraAsignada?->nombre ?? '',
                    'tipo_asignacion' => $r->admisionCarreras->first()?->tipo_asignacion ?? '',
                    'grupo'         => $r->inscripcionCup?->grupo?->sigla ?? '',
                ]);

        $chart = [
            'tipo' => 'bar',
            'datos' => $resultados->groupBy(fn($r) => $r->admisionCarreras->first()?->carreraAsignada?->nombre ?? 'Sin asignar')
                ->map(fn($g, $k) => ['label' => $k, 'valor' => $g->count()])->values(),
            'label' => 'Carrera',
            'valor' => 'Aprobados',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Nombre', 'Apellidos', 'CI', 'Promedio', 'Carrera Asignada', 'Tipo Asignación', 'Grupo'],
        ];
    }

    private function reporteReprobados(array $filtros): array
    {
        $query = ResultadoCup::with([
            'inscripcionCup.postulacion.postulante',
            'inscripcionCup.postulacion.carrera1:id_carrera,nombre',
        ])->where('estado_resultado', 'Reprobado');

        if (!empty($filtros['id_gestion'])) {
            $query->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $filtros['id_gestion']));
        }

        $resultados = $query->orderBy('promedio_general', 'asc')->get();

        $data = $resultados->map(fn($r) => [
            'nombre'    => $r->inscripcionCup?->postulacion?->postulante?->nombre ?? '',
            'apellidos' => $r->inscripcionCup?->postulacion?->postulante?->apellidos ?? '',
            'ci'        => $r->inscripcionCup?->postulacion?->postulante?->ci ?? '',
            'promedio'  => number_format($r->promedio_general, 2),
            'carrera_1' => $r->inscripcionCup?->postulacion?->carrera1?->nombre ?? '',
        ]);

        $chart = [
            'tipo' => 'pie',
            'datos' => [
                ['label' => 'Aprobados', 'valor' => ResultadoCup::where('estado_resultado', 'Aprobado')->count()],
                ['label' => 'Reprobados', 'valor' => $resultados->count()],
            ],
            'label' => 'Resultado',
            'valor' => 'Cantidad',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Nombre', 'Apellidos', 'CI', 'Promedio', 'Carrera Op. 1'],
        ];
    }

    private function reportePromedios(array $filtros): array
    {
        $query = ResultadoCup::with('inscripcionCup.postulacion.postulante');

        if (!empty($filtros['id_gestion'])) {
            $query->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $filtros['id_gestion']));
        }

        $resultados = $query->get();
        $promedioGeneral = $resultados->avg('promedio_general');

        $porEstudiante = $resultados->sortByDesc('promedio_general')->map(fn($r) => [
            'nombre'   => $r->inscripcionCup?->postulacion?->postulante?->nombre . ' ' . ($r->inscripcionCup?->postulacion?->postulante?->apellidos ?? ''),
            'ci'       => $r->inscripcionCup?->postulacion?->postulante?->ci ?? '',
            'promedio' => number_format($r->promedio_general, 2),
            'estado'   => $r->estado_resultado,
        ])->values();

        $porMateria = Evaluacion::with('materia:id_materia,nombre')
            ->whereHas('notas')
            ->when(!empty($filtros['id_gestion']), fn($q) => $q->where('id_gestion_cup', $filtros['id_gestion']))
            ->get()
            ->groupBy(fn($e) => $e->materia?->nombre ?? 'General')
            ->map(fn($evals, $materia) => [
                'materia'  => $materia,
                'promedio' => number_format($evals->flatMap->notas->avg('nota_obtenida') ?? 0, 2),
                'total_notas' => $evals->flatMap->notas->count(),
            ])->values();

        $data = [
            'promedio_general' => number_format($promedioGeneral, 2),
            'por_estudiante'   => $porEstudiante,
            'por_materia'      => $porMateria,
            'total_resultados' => $resultados->count(),
        ];

        $chart = [
            'tipo' => 'bar',
            'datos' => $porMateria->map(fn($m) => [
                'label' => $m['materia'],
                'valor' => (float) $m['promedio'],
            ]),
            'label' => 'Materia',
            'valor' => 'Promedio',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => [],
        ];
    }

    private function reporteGruposHabilitados(array $filtros): array
    {
        $query = Grupo::where('estado', 'Activo')
            ->select('id_gestion_cup', DB::raw('count(*) as total'), DB::raw('sum(cupo_maximo) as total_cupos'))
            ->groupBy('id_gestion_cup')
            ->with('gestionCup:id,nombre_gestion');

        $grupos = $query->get();

        $data = $grupos->map(fn($g) => [
            'gestion'     => $g->gestionCup?->nombre_gestion ?? '',
            'cantidad'    => $g->total,
            'cupos_totales' => $g->total_cupos,
        ]);

        $chart = [
            'tipo' => 'bar',
            'datos' => $grupos->map(fn($g) => [
                'label' => $g->gestionCup?->nombre_gestion ?? '',
                'valor' => (int) $g->total,
            ]),
            'label' => 'Gestión',
            'valor' => 'Grupos',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Gestión', 'Cant. Grupos', 'Cupos Totales'],
        ];
    }

    private function reporteEstadisticasMateria(array $filtros): array
    {
        $materias = Materia::with(['evaluaciones.notas', 'evaluaciones' => function ($q) use ($filtros) {
            if (!empty($filtros['id_gestion'])) {
                $q->where('id_gestion_cup', $filtros['id_gestion']);
            }
        }])->where('estado', 'Activo')->get();

        $data = $materias->map(function ($materia) {
            $notas = $materia->evaluaciones->flatMap->notas;
            $total = $notas->count();
            $promedio = $total > 0 ? $notas->avg('nota_obtenida') : 0;

            $estudiantesUnicos = $notas->pluck('id_inscripcion_cup')->unique()->count();

            $aprobados = $notas->filter(fn($n) => $n->nota_obtenida >= 60)->count();
            $reprobados = $notas->filter(fn($n) => $n->nota_obtenida < 60)->count();

            return [
                'materia'        => $materia->nombre,
                'estudiantes'    => $estudiantesUnicos,
                'promedio'       => number_format($promedio, 2),
                'aprobados'      => $aprobados,
                'reprobados'     => $reprobados,
                'tasa_aprobacion' => $total > 0 ? number_format(($aprobados / $total) * 100, 1) . '%' : '0%',
            ];
        });

        $chart = [
            'tipo' => 'bar',
            'datos' => $data->map(fn($m) => [
                'label' => $m['materia'],
                'valor' => (float) $m['promedio'],
            ]),
            'label' => 'Materia',
            'valor' => 'Promedio',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Materia', 'Estudiantes', 'Promedio', 'Aprobados', 'Reprobados', 'Tasa Aprobación'],
        ];
    }

    private function reporteDocentesGrupos(array $filtros): array
    {
        $query = AsignacionAcademica::with([
            'docente.usuario:id,nombre,apellidos',
            'grupo:id,sigla,turno',
            'materia:id_materia,nombre',
        ])->where('estado', 'Activo');

        if (!empty($filtros['id_gestion'])) {
            $query->where('id_gestion_cup', $filtros['id_gestion']);
        }
        if (!empty($filtros['id_carrera'])) {
            $query->whereHas('materia', fn($q) => $q->where('id_carrera', $filtros['id_carrera']));
        }

        $asignaciones = $query->orderBy('id_docente')->get();

        $data = $asignaciones->map(fn($a) => [
            'docente'  => ($a->docente?->usuario?->nombre ?? '') . ' ' . ($a->docente?->usuario?->apellidos ?? ''),
            'ci'       => $a->docente?->ci ?? '',
            'materia'  => $a->materia?->nombre ?? '',
            'grupo'    => $a->grupo?->sigla ?? '',
            'turno'    => $a->grupo?->turno ?? '',
            'carga_horaria' => $a->carga_horaria,
        ]);

        $chart = [
            'tipo' => 'bar',
            'datos' => $asignaciones->groupBy(fn($a) => ($a->docente?->usuario?->nombre ?? '') . ' ' . ($a->docente?->usuario?->apellidos ?? ''))
                ->map(fn($g, $k) => ['label' => $k, 'valor' => $g->count()])->values(),
            'label' => 'Docente',
            'valor' => 'Grupos',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Docente', 'CI', 'Materia', 'Grupo', 'Turno', 'Carga Horaria'],
        ];
    }

    private function reporteTopGrupos(array $filtros): array
    {
        $query = Grupo::with('gestionCup:id,nombre_gestion')
            ->select('grupo.*', DB::raw('COUNT(CASE WHEN rc.estado_resultado = \'Aprobado\' THEN 1 END) as aprobados'))
            ->leftJoin('inscripcion_cup as ic', 'ic.id_grupo', '=', 'grupo.id')
            ->leftJoin('resultado_cup as rc', 'rc.id_inscripcion_cup', '=', 'ic.id')
            ->where('grupo.estado', 'Activo')
            ->groupBy('grupo.id', 'grupo.id_gestion_cup', 'grupo.sigla', 'grupo.cupo_maximo', 'grupo.turno', 'grupo.modalidad', 'grupo.estado')
            ->orderByDesc('aprobados');

        if (!empty($filtros['id_gestion'])) {
            $query->where('grupo.id_gestion_cup', $filtros['id_gestion']);
        }

        $grupos = $query->take(20)->get();

        $data = $grupos->map(fn($g) => [
            'grupo'       => $g->sigla,
            'gestion'     => $g->gestionCup?->nombre_gestion ?? '',
            'turno'       => $g->turno,
            'cupo_maximo' => $g->cupo_maximo,
            'aprobados'   => (int) $g->aprobados,
        ]);

        $chart = [
            'tipo' => 'bar',
            'datos' => $grupos->map(fn($g) => [
                'label' => $g->sigla,
                'valor' => (int) $g->aprobados,
            ]),
            'label' => 'Grupo',
            'valor' => 'Aprobados',
        ];

        return [
            'data'    => $data,
            'chart'   => $chart,
            'columns' => ['Grupo', 'Gestión', 'Turno', 'Cupo Máximo', 'Aprobados'],
        ];
    }

    public function exportarCsv(Request $request): StreamedResponse
    {
        $data = $this->generar($request)->getData(true);
        $columns = $data['columns'];
        $rows = $data['data'];

        $callback = function () use ($columns, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns, ';');
            foreach ($rows as $row) {
                if (is_array($row)) {
                    fputcsv($handle, array_values($row), ';');
                }
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="reporte.csv"',
        ]);
    }

    public function exportarPdf(Request $request)
    {
        $data = $this->generar($request)->getData(true);
        $pdf = Pdf::loadView('reportes.tabla', [
            'columns' => $data['columns'],
            'rows'    => $data['data'],
            'titulo'  => 'Reporte - CUP FICCT',
        ]);

        return $pdf->download('reporte.pdf');
    }

    public function exportarExcel(Request $request)
    {
        $data = $this->generar($request)->getData(true);
        $rows = collect($data['data'])->map(fn($r) => is_array($r) ? array_values($r) : [])->toArray();

        return Excel::download(
            new ReporteExport($rows, $data['columns']),
            'reporte.xlsx'
        );
    }
}
