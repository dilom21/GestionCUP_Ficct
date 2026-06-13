<?php

namespace App\Http\Controllers;

use App\Models\AdmisionCarrera;
use App\Models\Postulacion;
use App\Models\Nota;
use App\Models\ResultadoCup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrayectoriaController extends Controller
{
    public function publica($token)
    {
        $postulacion = Postulacion::with([
            'postulante',
            'carrera1',
            'pagos',
            'inscripcionCup.grupo',
            'inscripcionCup.resultado.admisionCarreras.carreraAsignada',
        ])
            ->where('token_pago', $token)
            ->firstOrFail();

        $nodos = $this->generarNodos($postulacion);

        return Inertia::render('Trayectoria/Publica', [
            'postulante' => $postulacion->postulante,
            'nodos'      => $nodos,
        ]);
    }

    public function adminIndex()
    {
        return Inertia::render('Admin/Trayectorias/Index');
    }

    public function buscar(Request $request)
    {
        $request->validate(['busqueda' => 'required|string|min:3']);

        $postulaciones = Postulacion::with([
            'postulante:id_postulante,nombre,apellidos,ci',
            'carrera1:id_carrera,nombre',
            'pagos',
            'inscripcionCup.grupo',
            'inscripcionCup.resultado.admisionCarreras.carreraAsignada',
        ])
            ->whereHas('postulante', function ($q) use ($request) {
                $q->where('ci', 'like', "%{$request->busqueda}%")
                  ->orWhere('nombre', 'ilike', "%{$request->busqueda}%")
                  ->orWhere('apellidos', 'ilike', "%{$request->busqueda}%");
            })
            ->orderBy('fecha_postulacion', 'desc')
            ->take(20)
            ->get();

        $resultados = $postulaciones->map(fn($p) => [
            'id'        => $p->id,
            'nombres'   => trim(($p->postulante?->nombre ?? '') . ' ' . ($p->postulante?->apellidos ?? '')),
            'ci'        => $p->postulante?->ci,
            'carrera'   => $p->carrera1?->nombre,
            'nodos'     => $this->generarNodos($p),
        ]);

        return response()->json(['postulaciones' => $resultados]);
    }

    private function generarNodos($p)
    {
        $pagosConfirmados = $p->pagos->where('estado_pago', 'Confirmado');
        $inscripcion = $p->inscripcionCup;
        $notas = $inscripcion ? Nota::where('id_inscripcion_cup', $inscripcion->id)->count() : 0;
        $resultado = $inscripcion?->resultado;
        $admisiones = $resultado?->admisionCarreras;

        return [
            [
                'etapa'       => 'Postulación',
                'icono'       => '📋',
                'completado'  => true,
                'fecha'       => $p->fecha_postulacion,
                'detalle'     => "Formulario #{$p->nro_formulario} — {$p->carrera1?->nombre}",
            ],
            [
                'etapa'       => 'Revisión de Documentos',
                'icono'       => '🔍',
                'completado'  => $p->estado_postulacion !== 'Pendiente',
                'fecha'       => $p->fecha_revision,
                'detalle'     => "Estado: {$p->estado_postulacion}",
            ],
            [
                'etapa'       => 'Pago',
                'icono'       => '💰',
                'completado'  => $pagosConfirmados->isNotEmpty(),
                'fecha'       => $pagosConfirmados->first()?->fecha_pago,
                'detalle'     => $pagosConfirmados->isNotEmpty()
                    ? number_format($pagosConfirmados->first()->monto, 2) . ' Bs — Confirmado'
                    : 'Pendiente',
            ],
            [
                'etapa'       => 'Inscripción',
                'icono'       => '🎓',
                'completado'  => (bool)$inscripcion,
                'fecha'       => $inscripcion?->fecha_inscripcion,
                'detalle'     => $inscripcion
                    ? "Grupo {$inscripcion->grupo?->sigla} — {$inscripcion->grupo?->turno}"
                    : 'Sin inscripción',
            ],
            [
                'etapa'       => 'Evaluaciones',
                'icono'       => '📝',
                'completado'  => $notas > 0,
                'fecha'       => null,
                'detalle'     => $notas > 0 ? "{$notas} notas registradas" : 'Sin evaluaciones',
            ],
            [
                'etapa'       => 'Resultado Final',
                'icono'       => '🏆',
                'completado'  => (bool)$resultado,
                'fecha'       => null,
                'detalle'     => $resultado
                    ? ucfirst(strtolower($resultado->estado_resultado)) . " — Prom. {$resultado->promedio_general}"
                    : 'Pendiente',
            ],
            [
                'etapa'       => 'Admisión a Carrera',
                'icono'       => '✅',
                'completado'  => $admisiones?->isNotEmpty() ?? false,
                'fecha'       => $admisiones?->first()?->fecha_admision,
                'detalle'     => $admisiones?->isNotEmpty()
                    ? $admisiones->first()?->carreraAsignada?->nombre . ' (' . ucfirst(strtolower($admisiones->first()?->estado_admision ?? '')) . ')'
                    : 'Pendiente',
            ],
        ];
    }
}
