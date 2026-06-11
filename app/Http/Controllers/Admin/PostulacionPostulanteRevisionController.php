<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Postulacion;
use App\Models\PostulacionRequisito;
use App\Services\BitacoraService;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostulacionPostulanteRevisionController extends Controller
{
    public function index(Request $request)
    {
        $query = Postulacion::with(['postulante', 'carrera1', 'carrera2', 'revisor'])
            ->orderBy('fecha_postulacion', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado_postulacion', $request->estado);
        }

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('nro_formulario', 'ilike', "%{$busqueda}%");
            });
        }

        $postulaciones = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/PostulacionesPostulantes/Index', [
            'postulaciones' => $postulaciones,
            'filtros' => [
                'estado' => $request->estado ?? '',
                'busqueda' => $request->busqueda ?? '',
            ],
        ]);
    }

    public function show($id)
    {
        $postulacion = Postulacion::with([
            'postulante',
            'carrera1',
            'carrera2',
            'documentos',
            'requisitos.requisito',
            'revisor',
        ])->findOrFail($id);

        return Inertia::render('Admin/PostulacionesPostulantes/Show', [
            'postulacion' => $postulacion,
        ]);
    }

    public function guardarRevision(Request $request, $id)
    {
        $postulacion = Postulacion::findOrFail($id);

        $request->validate([
            'checks'               => 'required|array',
            'checks.*.estado'      => 'required|in:Cumple,No cumple,Observado,Pendiente',
            'checks.*.observacion' => 'nullable|string|max:500',
        ]);

        foreach ($request->checks as $idRequisito => $checkData) {
            DB::table('postulacion_requisito')
                ->where('id_postulacion', $id)
                ->where('id_requisito', $idRequisito)
                ->update([
                    'estado_requisito' => $checkData['estado'],
                    'observacion'     => $checkData['observacion'] ?? null,
                    'fecha_revision'  => now(),
                ]);
        }

        $postulacion->update([
            'id_usuario_revisor' => session('usuario_id'),
        ]);

        BitacoraService::registrar(
            "Revisión de requisitos guardada - Postulación #{$id}",
            session('usuario_id'),
            'postulacion_requisito'
        );

        return back()->with('success', 'Revisión guardada correctamente.');
    }

    public function cambiarEstado(Request $request, $id)
    {
        $postulacion = Postulacion::findOrFail($id);

        $request->validate([
            'estado_postulacion' => 'required|in:Observado,Rechazado,Pago,Aprobado',
            'observacion_general' => 'nullable|string|max:1000',
        ]);

        $nuevoEstado = $request->estado_postulacion;
        $nombrePostulante = $postulacion->postulante ? 
            ($postulacion->postulante->nombre . ' ' . $postulacion->postulante->apellidos) : 
            'Postulante #' . $postulacion->id_postulante;

        $dataUpdate = [
            'estado_postulacion'  => $nuevoEstado,
            'observacion_general' => $request->observacion_general,
            'fecha_revision'      => now(),
            'id_usuario_revisor'  => session('usuario_id'),
        ];

        if ($nuevoEstado === 'Pago') {
            $dataUpdate['token_pago'] = bin2hex(random_bytes(32));
        }

        $postulacion->update($dataUpdate);

        $correoDestino = $postulacion->postulante?->correo ?? '';

        try {
            $resendService = new ResendEmailService();

            $asunto = match ($nuevoEstado) {
                'Observado' => 'Postulación observada - CUP FICCT',
                'Rechazado' => 'Postulación rechazada - CUP FICCT',
                'Pago'      => 'Postulación apta para pago - CUP FICCT',
                'Aprobado'  => 'Postulación aprobada - CUP FICCT',
                default     => 'Actualización de postulación - CUP FICCT',
            };

            $urlPago = $nuevoEstado === 'Pago' && $postulacion->token_pago
                ? url('/preinscripcion?id=' . $postulacion->id . '&token=' . $postulacion->token_pago)
                : '';

            $mensaje = match ($nuevoEstado) {
                'Observado' => "
                    <h1>Postulación Observada</h1>
                    <p>Hola, <strong>{$nombrePostulante}</strong>.</p>
                    <p>Tu postulación ha sido <strong>observada</strong>.</p>
                    <p><strong>Motivo:</strong> " . e($request->observacion_general ?? 'Sin especificar') . "</p>
                    <p>Por favor, revisa los detalles y corrige lo solicitado.</p>
                ",
                'Rechazado' => "
                    <h1>Postulación Rechazada</h1>
                    <p>Hola, <strong>{$nombrePostulante}</strong>.</p>
                    <p>Tu postulación ha sido <strong>rechazada</strong>.</p>
                    <p><strong>Motivo:</strong> " . e($request->observacion_general ?? 'Sin especificar') . "</p>
                ",
                'Pago' => "
                    <h1>Postulación Aprobada — Pendiente de Pago</h1>
                    <p>Hola, <strong>{$nombrePostulante}</strong>.</p>
                    <p>Tus documentos han sido <strong>verificados correctamente</strong>.</p>
                    <p>Para completar tu inscripción al <strong>Curso Preuniversitario FICCT</strong>, debes realizar el pago correspondiente.</p>
                    <p style='text-align:center;margin:30px 0;'>
                        <a href='{$urlPago}' style='display:inline-block;padding:14px 32px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;'>Ir al pago — 350 Bs</a>
                    </p>
                    <p style='color:#666;font-size:13px;'>Este enlace es de un solo uso. Una vez realizado el pago, recibirás tus credenciales de acceso al sistema.</p>
                ",
                'Aprobado' => "
                    <h1>Postulación Aprobada</h1>
                    <p>Hola, <strong>{$nombrePostulante}</strong>.</p>
                    <p>Tu postulación ha sido <strong>aprobada</strong>.</p>
                ",
                default => '',
            };

            $mensaje .= '<hr><p style="color:#666;font-size:12px;">Curso Preuniversitario FICCT — Facultad de Ciencias de la Computación y Telecomunicaciones</p>';

            if ($correoDestino) {
                $resendService->enviar($correoDestino, $asunto, $mensaje);
            }
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar el correo.', [
                'error' => $e->getMessage(),
                'id_postulacion' => $postulacion->id,
            ]);
        }

        BitacoraService::registrar(
            "Postulación de postulante {$nuevoEstado} - {$nombrePostulante}"
                . ($nuevoEstado === 'Pago' ? ' - Token de pago generado' : ''),
            session('usuario_id'),
            'postulacion'
        );

        return back()->with('success', "Postulación marcada como {$nuevoEstado}.");
    }
}
