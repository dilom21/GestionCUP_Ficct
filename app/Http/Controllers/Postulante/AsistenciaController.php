<?php

namespace App\Http\Controllers\Postulante;

use App\Http\Controllers\Controller;
use App\Models\InscripcionCup;
use App\Services\QrTokenService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index()
    {
        $postulante = \App\Models\Postulante::where('id_usuario', session('usuario_id'))->first();

        if (!$postulante) {
            return redirect()->back()->with('error', 'Perfil de postulante no encontrado.');
        }

        $inscripciones = InscripcionCup::with([
            'grupo',
            'postulacion.carrera1',
            'asignacionesAcademicas' => function ($q) {
                $q->with(['materia', 'horarios.aula', 'docente.usuario']);
            },
        ])
        ->whereHas('postulacion', function ($q) use ($postulante) {
            $q->where('id_postulante', $postulante->id_postulante);
        })
        ->get()
        ->map(function ($inscripcion) {
            return [
                'id'          => $inscripcion->id,
                'grupo'       => $inscripcion->grupo?->sigla,
                'asignaciones' => $inscripcion->asignacionesAcademicas->map(fn ($a) => [
                    'id'       => $a->id,
                    'materia'  => $a->materia?->nombre,
                    'docente'  => $a->docente?->usuario?->nombre . ' ' . $a->docente?->usuario?->apellidos,
                    'horarios' => $a->horarios->map(fn ($h) => [
                        'dia'    => $h->dia_semana,
                        'inicio' => $h->horario_inicio,
                        'fin'    => $h->horario_fin,
                        'aula'   => $h->aula?->codigo,
                    ]),
                ]),
            ];
        });

        return Inertia::render('Postulante/Asistencia/Index', [
            'inscripciones' => $inscripciones,
        ]);
    }

    public function escanearQr(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'token' => 'required|string|size:64',
        ], [
            'token.required' => 'El token QR es obligatorio.',
            'token.size'     => 'El token QR debe tener 64 caracteres.',
        ]);

        try {
            $resultado = $qrService->validarTokenYRegistrar(
                $request->token,
                session('usuario_id')
            );

            return response()->json([
                'success' => true,
                'message' => $resultado['mensaje'],
                'data'    => $resultado,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function validarPin(Request $request, QrTokenService $qrService)
    {
        $request->validate([
            'pin' => 'required|string|size:6',
        ], [
            'pin.required' => 'El código PIN es obligatorio.',
            'pin.size'     => 'El código PIN debe tener 6 dígitos.',
        ]);

        try {
            $resultado = $qrService->validarPinYRegistrar(
                $request->pin,
                session('usuario_id')
            );

            return response()->json([
                'success' => true,
                'message' => $resultado['mensaje'],
                'data'    => $resultado,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
