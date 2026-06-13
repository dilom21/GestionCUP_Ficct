<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AsignacionAcademica;
use App\Models\Docente;
use App\Models\Evaluacion;
use App\Models\GestionCup;
use App\Models\Grupo;
use App\Models\InscripcionCup;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\ResultadoCup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploradorCupController extends Controller
{
    public function index()
    {
        $gestiones = GestionCup::select('id', 'nombre_gestion')->orderBy('nombre_gestion', 'desc')->get();

        return inertia('Admin/ExploradorCup/Index', [
            'gestiones'  => $gestiones,
        ]);
    }

    public function datos(Request $request)
    {
        $idGestion = $request->input('id_gestion');

        $calcular = fn($fn) => rescue($fn, [], false);

        return response()->json([
            'funnel'         => $calcular(fn() => $this->funnelData($idGestion)),
            'calor'          => $calcular(fn() => $this->calorData($idGestion)),
            'burbujas'       => $calcular(fn() => $this->burbujasData($idGestion)),
            'timeline'       => $calcular(fn() => $this->timelineData()),
            'resumen'        => $calcular(fn() => $this->resumenData($idGestion)),
        ]);
    }

    private function funnelData($idGestion)
    {
        $query = Postulacion::query();
        if ($idGestion) {
            $query->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $idGestion));
        }

        $total = (clone $query)->count();
        $conPago = (clone $query)->whereHas('pagos', fn($q) => $q->where('estado_pago', 'Confirmado'))->count();
        $inscriptos = InscripcionCup::when($idGestion, fn($q) => $q->where('id_gestion_cup', $idGestion))->count();

        $aprobados = ResultadoCup::when($idGestion, fn($q) => $q->whereHas('inscripcionCup', fn($qq) => $qq->where('id_gestion_cup', $idGestion)))
            ->where('estado_resultado', 'Aprobado')->count();
        $reprobados = ResultadoCup::when($idGestion, fn($q) => $q->whereHas('inscripcionCup', fn($qq) => $qq->where('id_gestion_cup', $idGestion)))
            ->where('estado_resultado', 'Reprobado')->count();

        return [
            ['etapa' => 'Postulaciones', 'valor' => $total, 'color' => '#3B82F6'],
            ['etapa' => 'Pagos Confirmados', 'valor' => $conPago, 'color' => '#10B981'],
            ['etapa' => 'Inscripciones', 'valor' => $inscriptos, 'color' => '#8B5CF6'],
            ['etapa' => 'Aprobados', 'valor' => $aprobados, 'color' => '#06B6D4'],
            ['etapa' => 'Reprobados', 'valor' => $reprobados, 'color' => '#EF4444'],
        ];
    }

    private function calorData($idGestion)
    {
        $materias = Materia::where('estado', 'Activo')->pluck('nombre', 'id_materia');
        $grupos = Grupo::when($idGestion, fn($q) => $q->where('id_gestion_cup', $idGestion))
            ->where('estado', 'Activo')->pluck('sigla', 'id');

        $rows = DB::table('nota as n')
            ->join('evaluacion as e', 'n.id_evaluacion', '=', 'e.id')
            ->join('materia as m', 'e.id_materia', '=', 'm.id_materia')
            ->join('inscripcion_cup as ic', 'n.id_inscripcion_cup', '=', 'ic.id')
            ->join('grupo as g', 'ic.id_grupo', '=', 'g.id')
            ->select('m.id_materia', 'g.id as id_grupo', DB::raw('AVG(n.nota_obtenida) as promedio'))
            ->where('m.estado', 'Activo')
            ->whereNotNull('n.nota_obtenida')
            ->when($idGestion, fn($q) => $q->where('ic.id_gestion_cup', $idGestion))
            ->groupBy('m.id_materia', 'g.id')
            ->get();

        $series = [];
        foreach ($materias as $idMat => $nomMat) {
            $data = [];
            foreach ($grupos as $idGrp => $sigla) {
                $prom = $rows->firstWhere(fn($r) => $r->id_materia == $idMat && $r->id_grupo == $idGrp);
                $data[] = [
                    'x' => $sigla,
                    'y' => $nomMat,
                    'valor' => round($prom ? $prom->promedio : 0, 1),
                ];
            }
            if (array_sum(array_column($data, 'valor')) > 0) {
                $series[] = ['name' => $nomMat, 'data' => $data];
            }
        }

        return $series;
    }

    private function burbujasData($idGestion)
    {
        $query = DB::table('nota as n')
            ->join('evaluacion as e', 'n.id_evaluacion', '=', 'e.id')
            ->join('materia as m', 'e.id_materia', '=', 'm.id_materia')
            ->join('inscripcion_cup as ic', 'n.id_inscripcion_cup', '=', 'ic.id')
            ->select(
                'm.nombre as materia',
                DB::raw('COUNT(n.id) as total_notas'),
                DB::raw('AVG(n.nota_obtenida) as promedio'),
                DB::raw('COUNT(DISTINCT n.id_inscripcion_cup) as estudiantes')
            )
            ->where('m.estado', 'Activo')
            ->whereNotNull('n.nota_obtenida')
            ->when($idGestion, fn($q) => $q->where('ic.id_gestion_cup', $idGestion))
            ->groupBy('m.id_materia', 'm.nombre')
            ->get();

        return $query->map(fn($r) => [
            'materia'    => $r->materia,
            'notas'      => (int)$r->total_notas,
            'promedio'   => round((float)$r->promedio, 1),
            'estudiantes' => (int)$r->estudiantes,
        ]);
    }

    private function timelineData()
    {
        $items = collect();

        $recientes = Postulacion::with('postulante:id_postulante,nombre,apellidos')
            ->orderBy('fecha_postulacion', 'desc')->take(5)->get();
        foreach ($recientes as $p) {
            $items->push([
                'tipo' => 'postulacion',
                'icono' => '📋',
                'titulo' => 'Nueva postulación',
                'descripcion' => ($p->postulante?->nombre ?? '') . ' ' . ($p->postulante?->apellidos ?? ''),
                'tiempo' => $p->fecha_postulacion ? $p->fecha_postulacion->diffForHumans() : '',
                'created_at' => $p->fecha_postulacion,
            ]);
        }

        $pagos = Pago::with('postulacion.postulante')
            ->where('estado_pago', 'Confirmado')
            ->orderBy('fecha_pago', 'desc')->take(5)->get();
        foreach ($pagos as $p) {
            $items->push([
                'tipo' => 'pago',
                'icono' => '💰',
                'titulo' => 'Pago confirmado',
                'descripcion' => ($p->postulacion?->postulante?->nombre ?? '') . ' ' . ($p->postulacion?->postulante?->apellidos ?? ''),
                'tiempo' => $p->fecha_pago ? $p->fecha_pago->diffForHumans() : '',
                'created_at' => $p->fecha_pago,
            ]);
        }

        $aprobados = ResultadoCup::with('inscripcionCup.postulacion.postulante')
            ->where('estado_resultado', 'Aprobado')
            ->orderBy('id', 'desc')->take(5)->get();
        foreach ($aprobados as $r) {
            $fecha = $r->inscripcionCup?->fecha_inscripcion;
            $items->push([
                'tipo' => 'aprobado',
                'icono' => '✅',
                'titulo' => 'Postulante aprobado',
                'descripcion' => $r->inscripcionCup?->postulacion?->postulante?->nombre . ' ' . ($r->inscripcionCup?->postulacion?->postulante?->apellidos ?? ''),
                'tiempo' => $fecha ? $fecha->diffForHumans() : '',
                'created_at' => $fecha,
            ]);
        }

        return $items->sortByDesc('created_at')->take(10)->values();
    }

    private function resumenData($idGestion)
    {
        return [
            'postulantes'   => Postulacion::when($idGestion, fn($q) => $q->whereHas('inscripcionCup', fn($qq) => $qq->where('id_gestion_cup', $idGestion)))->count(),
            'aprobados'     => ResultadoCup::where('estado_resultado', 'Aprobado')
                ->when($idGestion, fn($q) => $q->whereHas('inscripcionCup', fn($qq) => $qq->where('id_gestion_cup', $idGestion)))
                ->count(),
            'reprobados'    => ResultadoCup::where('estado_resultado', 'Reprobado')
                ->when($idGestion, fn($q) => $q->whereHas('inscripcionCup', fn($qq) => $qq->where('id_gestion_cup', $idGestion)))
                ->count(),
            'docentes'      => Docente::count(),
            'materias'      => Materia::where('estado', 'Activo')->count(),
            'grupos'        => Grupo::when($idGestion, fn($q) => $q->where('id_gestion_cup', $idGestion))
                ->where('estado', 'Activo')->count(),
            'pagos'         => Pago::where('estado_pago', 'Confirmado')->count(),
        ];
    }
}
