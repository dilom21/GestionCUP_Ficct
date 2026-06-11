<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use App\Models\AsignacionAcademica;
use App\Models\AsistenciaDocente;
use App\Models\Docente;
use App\Services\QrTokenService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index()
    {
        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return redirect()->back()->with('error', 'Perfil docente no encontrado.');
        }

        $asignaciones = AsignacionAcademica::with(['materia', 'grupo', 'horarios'])
            ->where('id_docente', $docente->id)
            ->where('estado', 'Activo')
            ->get()
            ->map(function ($a) {
                return [
                    'id'        => $a->id,
                    'materia'   => $a->materia?->nombre,
                    'grupo'     => $a->grupo?->sigla,
                    'horarios'  => $a->horarios->map(fn ($h) => [
                        'dia'    => $h->dia_semana,
                        'inicio' => $h->horario_inicio,
                        'fin'    => $h->horario_fin,
                        'aula'   => $h->aula?->codigo,
                    ]),
                ];
            });

        $hoy = now()->toDateString();
        $asistenciasHoy = AsistenciaDocente::whereHas('asignacionAcademica', function ($q) use ($docente) {
                $q->where('id_docente', $docente->id);
            })
            ->where('fecha_clase', $hoy)
            ->get()
            ->map(fn ($a) => [
                'id_asignacion' => $a->id_asignacion_academica,
                'hora_entrada'  => $a->hora_entrada,
                'hora_salida'   => $a->hora_salida,
                'estado'        => $a->estado_asistencia,
            ]);

        return Inertia::render('Docente/Asistencia/Index', [
            'asignaciones'    => $asignaciones,
            'asistencias_hoy' => $asistenciasHoy,
        ]);
    }

    public function generarQr(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $resultado = $qrService->generarToken(
                $request->id_asignacion_academica,
                $docente->id
            );

            BitacoraService::registrar(
                "QR generado para asignación ID: {$request->id_asignacion_academica}",
                session('usuario_id'),
                'asistencia_estudiante'
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function registrarEntrada(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $resultado = $qrService->registrarEntradaDocente(
                $request->id_asignacion_academica,
                $docente->id
            );

            BitacoraService::registrar(
                "Entrada registrada - Asignación ID: {$request->id_asignacion_academica}",
                session('usuario_id'),
                'asistencia_docente'
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function registrarSalida(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $resultado = $qrService->registrarSalidaDocente(
                $request->id_asignacion_academica,
                $docente->id
            );

            BitacoraService::registrar(
                "Salida registrada - Asignación ID: {$request->id_asignacion_academica}",
                session('usuario_id'),
                'asistencia_docente'
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ─── Modo Código PIN ───────────────────────────────────────────

    public function generarPin(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $resultado = $qrService->generarPin(
                $request->id_asignacion_academica,
                $docente->id
            );

            BitacoraService::registrar(
                "PIN generado para asignación ID: {$request->id_asignacion_academica}",
                session('usuario_id'),
                'asistencia_estudiante'
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ─── Modo Lista ────────────────────────────────────────────────

    public function obtenerEstudiantes(Request $request)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $estudiantes = app(QrTokenService::class)->obtenerEstudiantesPorAsignacion(
                $request->id_asignacion_academica,
                $docente->id
            );

            return response()->json(['estudiantes' => $estudiantes]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function registrarEstudiante(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
            'id_inscripcion_cup'      => 'required|integer|exists:inscripcion_cup,id',
            'estado'                  => 'required|string|in:Presente,Ausente,Tardanza',
        ]);

        $docente = Docente::where('id_usuario', session('usuario_id'))->first();

        if (!$docente) {
            return response()->json(['error' => 'Perfil docente no encontrado.'], 400);
        }

        try {
            $resultado = $qrService->registrarDesdeLista(
                $request->id_asignacion_academica,
                $request->id_inscripcion_cup,
                $request->estado,
                $docente->id
            );

            BitacoraService::registrar(
                "Lista: {$resultado['accion']} {$request->estado} - Inscripción ID: {$request->id_inscripcion_cup}",
                session('usuario_id'),
                'asistencia_estudiante'
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
