<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InscripcionCup;
use App\Models\Nota;
use App\Models\Evaluacion;
use App\Models\ResultadoCup;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResultadoCupController extends Controller
{
    public function index()
    {
        // 1. Traer todas las inscripciones con relaciones
        $inscripciones = InscripcionCup::with([
            'postulacion.postulante',
            'gestionCup',
            'grupo',
            'resultado',
        ])
        ->where('estado', 'Inscrito')
        ->get();

        // 2. Traer TODAS las notas de UNA SOLA vez con sus evaluaciones
        $ids = $inscripciones->pluck('id');
        $notas = Nota::with('evaluacion.materia')
            ->whereIn('id_inscripcion_cup', $ids)
            ->get()
            ->groupBy('id_inscripcion_cup');

        // 3. Mapear en memoria (sin consultas adicionales)
        $resultado = $inscripciones->map(function ($ins) use ($notas) {
            $notasIns = $notas->get($ins->id, collect());
            $resultado = $ins->resultado;

            $evaluaciones = [];
            foreach ($notasIns as $n) {
                $key = $n->evaluacion->nombre;
                if (!isset($evaluaciones[$key])) {
                    $evaluaciones[$key] = [
                        'nombre' => $key,
                        'porcentaje' => $n->evaluacion->porcentaje,
                        'materias' => [],
                    ];
                }
                $evaluaciones[$key]['materias'][] = [
                    'materia' => $n->evaluacion->materia->nombre,
                    'nota' => (float) $n->nota_obtenida,
                ];
            }

            return [
                'id' => $ins->id,
                'id_postulacion' => $ins->id_postulacion,
                'postulante' => $ins->postulacion->postulante ? [
                    'nombre' => $ins->postulacion->postulante->nombre,
                    'apellidos' => $ins->postulacion->postulante->apellidos,
                    'ci' => $ins->postulacion->postulante->ci,
                    'correo' => $ins->postulacion->postulante->correo,
                ] : null,
                'gestion' => $ins->gestionCup->nombre_gestion ?? '—',
                'grupo' => $ins->grupo->sigla ?? '—',
                'turno' => $ins->postulacion->turno ?? '—',
                'evaluaciones' => array_values($evaluaciones),
                'resultado' => $resultado ? [
                    'promedio_general' => (float) $resultado->promedio_general,
                    'estado_resultado' => $resultado->estado_resultado,
                    'observacion' => $resultado->observacion,
                ] : null,
            ];
        });

        return Inertia::render('Admin/ResultadosCup/Index', [
            'inscripciones' => $resultado,
        ]);
    }

    public function calcular($id)
    {
        DB::beginTransaction();
        try {
            $notas = Nota::with('evaluacion.materia')
                ->where('id_inscripcion_cup', $id)
                ->get();

            if ($notas->isEmpty()) {
                return back()->withErrors(['error' => 'No hay notas registradas.']);
            }

            $grupos = $notas->groupBy(fn($n) => $n->evaluacion->nombre);
            $reprobado = false;
            $motivo = '';
            $resultadosPorEval = [];
            $porcentajes = ['Parcial 1' => 0.30, 'Parcial 2' => 0.30, 'Examen Final' => 0.40];

            foreach ($grupos as $nombreEval => $notasEval) {
                $suma = 0;
                $total = 0;
                foreach ($notasEval as $n) {
                    $notaVal = (float) $n->nota_obtenida;
                    $suma += $notaVal;
                    $total++;
                    if ($notaVal < 60) {
                        $reprobado = true;
                        $motivo = "Nota menor a 60 en {$n->evaluacion->materia->nombre} - {$nombreEval}";
                        break 2;
                    }
                }
                $resultadosPorEval[$nombreEval] = [
                    'promedio' => $suma / $total,
                    'porcentaje' => (float) $notasEval->first()->evaluacion->porcentaje,
                ];
            }

            if ($reprobado) {
                ResultadoCup::updateOrCreate(
                    ['id_inscripcion_cup' => $id],
                    ['promedio_general' => 0, 'estado_resultado' => 'Reprobado', 'observacion' => $motivo]
                );
                DB::commit();
                return back()->with('success', "Resultado: Reprobado. {$motivo}");
            }

            $notaFinal = 0;
            foreach ($resultadosPorEval as $nombre => $r) {
                $notaFinal += $r['promedio'] * ($porcentajes[$nombre] ?? ($r['porcentaje'] / 100));
            }
            $notaFinal = round($notaFinal, 2);
            $estado = $notaFinal >= 60 ? 'Aprobado' : 'Reprobado';
            $observacion = $estado === 'Aprobado'
                ? "Nota final: {$notaFinal} puntos"
                : "Nota final insuficiente: {$notaFinal} puntos (mínimo 60)";

            ResultadoCup::updateOrCreate(
                ['id_inscripcion_cup' => $id],
                ['promedio_general' => $notaFinal, 'estado_resultado' => $estado, 'observacion' => $observacion]
            );

            DB::commit();
            return back()->with('success', "Resultado: {$estado} - Nota final: {$notaFinal}");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al calcular: ' . $e->getMessage()]);
        }
    }

    public function calcularTodos()
    {
        $ids = InscripcionCup::where('estado', 'Inscrito')->pluck('id');
        $notas = Nota::with('evaluacion.materia')
            ->whereIn('id_inscripcion_cup', $ids)
            ->get()
            ->groupBy('id_inscripcion_cup');

        $porcentajes = ['Parcial 1' => 0.30, 'Parcial 2' => 0.30, 'Examen Final' => 0.40];
        $calculados = 0;

        DB::beginTransaction();
        try {
            foreach ($notas as $inscripcionId => $notasIns) {
                $this->calcularInterno($notasIns, $porcentajes, $inscripcionId);
                $calculados++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }

        return back()->with('success', "Resultados calculados para {$calculados} postulantes.");
    }

    private function calcularInterno($notas, $porcentajes, $inscripcionId)
    {
        $grupos = $notas->groupBy(fn($n) => $n->evaluacion->nombre);

        foreach ($grupos as $nombreEval => $notasEval) {
            foreach ($notasEval as $n) {
                if ((float) $n->nota_obtenida < 60) {
                    ResultadoCup::updateOrCreate(
                        ['id_inscripcion_cup' => $inscripcionId],
                        ['promedio_general' => 0, 'estado_resultado' => 'Reprobado',
                         'observacion' => "Nota menor a 60 en {$n->evaluacion->materia->nombre} - {$nombreEval}"]
                    );
                    return;
                }
            }
        }

        $notaFinal = 0;
        foreach ($grupos as $nombreEval => $notasEval) {
            $suma = $notasEval->sum(fn($n) => (float) $n->nota_obtenida);
            $total = $notasEval->count();
            $promedio = $suma / $total;
            $notaFinal += $promedio * ($porcentajes[$nombreEval] ?? ((float) $notasEval->first()->evaluacion->porcentaje / 100));
        }

        $notaFinal = round($notaFinal, 2);
        $estado = $notaFinal >= 60 ? 'Aprobado' : 'Reprobado';

        ResultadoCup::updateOrCreate(
            ['id_inscripcion_cup' => $inscripcionId],
            ['promedio_general' => $notaFinal, 'estado_resultado' => $estado,
             'observacion' => $estado === 'Aprobado' ? "Nota final: {$notaFinal} puntos" : "Nota final insuficiente: {$notaFinal} puntos (mínimo 60)"]
        );
    }
}