<?php

namespace App\Services;

use App\Models\Aula;
use App\Models\Horario;
use App\Models\AsignacionAcademica;
use App\Models\Docente;
use App\Models\Grupo;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AcademicValidationService
{
    const VENTANAS_TURNO = [
        'Mañana' => ['07:00', '12:00'],
        'Tarde'  => ['12:00', '18:00'],
        'Noche'  => ['18:00', '22:00'],
    ];

    const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    /**
     * Valida que el aula no tenga otro horario en el mismo día y rango horario.
     */
    public function validarCruceAula(int $aulaId, string $dia, string $horaInicio, string $horaFin, ?int $ignoreId = null): void
    {
        $query = Horario::where('id_aula', $aulaId)
            ->where('dia_semana', $dia)
            ->where('horario_inicio', '<', $horaFin)
            ->where('horario_fin', '>', $horaInicio);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        if ($query->exists()) {
            $conflicto = $query->first();
            $aula = Aula::find($aulaId);
            throw new HttpException(422, "El aula {$aula?->codigo} ya está ocupada el {$dia} de {$conflicto->horario_inicio} a {$conflicto->horario_fin}.");
        }
    }

    /**
     * Valida que el grupo (a través de su asignación académica) no tenga dos materias
     * en el mismo día y rango horario.
     */
    public function validarCruceGrupo(int $asignacionAcademicaId, string $dia, string $horaInicio, string $horaFin, ?int $ignoreId = null): void
    {
        $asignacion = AsignacionAcademica::findOrFail($asignacionAcademicaId);

        $query = Horario::whereHas('asignacionAcademica', function ($q) use ($asignacion) {
                $q->where('id_grupo', $asignacion->id_grupo)
                  ->where('id', '!=', $asignacion->id);
            })
            ->where('dia_semana', $dia)
            ->where('horario_inicio', '<', $horaFin)
            ->where('horario_fin', '>', $horaInicio);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        if ($query->exists()) {
            $conflicto = $query->first();
            $grupo = Grupo::find($asignacion->id_grupo);
            throw new HttpException(422, "El grupo {$grupo?->sigla} ya tiene clase el {$dia} de {$conflicto->horario_inicio} a {$conflicto->horario_fin}.");
        }
    }

    /**
     * Valida que el horario esté dentro de la ventana del turno del grupo.
     */
    public function validarVentanaTurno(string $turno, string $horaInicio, string $horaFin): void
    {
        if (!isset(self::VENTANAS_TURNO[$turno])) {
            throw new HttpException(422, "Turno inválido: {$turno}.");
        }

        [$inicioTurno, $finTurno] = self::VENTANAS_TURNO[$turno];

        if ($horaInicio < $inicioTurno || $horaInicio >= $finTurno) {
            throw new HttpException(422, "La hora de inicio ({$horaInicio}) está fuera de la ventana del turno {$turno} ({$inicioTurno}-{$finTurno}).");
        }

        if ($horaFin <= $inicioTurno || $horaFin > $finTurno) {
            throw new HttpException(422, "La hora de fin ({$horaFin}) está fuera de la ventana del turno {$turno} ({$inicioTurno}-{$finTurno}).");
        }

        if ($horaInicio >= $horaFin) {
            throw new HttpException(422, "La hora de inicio debe ser menor a la hora de fin.");
        }
    }

    /**
     * Valida que la capacidad del aula sea suficiente para el grupo.
     */
    public function validarCapacidadAula(int $aulaId, int $grupoId): void
    {
        $aula = Aula::findOrFail($aulaId);
        $grupo = Grupo::findOrFail($grupoId);

        if ($aula->capacidad_maxima < $grupo->cupo_maximo) {
            throw new HttpException(422, "El aula {$aula->codigo} (capacidad: {$aula->capacidad_maxima}) no tiene suficiente capacidad para el grupo {$grupo->sigla} ({$grupo->cupo_maximo} estudiantes).");
        }
    }

    /**
     * Valida que el día sea válido.
     */
    public function validarDiaSemana(string $dia): void
    {
        if (!in_array($dia, self::DIAS_SEMANA)) {
            throw new HttpException(422, "Día de semana inválido. Debe ser: " . implode(', ', self::DIAS_SEMANA) . ".");
        }
    }

    /**
     * Valida que el docente no exceda el límite de grupos.
     */
    public function validarLimiteGruposDocente(int $docenteId, int $gestionCupId): void
    {
        $docente = Docente::findOrFail($docenteId);
        $maximo = $docente->maximo_grupos ?? 4;

        $count = AsignacionAcademica::where('id_docente', $docenteId)
            ->where('id_gestion_cup', $gestionCupId)
            ->where('estado', 'Activo')
            ->count();

        if ($count >= $maximo) {
            throw new HttpException(422, "El docente ya tiene {$count} grupos asignados (límite: {$maximo}). No puede asignarse a más grupos.");
        }
    }

    /**
     * Valida que los horarios del nuevo grupo no colisionen con horarios
     * de grupos que el docente ya tiene asignados.
     */
    public function validarCruceHorarioDocente(int $docenteId, string $dia, string $horaInicio, string $horaFin, ?int $ignoreHorarioId = null): void
    {
        $query = Horario::whereHas('asignacionAcademica', function ($q) use ($docenteId) {
                $q->where('id_docente', $docenteId);
            })
            ->where('dia_semana', $dia)
            ->where('horario_inicio', '<', $horaFin)
            ->where('horario_fin', '>', $horaInicio);

        if ($ignoreHorarioId) {
            $query->where('id', '!=', $ignoreHorarioId);
        }

        if ($query->exists()) {
            $conflicto = $query->first();
            throw new HttpException(422, "El docente ya tiene un horario asignado el {$dia} de {$conflicto->horario_inicio} a {$conflicto->horario_fin} que colisiona con el nuevo horario.");
        }
    }

    /**
     * Validación completa para crear/actualizar un horario.
     */
    public function validarHorarioCompleto(
        int $asignacionAcademicaId,
        int $aulaId,
        string $dia,
        string $horaInicio,
        string $horaFin,
        ?int $ignoreHorarioId = null
    ): void {
        $asignacion = AsignacionAcademica::with('grupo', 'docente')->findOrFail($asignacionAcademicaId);

        $this->validarDiaSemana($dia);
        $this->validarVentanaTurno($asignacion->grupo->turno, $horaInicio, $horaFin);
        $this->validarCapacidadAula($aulaId, $asignacion->id_grupo);
        $this->validarCruceAula($aulaId, $dia, $horaInicio, $horaFin, $ignoreHorarioId);
        $this->validarCruceGrupo($asignacionAcademicaId, $dia, $horaInicio, $horaFin, $ignoreHorarioId);
        $this->validarCruceHorarioDocente($asignacion->id_docente, $dia, $horaInicio, $horaFin, $ignoreHorarioId);
    }
}
