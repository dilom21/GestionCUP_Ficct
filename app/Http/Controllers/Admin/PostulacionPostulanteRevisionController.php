<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GestionCup;
use App\Models\Grupo;
use App\Models\InscripcionCup;
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
    public function verificarPermiso(string $permiso): void
    {
        $permisos = session('usuario_permisos', []);
        if (!in_array($permiso, $permisos, true)) {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }
    }

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
        $this->verificarPermiso('postulaciones_postulantes.escribir');
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
        $this->verificarPermiso('postulaciones_postulantes.escribir');
        $postulacion = Postulacion::with('postulante')->findOrFail($id);

        $request->validate([
            'estado_postulacion' => 'required|in:Observado,Rechazado,Pago,Aprobado',
            'observacion_general' => 'nullable|string|max:1000',
        ]);

        $nuevoEstado = $request->estado_postulacion;
        $estadoActual = $postulacion->estado_postulacion;

        // Validar transiciones de estado
        $estadosFinales = ['Aprobado'];
        if (in_array($estadoActual, $estadosFinales)) {
            return back()->with('error', "La postulación ya está {$estadoActual}. No se puede cambiar el estado.")->withInput();
        }
        if ($nuevoEstado === 'Aprobado' && $estadoActual !== 'Pago') {
            return back()->with('error', 'Solo se puede aprobar una postulación que esté en estado "Pago".')->withInput();
        }

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
        $postulacion->refresh();

        if ($nuevoEstado === 'Aprobado') {
            try {
                // Obtener la gestión CUP activa o la más reciente
                $gestion = GestionCup::orderBy('id', 'desc')->first();

                if (!$gestion) {
                    Log::warning('No se encontró ninguna gestión CUP al aprobar postulación', [
                        'id_postulacion' => $postulacion->id,
                    ]);
                    return back()->with('error', 'No hay una gestión CUP activa. No se pudo asignar al grupo.');
                }

                // Verificar si ya está inscrito
                $yaInscrito = InscripcionCup::where('id_postulacion', $postulacion->id)->exists();
                if ($yaInscrito) {
                    return back()->with('success', 'Postulación aprobada. El postulante ya estaba inscrito en un grupo.');
                }

                // Obtener el turno del postulante
                $turno = $postulacion->turno;
                if (empty($turno)) {
                    Log::warning('Postulación aprobada sin turno asignado', [
                        'id_postulacion' => $postulacion->id,
                    ]);
                    return back()->with('error', 'El postulante no tiene un turno asignado. No se pudo asignar al grupo.');
                }

                // Buscar grupos disponibles según el turno
                $grupoAsignado = Grupo::where('turno', $turno)
                    ->where('estado', 'Activo')
                    ->orderBy('sigla')
                    ->get()
                    ->first(function ($grupo) {
                        $inscritos = InscripcionCup::where('id_grupo', $grupo->id)->count();
                        return $inscritos < ($grupo->cupo_maximo ?: 80);
                    });

                // Si no hay grupo con cupo, crear uno nuevo
                if (!$grupoAsignado) {
                    $prefijo = ['Mañana' => 'M', 'Tarde' => 'T', 'Noche' => 'N'][$turno] ?? 'X';
                    $numExistentes = Grupo::where('turno', $turno)->count();
                    $letra = chr(65 + ($numExistentes % 26));
                    $sigla = $prefijo . $letra;

                    $grupoAsignado = Grupo::create([
                        'id_gestion_cup' => $gestion->id,
                        'sigla'          => $sigla,
                        'cupo_maximo'    => 80,
                        'turno'          => $turno,
                        'modalidad'      => 'Presencial',
                        'estado'         => 'Activo',
                    ]);
                }

                // Insertar en inscripcion_cup
                InscripcionCup::create([
                    'id_postulacion'    => $postulacion->id,
                    'id_grupo'          => $grupoAsignado->id,
                    'id_gestion_cup'    => $gestion->id,
                    'fecha_inscripcion' => now(),
                    'estado'            => 'Inscrito',
                ]);

                BitacoraService::registrar(
                    "Postulante aprobado y asignado al grupo {$grupoAsignado->sigla} (turno {$turno})",
                    session('usuario_id'),
                    'inscripcion_cup'
                );

                Log::info('Postulante asignado a grupo CUP exitosamente', [
                    'id_postulacion' => $postulacion->id,
                    'grupo' => $grupoAsignado->sigla,
                    'turno' => $turno,
                ]);

            } catch (\Throwable $e) {
                Log::error('Error al asignar postulante a grupo CUP', [
                    'id_postulacion' => $postulacion->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return back()->with('error', 'Error al asignar grupo: ' . $e->getMessage());
            }
        }

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
                    <h1>Postulación Verificada — Pendiente de Pago</h1>
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
                    <p>Tu postulación ha sido <strong>aprobada</strong> y tu inscripción al <strong>Curso Preuniversitario FICCT</strong> está completa.</p>
                    <p>Tu grupo asignado es el <strong>" . e($postulacion->inscripcionCup?->grupo?->sigla ?? 'pendiente de asignación') . "</strong>.</p>
                    <p>Próximos pasos:</p>
                    <ul>
                        <li>Revisa tu horario de clases en el sistema.</li>
                        <li>Asiste puntualmente a tus clases.</li>
                        <li>Ante cualquier duda, contacta a la administración.</li>
                    </ul>
                    <p style='text-align:center;margin:30px 0;'>
                        <a href='" . url('/login') . "' style='display:inline-block;padding:12px 24px;background:#1E62A0;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>Ingresar a la plataforma</a>
                    </p>
                ",
                default => '',
            };

            $mensaje .= '<hr><p style="color:#666;font-size:12px;">Curso Preuniversitario FICCT — Facultad de Ciencias de la Computación y Telecomunicaciones</p>';

            if ($correoDestino) {
                Log::info('Intentando enviar correo de estado', [
                    'estado'          => $nuevoEstado,
                    'destino_original'=> $correoDestino,
                    'id_postulacion'  => $postulacion->id,
                ]);
                $resultado = $resendService->enviar($correoDestino, $asunto, $mensaje);
                Log::info('Resultado envio Resend', [
                    'exito'           => $resultado,
                    'id_postulacion'  => $postulacion->id,
                ]);
            } else {
                Log::warning('No se pudo enviar correo: destinatario vacio', [
                    'id_postulacion'   => $postulacion->id,
                    'tiene_postulante' => $postulacion->postulante ? 'si' : 'no',
                ]);
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
