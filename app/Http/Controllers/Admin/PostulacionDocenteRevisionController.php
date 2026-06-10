<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use App\Models\PostulacionDocente;
use App\Models\PostulacionDocenteRequisito;
use App\Models\Rol;
use App\Models\User;
use App\Services\BitacoraService;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostulacionDocenteRevisionController extends Controller
{
    public function index(Request $request)
    {
        $query = PostulacionDocente::with(['documentos', 'requisitos', 'revisor', 'materias'])
            ->orderBy('fecha_postulacion', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado_postulacion', $request->estado);
        }

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('nombre', 'ilike', "%{$busqueda}%")
                  ->orWhere('apellido', 'ilike', "%{$busqueda}%")
                  ->orWhere('correo', 'ilike', "%{$busqueda}%")
                  ->orWhere('ci', 'ilike', "%{$busqueda}%");
            });
        }

        $postulaciones = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/PostulacionesDocentes/Index', [
            'postulaciones' => $postulaciones,
            'filtros' => [
                'estado' => $request->estado ?? '',
                'busqueda' => $request->busqueda ?? '',
            ],
        ]);
    }

    public function show($id)
    {
        $postulacion = PostulacionDocente::with([
            'documentos',
            'requisitos.requisito',
            'revisor',
            'materias',
        ])->findOrFail($id);

        return Inertia::render('Admin/PostulacionesDocentes/Show', [
            'postulacion' => $postulacion,
        ]);
    }

    public function guardarRevision(Request $request, $id)
    {
        $postulacion = PostulacionDocente::findOrFail($id);

        $request->validate([
            'checks'               => 'required|array',
            'checks.*.estado'      => 'required|in:Cumple,No cumple,Observado,Pendiente',
            'checks.*.observacion' => 'nullable|string|max:500',
        ]);

        foreach ($request->checks as $idRequisito => $checkData) {
            DB::table('postulacion_docente_requisito')
                ->where('id_postulacion_docente', $id)
                ->where('id_requisito', $idRequisito)
                ->update([
                    'estado' => $checkData['estado'],
                    'observacion' => $checkData['observacion'] ?? null,
                    'fecha_revision' => now(),
                ]);
        }

        $postulacion->update([
            'id_usuario_revisor' => session('usuario_id'),
        ]);

        BitacoraService::registrar(
            "Revisión de requisitos guardada - Postulación docente #{$id}",
            session('usuario_id'),
            'postulacion_docente_requisito'
        );

        return back()->with('success', 'Revisión guardada correctamente.');
    }

    public function cambiarEstado(Request $request, $id)
    {
        $postulacion = PostulacionDocente::findOrFail($id);

        $request->validate([
            'estado_postulacion' => 'required|in:Observado,Rechazado,Aprobado',
            'observacion_general' => 'nullable|string|max:1000',
            'correo_acceso' => 'required_if:estado_postulacion,Aprobado|email|max:255',
            'password_acceso' => 'required_if:estado_postulacion,Aprobado|string|min:6|max:255',
        ], [
            'correo_acceso.required_if' => 'El correo de acceso es obligatorio para aprobar.',
            'password_acceso.required_if' => 'La contraseña de acceso es obligatoria para aprobar.',
        ]);

        $nuevoEstado = $request->estado_postulacion;
        $nombrePostulante = $postulacion->nombre . ' ' . $postulacion->apellido;

        // Si es aprobado, crear automáticamente el usuario docente
        if ($nuevoEstado === 'Aprobado') {
            $existe = User::where('correo', $request->correo_acceso)->exists();

            if ($existe) {
                return back()->withErrors([
                    'correo_acceso' => 'Ya existe un usuario con ese correo en el sistema.',
                ])->withInput();
            }

            $usuarioCreado = User::create([
                'correo'            => $request->correo_acceso,
                'password'          => Hash::make($request->password_acceso),
                'estado'            => 'Activo',
                'nombre'            => $postulacion->nombre,
                'apellidos'         => $postulacion->apellido,
                'telefono'          => $postulacion->telefono,
                'id_rol'            => 4,
                'intentos_fallidos' => 0,
                'bloqueado_hasta'   => null,
            ]);

            // Guardar referencia al usuario creado en la postulación
            $postulacion->update(['id_usuario_creado' => $usuarioCreado->id]);

            BitacoraService::registrar(
                "Postulación docente aprobada - Usuario {$request->correo_acceso} creado para {$nombrePostulante}",
                session('usuario_id'),
                'usuario'
            );
        }

        $postulacion->update([
            'estado_postulacion'  => $nuevoEstado,
            'observacion_general' => $request->observacion_general,
            'fecha_revision'      => now(),
            'id_usuario_revisor'  => session('usuario_id'),
        ]);

        // Bitácora para cambios no-aprobados
        if ($nuevoEstado !== 'Aprobado') {
            BitacoraService::registrar(
                "Postulación docente marcada como {$nuevoEstado} - {$nombrePostulante}",
                session('usuario_id'),
                'postulacion_docente'
            );
        }

        // Enviar correo según estado
        try {
            $resendService = new ResendEmailService();
            $nombreCompleto = e($postulacion->nombre . ' ' . $postulacion->apellido);

            $asunto = match ($nuevoEstado) {
                'Observado' => 'Postulación docente observada - CUP FICCT',
                'Rechazado' => 'Postulación docente rechazada - CUP FICCT',
                'Aprobado'  => 'Postulación docente aprobada - CUP FICCT',
                default     => 'Actualización de postulación docente - CUP FICCT',
            };

            $mensaje = match ($nuevoEstado) {
                'Observado' => "
                    <h1>Postulación Observada</h1>
                    <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
                    <p>Tu postulación docente ha sido <strong>observada</strong>.</p>
                    <p><strong>Motivo:</strong> " . e($request->observacion_general ?? 'Sin especificar') . "</p>
                    <p>Por favor, revisa los detalles y corrige lo solicitado.</p>
                ",
                'Rechazado' => "
                    <h1>Postulación Rechazada</h1>
                    <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
                    <p>Tu postulación docente ha sido <strong>rechazada</strong>.</p>
                    <p><strong>Motivo:</strong> " . e($request->observacion_general ?? 'Sin especificar') . "</p>
                ",
                'Aprobado' => "
                    <h1>Postulación Aprobada</h1>
                    <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
                    <p>Tu postulación docente ha sido <strong>aprobada</strong>.</p>
                    <p><strong>Tus credenciales de acceso son:</strong></p>
                    <p><strong>Correo:</strong> " . e($request->correo_acceso) . "</p>
                    <p><strong>Contraseña:</strong> " . e($request->password_acceso) . "</p>
                    <p><a href='" . url('/login') . "' style='display:inline-block;padding:12px 24px;background:#1E62A0;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>Ingresar a la plataforma</a></p>
                    <p style='color:#888;font-size:13px;'>Recomendación: después de ingresar, cambia tu contraseña en la sección de perfil.</p>
                ",
                default => '',
            };

            $mensaje .= '<hr><p style="color: #666; font-size: 12px;">Curso Preuniversitario FICCT - Facultad de Ciencias de la Computación y Telecomunicaciones</p>';

            $resendService->enviar(
                $postulacion->correo,
                $asunto,
                $mensaje
            );
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar el correo de cambio de estado.', [
                'error' => $e->getMessage(),
                'id_postulacion' => $postulacion->id,
                'estado' => $nuevoEstado,
            ]);
        }

        return back()->with('success', "Postulación marcada como {$nuevoEstado}. Se notificó al postulante.");
    }
}