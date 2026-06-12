<?php

namespace App\Services;

use App\Models\AsistenciaEstudiante;
use App\Models\AsistenciaDocente;
use App\Models\AsignacionAcademica;
use App\Models\Docente;
use App\Models\Postulante;
use App\Models\InscripcionCup;
use App\Models\Horario;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class QrTokenService
{
    const TOKEN_TTL_SECONDS = 15;
    const PIN_TTL_SECONDS = 60;
    const TOLERANCIA_MINUTOS_ENTRADA = 15;
    const TOLERANCIA_MINUTOS_SALIDA = 15;

    /**
     * Genera un token temporal para QR (15 segundos de validez).
     */
    public function generarToken(int $asignacionAcademicaId, int $docenteId): array
    {
        $asignacion = AsignacionAcademica::with('grupo', 'materia')
            ->findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado: esta asignación no le pertenece.');
        }

        $token = Str::random(64);
        $expiraEn = now()->addSeconds(self::TOKEN_TTL_SECONDS);

        // Almacenar en cache con expiración
        Cache::put("qr_token:{$token}", [
            'id_asignacion_academica' => $asignacionAcademicaId,
            'id_docente'              => $docenteId,
            'created_at'              => now()->toDateTimeString(),
        ], self::TOKEN_TTL_SECONDS);

        return [
            'token'     => $token,
            'expira_en' => $expiraEn->toIso8601String(),
            'ttl'       => self::TOKEN_TTL_SECONDS,
            'materia'   => $asignacion->materia?->nombre,
            'grupo'     => $asignacion->grupo?->sigla,
        ];
    }

    /**
     * Valida un token QR y registra la asistencia del estudiante.
     */
    public function validarTokenYRegistrar(string $token, int $idUsuario): array
    {
        $cacheData = Cache::get("qr_token:{$token}");

        if (!$cacheData) {
            throw new \RuntimeException('Token inválido o expirado. El código QR solo dura 15 segundos.');
        }

        $asignacionId = $cacheData['id_asignacion_academica'];

        // Buscar inscripción del postulante
        $usuario = \App\Models\User::findOrFail($idUsuario);
        $postulante = \App\Models\Postulante::where('id_usuario', $idUsuario)->first();

        if (!$postulante) {
            throw new \RuntimeException('No se encontró un perfil de postulante para este usuario.');
        }

        $inscripcion = InscripcionCup::whereHas('postulacion', function ($q) use ($postulante) {
                $q->where('id_postulante', $postulante->id_postulante);
            })
            ->where('id_grupo', function ($q) use ($asignacionId) {
                $q->select('id_grupo')
                  ->from('asignacion_academica')
                  ->where('id', $asignacionId);
            })
            ->first();

        if (!$inscripcion) {
            throw new \RuntimeException('No está inscrito en este grupo.');
        }

        $hoy = now()->toDateString();
        $hora = now()->toTimeString();

        // Verificar que no haya duplicado
        $existe = AsistenciaEstudiante::where('id_inscripcion_cup', $inscripcion->id)
            ->where('id_asignacion_academica', $asignacionId)
            ->where('fecha_clase', $hoy)
            ->exists();

        if ($existe) {
            throw new \RuntimeException('Ya registró su asistencia para esta clase hoy.');
        }

        // Eliminar token usado
        Cache::forget("qr_token:{$token}");

        $asistencia = AsistenciaEstudiante::create([
            'id_inscripcion_cup'     => $inscripcion->id,
            'id_asignacion_academica' => $asignacionId,
            'fecha_clase'            => $hoy,
            'hora_registro'          => $hora,
            'token_usado'            => $token,
            'estado_asistencia'      => 'Presente',
        ]);

        return [
            'id'       => $asistencia->id,
            'mensaje'  => 'Asistencia registrada exitosamente.',
            'fecha'    => $hoy,
            'hora'     => $hora,
        ];
    }

    /**
     * Registra la entrada del docente (con tolerancia de horario).
     */
    public function registrarEntradaDocente(int $asignacionAcademicaId, int $docenteId): array
    {
        $asignacion = AsignacionAcademica::findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado: esta asignación no le pertenece.');
        }

        $hoy = now()->toDateString();
        $horaActual = now()->toTimeString();
        $diasEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $diasES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        $diaSemana = str_replace($diasEN, $diasES, now()->format('l'));

        $horario = Horario::where('id_asignacion_academica', $asignacionAcademicaId)
            ->where('dia_semana', $diaSemana)
            ->first();

        if (!$horario) {
            throw new \RuntimeException("No tiene clases programadas para hoy ({$diaSemana}).");
        }

        // Validar tolerancia de entrada (±15 min)
        $inicioClase = Carbon::parse($horario->horario_inicio);
        $horaActualCarbon = Carbon::parse($horaActual);
        $diferencia = $horaActualCarbon->diffInMinutes($inicioClase, false);

        if ($diferencia < -self::TOLERANCIA_MINUTOS_ENTRADA) {
            throw new \RuntimeException('Demasiado temprano. Puede registrar entrada hasta 15 minutos antes del inicio de clase.');
        }

        if ($diferencia > self::TOLERANCIA_MINUTOS_ENTRADA + 60) {
            throw new \RuntimeException('Ya pasó más de 1 hora del inicio de clase. No puede registrar entrada.');
        }

        // Verificar si ya registró entrada
        $existente = AsistenciaDocente::where('id_asignacion_academica', $asignacionAcademicaId)
            ->where('fecha_clase', $hoy)
            ->first();

        if ($existente && $existente->hora_entrada) {
            throw new \RuntimeException('Ya registró su entrada para esta clase.');
        }

        if ($existente) {
            $existente->update(['hora_entrada' => $horaActual]);
            $asistencia = $existente;
        } else {
            $asistencia = AsistenciaDocente::create([
                'id_asignacion_academica' => $asignacionAcademicaId,
                'fecha_clase'             => $hoy,
                'hora_entrada'            => $horaActual,
                'estado_asistencia'       => 'Presente',
                'tipo_registro'           => 'Manual',
            ]);
        }

        return [
            'id'      => $asistencia->id,
            'mensaje' => 'Entrada registrada exitosamente.',
            'hora'    => $horaActual,
        ];
    }

    /**
     * Registra la salida del docente.
     */
    public function registrarSalidaDocente(int $asignacionAcademicaId, int $docenteId): array
    {
        $asignacion = AsignacionAcademica::findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado.');
        }

        $hoy = now()->toDateString();
        $horaActual = now()->toTimeString();

        $asistencia = AsistenciaDocente::where('id_asignacion_academica', $asignacionAcademicaId)
            ->where('fecha_clase', $hoy)
            ->first();

        if (!$asistencia || !$asistencia->hora_entrada) {
            throw new \RuntimeException('Debe registrar la entrada antes de registrar la salida.');
        }

        if ($asistencia->hora_salida) {
            throw new \RuntimeException('Ya registró su salida para esta clase.');
        }

        $horaEntrada = Carbon::parse($asistencia->hora_entrada);
        $horaSalidaCarbon = Carbon::parse($horaActual);

        if ($horaSalidaCarbon->diffInMinutes($horaEntrada, false) < 0) {
            throw new \RuntimeException('La hora de salida no puede ser anterior a la hora de entrada.');
        }

        $asistencia->update([
            'hora_salida' => $horaActual,
        ]);

        return [
            'id'      => $asistencia->id,
            'mensaje' => 'Salida registrada exitosamente.',
            'hora'    => $horaActual,
        ];
    }

    // ─── Modo Código PIN ───────────────────────────────────────────

    public function generarPin(int $asignacionAcademicaId, int $docenteId): array
    {
        $asignacion = AsignacionAcademica::with('grupo', 'materia')
            ->findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado: esta asignación no le pertenece.');
        }

        $pin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiraEn = now()->addSeconds(self::PIN_TTL_SECONDS);

        Cache::put("pin_token:{$pin}", [
            'id_asignacion_academica' => $asignacionAcademicaId,
            'id_docente'              => $docenteId,
            'created_at'              => now()->toDateTimeString(),
        ], self::PIN_TTL_SECONDS);

        return [
            'pin'       => $pin,
            'expira_en' => $expiraEn->toIso8601String(),
            'ttl'       => self::PIN_TTL_SECONDS,
            'materia'   => $asignacion->materia?->nombre,
            'grupo'     => $asignacion->grupo?->sigla,
        ];
    }

    public function validarPinYRegistrar(string $pin, int $idUsuario): array
    {
        $cacheData = Cache::get("pin_token:{$pin}");

        if (!$cacheData) {
            throw new \RuntimeException('Código inválido o expirado. Solicite un nuevo código al docente.');
        }

        $asignacionId = $cacheData['id_asignacion_academica'];
        $hoy = now()->toDateString();
        $hora = now()->toTimeString();

        $postulante = Postulante::where('id_usuario', $idUsuario)->first();
        if (!$postulante) {
            throw new \RuntimeException('No se encontró un perfil de postulante para este usuario.');
        }

        $inscripcion = InscripcionCup::whereHas('postulacion', function ($q) use ($postulante) {
                $q->where('id_postulante', $postulante->id_postulante);
            })
            ->where('id_grupo', function ($q) use ($asignacionId) {
                $q->select('id_grupo')
                  ->from('asignacion_academica')
                  ->where('id', $asignacionId);
            })
            ->first();

        if (!$inscripcion) {
            throw new \RuntimeException('No está inscrito en este grupo.');
        }

        $existe = AsistenciaEstudiante::where('id_inscripcion_cup', $inscripcion->id)
            ->where('id_asignacion_academica', $asignacionId)
            ->where('fecha_clase', $hoy)
            ->exists();

        if ($existe) {
            throw new \RuntimeException('Ya registró su asistencia para esta clase hoy.');
        }

        Cache::forget("pin_token:{$pin}");

        $asistencia = AsistenciaEstudiante::create([
            'id_inscripcion_cup'      => $inscripcion->id,
            'id_asignacion_academica'  => $asignacionId,
            'fecha_clase'             => $hoy,
            'hora_registro'           => $hora,
            'estado_asistencia'       => 'Presente',
            'tipo_registro'           => 'Codigo',
        ]);

        return [
            'id'      => $asistencia->id,
            'mensaje' => 'Asistencia registrada exitosamente con código PIN.',
            'fecha'   => $hoy,
            'hora'    => $hora,
        ];
    }

    // ─── Modo Lista (Docente llama asistencia) ─────────────────────

    public function obtenerEstudiantesPorAsignacion(int $asignacionAcademicaId, int $docenteId): array
    {
        $asignacion = AsignacionAcademica::with('grupo')->findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado: esta asignación no le pertenece.');
        }

        $hoy = now()->toDateString();

        $inscripciones = InscripcionCup::with([
            'postulacion.postulante.usuario',
        ])
        ->where('id_grupo', $asignacion->id_grupo)
        ->where('estado', 'Activo')
        ->get();

        $asistenciasHoy = AsistenciaEstudiante::where('id_asignacion_academica', $asignacionAcademicaId)
            ->where('fecha_clase', $hoy)
            ->get()
            ->keyBy('id_inscripcion_cup');

        return $inscripciones->map(function ($ins) use ($asistenciasHoy, $asignacionAcademicaId) {
            $postulante = $ins->postulacion?->postulante;
            $usuario = $postulante?->usuario;
            $asis = $asistenciasHoy->get($ins->id);

            return [
                'id_inscripcion'   => $ins->id,
                'id_postulante'    => $postulante?->id_postulante,
                'nombre_completo'  => $usuario ? ($usuario->nombre . ' ' . $usuario->apellidos) : '—',
                'ci'               => $postulante?->ci ?? '—',
                'asistencia_id'    => $asis?->id,
                'estado_asistencia' => $asis?->estado_asistencia ?? 'Sin registrar',
                'hora_registro'    => $asis?->hora_registro,
            ];
        })->toArray();
    }

    public function registrarDesdeLista(
        int $asignacionAcademicaId,
        int $idInscripcionCup,
        string $estado,
        int $docenteId
    ): array {
        $asignacion = AsignacionAcademica::findOrFail($asignacionAcademicaId);

        if ($asignacion->id_docente !== $docenteId) {
            throw new \RuntimeException('No autorizado: esta asignación no le pertenece.');
        }

        if (!in_array($estado, ['Presente', 'Ausente', 'Tardanza'])) {
            throw new \RuntimeException('Estado de asistencia no válido.');
        }

        $inscripcion = InscripcionCup::findOrFail($idInscripcionCup);

        if ($inscripcion->id_grupo !== $asignacion->id_grupo) {
            throw new \RuntimeException('El estudiante no pertenece al grupo de esta asignación.');
        }

        $hoy = now()->toDateString();
        $hora = now()->toTimeString();

        $existe = AsistenciaEstudiante::where('id_inscripcion_cup', $idInscripcionCup)
            ->where('id_asignacion_academica', $asignacionAcademicaId)
            ->where('fecha_clase', $hoy)
            ->first();

        if ($existe) {
            $existe->update([
                'estado_asistencia' => $estado,
                'hora_registro'     => $hora,
                'tipo_registro'     => 'Lista',
                'registrado_por'    => $docenteId,
            ]);

            return [
                'id'      => $existe->id,
                'mensaje' => "Asistencia actualizada a: {$estado}",
                'accion'  => 'actualizado',
            ];
        }

        $asistencia = AsistenciaEstudiante::create([
            'id_inscripcion_cup'      => $idInscripcionCup,
            'id_asignacion_academica'  => $asignacionAcademicaId,
            'fecha_clase'             => $hoy,
            'hora_registro'           => $hora,
            'estado_asistencia'       => $estado,
            'tipo_registro'           => 'Lista',
            'registrado_por'          => $docenteId,
        ]);

        return [
            'id'      => $asistencia->id,
            'mensaje' => "Asistencia registrada como: {$estado}",
            'accion'  => 'creado',
        ];
    }
}
