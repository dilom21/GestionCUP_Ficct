<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResultadoCup;
use App\Models\InscripcionCup;
use App\Models\CupoCarrera;
use App\Models\AdmisionCarrera;
use App\Models\Carrera;
use App\Models\GestionCup;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AsignacionCarreraController extends Controller
{
    public function index(Request $request)
    {
        $gestiones = GestionCup::orderBy('id', 'desc')->get(['id', 'nombre_gestion']);
        $gestionId = $request->id_gestion_cup ?? $gestiones->first()?->id;

        // Obtener aprobados con sus postulaciones y carreras
        $aprobados = collect();
        $resumenCupos = collect();
        $carreras = Carrera::orderBy('nombre')->get();

        if ($gestionId) {
            // Aprobados
            $aprobados = ResultadoCup::with([
                'inscripcionCup.postulacion.postulante',
                'inscripcionCup.postulacion.carrera1',
                'inscripcionCup.postulacion.carrera2',
            ])
            ->where('estado_resultado', 'Aprobado')
            ->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $gestionId))
            ->orderBy('promedio_general', 'desc')
            ->get()
            ->map(function ($r, $idx) {
                $postulacion = $r->inscripcionCup?->postulacion;
                $postulante = $postulacion?->postulante;
                // Verificar si ya fue asignado
                $asignacion = AdmisionCarrera::where('id_resultado_cup', $r->id)->first();
                return [
                    'id_resultado'    => $r->id,
                    'id_inscripcion'  => $r->id_inscripcion_cup,
                    'ranking'         => $idx + 1,
                    'nombre'          => $postulante?->nombre . ' ' . $postulante?->apellidos,
                    'nota'            => (float) $r->promedio_general,
                    'opcion_1'        => $postulacion?->carrera1?->nombre,
                    'opcion_1_id'     => $postulacion?->id_carrera_opcion_1,
                    'opcion_2'        => $postulacion?->carrera2?->nombre,
                    'opcion_2_id'     => $postulacion?->id_carrera_opcion_2,
                    'asignado'        => $asignacion ? [
                        'carrera'   => $asignacion->carreraAsignada?->nombre,
                        'tipo'      => $asignacion->tipo_asignacion,
                        'estado'    => $asignacion->estado_admision,
                    ] : null,
                ];
            });

            // Resumen de cupos
            $cupos = CupoCarrera::with('carrera')
                ->where('id_gestion_cup', $gestionId)
                ->get();

            $resumenCupos = $carreras->map(function ($c) use ($cupos, $aprobados) {
                $cupo = $cupos->firstWhere('id_carrera', $c->id_carrera);
                $demandaOp1 = $aprobados->where('opcion_1_id', $c->id_carrera)->count();
                $demandaOp2 = $aprobados->where('opcion_2_id', $c->id_carrera)->count();
                $admitidos = AdmisionCarrera::where('id_carrera_asignada', $c->id_carrera)
                    ->whereIn('estado_admision', ['Admitido', 'Asignado'])
                    ->count();
                return [
                    'id_carrera'      => $c->id_carrera,
                    'carrera'         => $c->nombre,
                    'sigla'           => $c->sigla,
                    'cupos_totales'   => $cupo?->cantidad_cupos ?? 0,
                    'cupos_ocupados'  => $cupo?->cupos_ocupados ?? 0,
                    'cupos_libres'    => ($cupo?->cantidad_cupos ?? 0) - ($cupo?->cupos_ocupados ?? 0),
                    'demanda_op1'     => $demandaOp1,
                    'demanda_op2'     => $demandaOp2,
                    'admitidos'       => $admitidos,
                    'estado'          => $cupo?->estado ?? 'Sin configurar',
                ];
            });
        }

        return Inertia::render('Admin/AsignacionCarrera/Index', [
            'gestiones'    => $gestiones,
            'gestionId'     => $gestionId,
            'aprobados'    => $aprobados,
            'resumenCupos' => $resumenCupos,
            'carreras'     => $carreras->map(fn($c) => ['id' => $c->id_carrera, 'nombre' => $c->nombre, 'sigla' => $c->sigla]),
        ]);
    }

    public function ejecutarAsignacion(Request $request)
    {
        $gestionId = $request->id_gestion_cup;
        if (!$gestionId) return back()->withErrors(['error' => 'Debe seleccionar una gestión.']);

        DB::beginTransaction();
        try {
            // Obtener aprobados ordenados por nota
            $aprobados = ResultadoCup::with(['inscripcionCup.postulacion'])
                ->where('estado_resultado', 'Aprobado')
                ->whereHas('inscripcionCup', fn($q) => $q->where('id_gestion_cup', $gestionId))
                ->orderBy('promedio_general', 'desc')
                ->get();

            $resultados = [
                'asignados_op1' => 0,
                'asignados_op2' => 0,
                'reasignados'   => 0,
                'pendientes'    => 0,
                'detalle'       => [],
            ];

            $ordenMerito = 0;

            foreach ($aprobados as $r) {
                $ordenMerito++;
                $postulacion = $r->inscripcionCup?->postulacion;
                if (!$postulacion) continue;

                $op1 = $postulacion->id_carrera_opcion_1;
                $op2 = $postulacion->id_carrera_opcion_2;
                $asignado = false;

                // Intentar opción 1
                if ($this->hayCupo($gestionId, $op1)) {
                    $this->asignar($r->id, $op1, 'OPCION_1', $ordenMerito);
                    $resultados['asignados_op1']++;
                    $asignado = true;
                }
                // Intentar opción 2
                elseif ($op2 && $this->hayCupo($gestionId, $op2)) {
                    $this->asignar($r->id, $op2, 'OPCION_2', $ordenMerito);
                    $resultados['asignados_op2']++;
                    $asignado = true;
                }
                // Re-asignar a carrera con cupos libres
                else {
                    $carreraLibre = $this->buscarCarreraLibre($gestionId, $op1, $op2);
                    if ($carreraLibre) {
                        $this->asignar($r->id, $carreraLibre, 'REASIGNADO', $ordenMerito);
                        $resultados['reasignados']++;
                        $asignado = true;
                    }
                }

                if (!$asignado) {
                    // Marcar como pendiente
                    AdmisionCarrera::create([
                        'id_resultado_cup'    => $r->id,
                        'id_carrera_asignada' => $op1,
                        'tipo_asignacion'     => 'PENDIENTE_CUPO',
                        'puntaje_orden_merito' => $ordenMerito,
                        'estado_admision'     => 'Pendiente',
                        'fecha_admision'      => now(),
                    ]);
                    $resultados['pendientes']++;
                }

                $resultados['detalle'][] = [
                    'resultado_id' => $r->id,
                    'nota'         => $r->promedio_general,
                    'asignado'     => $asignado,
                ];
            }

            DB::commit();

            BitacoraService::registrar(
                "Asignación ejecutada - Gestión {$gestionId}: {$resultados['asignados_op1']} op1, {$resultados['asignados_op2']} op2, {$resultados['reasignados']} reasig, {$resultados['pendientes']} pend.",
                session('usuario_id'),
                'admision_carrera'
            );

            return back()->with('success', "Asignación completada: {$resultados['asignados_op1']} op1, {$resultados['asignados_op2']} op2, {$resultados['reasignados']} reasig, {$resultados['pendientes']} pendientes.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error en asignación: ' . $e->getMessage()]);
        }
    }

    public function asignarIndividual(Request $request, $idResultado)
    {
        $resultado = ResultadoCup::with('inscripcionCup.postulacion')->findOrFail($idResultado);
        $postulacion = $resultado->inscripcionCup?->postulacion;
        if (!$postulacion) return back()->withErrors(['error' => 'Postulación no encontrada.']);

        $gestionId = $resultado->inscripcionCup->id_gestion_cup;

        DB::beginTransaction();
        try {
            $op1 = $postulacion->id_carrera_opcion_1;
            $op2 = $postulacion->id_carrera_opcion_2;
            $asignado = false;

            if ($this->hayCupo($gestionId, $op1)) {
                $this->asignar($idResultado, $op1, 'OPCION_1', 0);
                $asignado = true;
            } elseif ($op2 && $this->hayCupo($gestionId, $op2)) {
                $this->asignar($idResultado, $op2, 'OPCION_2', 0);
                $asignado = true;
            }

            DB::commit();

            if ($asignado) return back()->with('success', 'Estudiante asignado correctamente.');
            return back()->withErrors(['error' => 'No hay cupos disponibles en sus opciones.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function hayCupo($gestionId, $carreraId): bool
    {
        if (!$carreraId) return false;
        $cupo = CupoCarrera::where('id_gestion_cup', $gestionId)
            ->where('id_carrera', $carreraId)
            ->first();
        if (!$cupo || $cupo->estado !== 'Activo') return false;
        return ($cupo->cupos_ocupados < $cupo->cantidad_cupos);
    }

    private function asignar($idResultado, $carreraId, $tipo, $ordenMerito)
    {
        AdmisionCarrera::create([
            'id_resultado_cup'     => $idResultado,
            'id_carrera_asignada'  => $carreraId,
            'tipo_asignacion'      => $tipo,
            'puntaje_orden_merito' => $ordenMerito,
            'estado_admision'      => 'Admitido',
            'fecha_admision'       => now(),
        ]);

        CupoCarrera::where('id_gestion_cup', function ($q) use ($idResultado) {
            $q->select('id_gestion_cup')->from('inscripcion_cup')->where('id', function ($qq) use ($idResultado) {
                $qq->select('id_inscripcion_cup')->from('resultado_cup')->where('id', $idResultado);
            });
        })->where('id_carrera', $carreraId)->increment('cupos_ocupados');
    }

    private function buscarCarreraLibre($gestionId, $excluir1, $excluir2): ?int
    {
        $carreras = CupoCarrera::where('id_gestion_cup', $gestionId)
            ->where('estado', 'Activo')
            ->whereRaw('cupos_ocupados < cantidad_cupos')
            ->get();

        foreach ($carreras as $c) {
            if ($c->id_carrera != $excluir1 && $c->id_carrera != $excluir2) {
                return $c->id_carrera;
            }
        }
        return null;
    }
}