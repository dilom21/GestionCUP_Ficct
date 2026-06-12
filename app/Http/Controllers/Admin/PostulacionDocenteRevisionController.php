<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use App\Models\PostulacionDocente;
use App\Models\PostulacionDocenteRequisito;
use App\Models\Rol;
use App\Models\User;
use App\Services\AcademicValidationService;
use App\Services\BitacoraService;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

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

    public function verificarPermiso(string $permiso): void
    {
        $permisos = session('usuario_permisos', []);
        if (!in_array($permiso, $permisos, true)) {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }
    }

    public function guardarRevision(Request $request, $id)
    {
        $this->verificarPermiso('postulaciones_docentes.escribir');
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

    public function cambiarEstado(Request $request, $id, AcademicValidationService $validationService)
    {
        $this->verificarPermiso('postulaciones_docentes.escribir');
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
        $estadoActual = $postulacion->estado_postulacion;

        $estadosFinales = ['Aprobado'];
        if (in_array($estadoActual, $estadosFinales)) {
            return back()->with('error', "La postulación ya está {$estadoActual}. No se puede cambiar el estado.")->withInput();
        }
        if ($nuevoEstado === 'Aprobado' && $estadoActual === 'Aprobado') {
            return back()->with('error', 'La postulación ya está aprobada.')->withInput();
        }

        $nombrePostulante = $postulacion->nombre . ' ' . $postulacion->apellido;

        // Si es aprobado, crear automáticamente el usuario docente
        if ($nuevoEstado === 'Aprobado') {
            $existe = User::where('correo', $request->correo_acceso)->exists();

            if ($existe) {
                return back()->withErrors([
                    'correo_acceso' => 'Ya existe un usuario con ese correo en el sistema.',
                ])->withInput();
            }

            DB::beginTransaction();
            try {
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

                // Crear perfil Docente vinculado al usuario
                $docente = Docente::create([
                    'id_usuario'            => $usuarioCreado->id,
                    'ci'                    => $postulacion->ci,
                    'profesion'             => $postulacion->profesion ?? '',
                    'grado_academico'       => $postulacion->grado_academico ?? '',
                    'experiencia_anios'     => $postulacion->experiencia_anios ?? 0,
                    'maximo_grupos'         => 4,
                    'id_postulacion_docente' => $postulacion->id,
                ]);

                // Auto-asignar materias seleccionadas en la postulación
                $materiasIds = $postulacion->materias()->pluck('materia.id_materia')->toArray();
                if (!empty($materiasIds)) {
                    $docenteMateriaData = [];
                    foreach ($materiasIds as $idMateria) {
                        $docenteMateriaData[] = [
                            'id_docente' => $docente->id,
                            'id_materia' => $idMateria,
                            'estado'     => 'Activo',
                        ];
                    }
                    DB::table('docente_materia')->insert($docenteMateriaData);

                    // Auto-crear asignación académica y horario con validación de cruces
                    $gestionActiva = DB::table('gestion_cup')->first();
                    $grupos = DB::table('grupo')->where('estado', 'Activo')->get();
                    $aulas = DB::table('aula')->where('estado', 'Activo')->orderBy('capacidad_maxima', 'desc')->get();

                    if ($gestionActiva && $grupos->isNotEmpty() && $aulas->isNotEmpty()) {
                        $disponibilidad = strtolower($postulacion->disponibilidad_horaria ?? 'mañana');
                        $turnosMap = [
                            'mañana' => ['turno' => 'Mañana', 'inicio' => '07:00', 'fin' => '09:15'],
                            'tarde'  => ['turno' => 'Tarde',  'inicio' => '14:00', 'fin' => '16:15'],
                            'noche'  => ['turno' => 'Noche',  'inicio' => '18:00', 'fin' => '20:15'],
                        ];

                        $turnoSeleccionado = $turnosMap['mañana'];
                        foreach ($turnosMap as $key => $t) {
                            if (str_contains($disponibilidad, $key)) {
                                $turnoSeleccionado = $t;
                                break;
                            }
                        }

                        $grupoCompatible = $grupos->firstWhere('turno', $turnoSeleccionado['turno']);
                        if (!$grupoCompatible) {
                            $grupoCompatible = $grupos->first();
                        }

                        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
                        $asignacionesCreadas = 0;

                        foreach ($materiasIds as $idx => $idMateria) {
                            if ($asignacionesCreadas >= ($docente->maximo_grupos ?? 4)) {
                                break;
                            }

                            try {
                                $validationService->validarLimiteGruposDocente($docente->id, $gestionActiva->id);
                            } catch (\Throwable $e) {
                                break;
                            }

                            $asignacionId = DB::table('asignacion_academica')->insertGetId([
                                'id_materia'      => $idMateria,
                                'id_grupo'        => $grupoCompatible->id,
                                'id_docente'      => $docente->id,
                                'id_gestion_cup'  => $gestionActiva->id,
                                'carga_horaria'   => 80,
                                'estado'          => 'Activo',
                            ]);

                            $horarioCreado = false;
                            $offset = array_search(($diasSemana[$idx % count($diasSemana)]), $diasSemana);
                            $diasRotados = array_merge(
                                array_slice($diasSemana, $offset),
                                array_slice($diasSemana, 0, $offset)
                            );

                            foreach ($diasRotados as $dia) {
                                if ($horarioCreado) {
                                    break;
                                }
                                foreach ($aulas as $aula) {
                                    try {
                                    $validationService->validarHorarioCompleto(
                                        $asignacionId,
                                        $aula->id,
                                        $dia,
                                        $turnoSeleccionado['inicio'],
                                        $turnoSeleccionado['fin']
                                    );
                                    $validationService->validarCargaHoraria(
                                        $asignacionId,
                                        $turnoSeleccionado['inicio'],
                                        $turnoSeleccionado['fin']
                                    );
                                        DB::table('horario')->insert([
                                            'id_asignacion_academica' => $asignacionId,
                                            'id_aula'                 => $aula->id,
                                            'dia_semana'              => $dia,
                                            'horario_inicio'          => $turnoSeleccionado['inicio'],
                                            'horario_fin'             => $turnoSeleccionado['fin'],
                                        ]);
                                        $horarioCreado = true;
                                        $ultimoDiaCreado = $dia;
                                        break;
                                    } catch (HttpException $e) {
                                        continue;
                                    }
                                }
                            }

                            if ($horarioCreado) {
                                $asignacionesCreadas++;
                                Log::info("Horario creado para docente {$docente->id}, materia {$idMateria}, dia {$ultimoDiaCreado}");
                            } else {
                                DB::table('asignacion_academica')->where('id', $asignacionId)->delete();
                                Log::warning("No se pudo asignar horario para materia {$idMateria} al docente {$docente->id}: todas las aulas ocupadas.");
                            }
                        }
                    }
                }

                BitacoraService::registrar(
                    "Postulación docente aprobada - Usuario {$request->correo_acceso} creado para {$nombrePostulante}, perfil docente y materias asignadas",
                    session('usuario_id'),
                    'usuario'
                );

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                return back()->with('error', 'Error al aprobar la postulación: ' . $e->getMessage())->withInput();
            }
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
                    <p>Tu cuenta de acceso ha sido creada con el correo: <strong>" . e($request->correo_acceso) . "</strong></p>
                    <p>La contraseña fue definida por el administrador. Si no la recuerdas, utiliza la opción <strong>\"Olvidé mi contraseña\"</strong> en la pantalla de inicio de sesión para restablecerla.</p>
                    <p><a href='" . url('/login') . "' style='display:inline-block;padding:12px 24px;background:#1E62A0;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>Ingresar a la plataforma</a></p>
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