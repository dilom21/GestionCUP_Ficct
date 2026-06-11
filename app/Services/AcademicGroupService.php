<?php

namespace App\Services;

use App\Models\Grupo;
use App\Models\GestionCup;
use App\Models\Postulacion;
use Illuminate\Support\Facades\DB;

class AcademicGroupService
{
    const CAPACIDAD_MAX_GRUPO = 80;

    const PREFIJOS_TURNO = [
        'Mañana' => 'M',
        'Tarde'  => 'T',
        'Noche'  => 'N',
    ];

    /**
     * Genera grupos automáticamente para una gestión activa.
     *
     * @param int|null $idGestionCup ID de la gestión (null = primera encontrada)
     * @return array Resumen de grupos creados
     */
    public function generarGrupos(?int $idGestionCup = null): array
    {
        $gestion = $idGestionCup
            ? GestionCup::findOrFail($idGestionCup)
            : GestionCup::orderBy('id')->first();

        if (!$gestion) {
            throw new \RuntimeException('No hay gestiones registradas.');
        }

        // Postulaciones habilitadas: aprobadas + con pago confirmado
        $postulaciones = Postulacion::where('estado_postulacion', 'Aprobado')
            ->whereHas('pagos', function ($q) {
                $q->where('estado_pago', 'Confirmado');
            })
            ->get(['id', 'turno']);

        if ($postulaciones->isEmpty()) {
            throw new \RuntimeException('No hay postulantes habilitados para generar grupos.');
        }

        // Agrupar por turno
        $porTurno = $postulaciones->groupBy('turno');

        $gruposCreados = [];
        $totalPostulantes = 0;

        DB::beginTransaction();
        try {
            foreach ($porTurno as $turno => $lista) {
                $cantidad = count($lista);
                $totalPostulantes += $cantidad;
                $numGrupos = (int) ceil($cantidad / self::CAPACIDAD_MAX_GRUPO);
                $prefijo = self::PREFIJOS_TURNO[$turno] ?? 'X';

                for ($i = 0; $i < $numGrupos; $i++) {
                    $letra = chr(65 + $i); // A, B, C, ...
                    $sigla = $prefijo . $letra;

                    $grupo = Grupo::create([
                        'id_gestion_cup' => $gestion->id,
                        'sigla'          => $sigla,
                        'cupo_maximo'    => self::CAPACIDAD_MAX_GRUPO,
                        'turno'          => $turno,
                        'modalidad'      => 'Presencial',
                        'estado'         => 'Activo',
                    ]);

                    $gruposCreados[] = [
                        'id'     => $grupo->id,
                        'sigla'  => $sigla,
                        'turno'  => $turno,
                        'cupo'   => self::CAPACIDAD_MAX_GRUPO,
                        'postulantes' => $i < $numGrupos - 1
                            ? self::CAPACIDAD_MAX_GRUPO
                            : ($cantidad - ($numGrupos - 1) * self::CAPACIDAD_MAX_GRUPO),
                    ];
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return [
            'gestion'         => $gestion->nombre_gestion,
            'total_grupos'    => count($gruposCreados),
            'total_postulantes' => $totalPostulantes,
            'capacidad_por_grupo' => self::CAPACIDAD_MAX_GRUPO,
            'grupos'          => $gruposCreados,
        ];
    }
}
