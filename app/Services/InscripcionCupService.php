<?php

namespace App\Services;

use App\Models\GestionCup;
use App\Models\Grupo;
use App\Models\InscripcionCup;
use App\Models\Postulacion;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InscripcionCupService
{
    private const CAPACIDAD_GRUPO = 80;

    private const PREFIJOS_TURNO = [
        'Mañana' => 'M',
        'Tarde' => 'T',
        'Noche' => 'N',
    ];

    public function inscribir(Postulacion $postulacion): InscripcionCup
    {
        return DB::transaction(function () use ($postulacion) {
            $existente = InscripcionCup::with('grupo')
                ->where('id_postulacion', $postulacion->id)
                ->first();

            if ($existente) {
                return $existente;
            }

            $turno = $postulacion->turno;
            if (!array_key_exists($turno, self::PREFIJOS_TURNO)) {
                throw new RuntimeException('La postulacion no tiene un turno valido para asignar un grupo.');
            }

            $gestionId = GestionCup::query()->max('id');
            if (!$gestionId) {
                throw new RuntimeException('No existe una gestion CUP para registrar la inscripcion.');
            }

            // Bloquear la gestion serializa asignaciones concurrentes y evita exceder cupos.
            $gestion = GestionCup::query()
                ->whereKey($gestionId)
                ->lockForUpdate()
                ->firstOrFail();

            $grupos = Grupo::query()
                ->withCount('inscripciones')
                ->where('id_gestion_cup', $gestion->id)
                ->where('turno', $turno)
                ->where('estado', 'Activo')
                ->orderBy('sigla')
                ->lockForUpdate()
                ->get();

            $grupo = $grupos->first(
                fn (Grupo $grupo) => $grupo->inscripciones_count < $grupo->cupo_maximo
            );

            if (!$grupo) {
                $grupo = $this->crearGrupo($gestion, $turno);
            }

            return InscripcionCup::create([
                'id_postulacion' => $postulacion->id,
                'id_grupo' => $grupo->id,
                'id_gestion_cup' => $gestion->id,
                'fecha_inscripcion' => now(),
                'estado' => 'Inscrito',
            ])->load('grupo');
        });
    }

    private function crearGrupo(GestionCup $gestion, string $turno): Grupo
    {
        $prefijo = self::PREFIJOS_TURNO[$turno];
        $numero = 1;

        do {
            $sigla = $prefijo . str_pad((string) $numero, 3, '0', STR_PAD_LEFT);
            $numero++;
        } while (
            Grupo::where('id_gestion_cup', $gestion->id)
                ->where('sigla', $sigla)
                ->exists()
        );

        return Grupo::create([
            'id_gestion_cup' => $gestion->id,
            'sigla' => $sigla,
            'cupo_maximo' => self::CAPACIDAD_GRUPO,
            'turno' => $turno,
            'modalidad' => 'Presencial',
            'estado' => 'Activo',
        ]);
    }
}
