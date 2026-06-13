<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use App\Models\InscripcionCup;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\ResultadoCup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalaSituacionController extends Controller
{
    public function index()
    {
        return inertia('Admin/SalaSituacion/Index');
    }

    public function estadisticas()
    {
        $hoy = now()->toDateString();

        $kpis = [
            'postulaciones_hoy'    => Postulacion::whereDate('fecha_postulacion', $hoy)->count(),
            'postulaciones_semana' => Postulacion::whereBetween('fecha_postulacion', [now()->subWeek(), now()])->count(),
            'pagos_hoy'            => Pago::whereDate('fecha_pago', $hoy)->where('estado_pago', 'Confirmado')->count(),
            'pendientes_revision'  => Postulacion::where('estado_postulacion', 'Pendiente')->count(),
            'aprobados'            => ResultadoCup::where('estado_resultado', 'Aprobado')->count(),
            'total_postulantes'    => Postulacion::count(),
            'total_docentes'       => Docente::count(),
            'total_inscriptos'     => InscripcionCup::count(),
        ];

        $ultimasPostulaciones = Postulacion::with('postulante:id_postulante,nombre,apellidos')
            ->whereDate('fecha_postulacion', $hoy)
            ->orderBy('fecha_postulacion', 'desc')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'tipo'       => 'postulacion',
                'icono'      => '📋',
                'texto'      => ($p->postulante?->nombre ?? '') . ' ' . ($p->postulante?->apellidos ?? ''),
                'created_at' => $p->fecha_postulacion,
            ]);

        $ultimosPagos = Pago::with('postulacion.postulante')
            ->whereDate('fecha_pago', $hoy)
            ->where('estado_pago', 'Confirmado')
            ->orderBy('fecha_pago', 'desc')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'tipo'       => 'pago',
                'icono'      => '💰',
                'texto'      => ($p->postulacion?->postulante?->nombre ?? '') . ' ' . ($p->postulacion?->postulante?->apellidos ?? ''),
                'created_at' => $p->fecha_pago,
            ]);

        $feedReciente = $ultimasPostulaciones->concat($ultimosPagos)
            ->sortByDesc('created_at')
            ->take(15)
            ->values();

        $ciudades = Postulante::select('ciudad', DB::raw('count(*) as total'))
            ->whereNotNull('ciudad')
            ->groupBy('ciudad')
            ->orderByDesc('total')
            ->get();

        $postulacionesPorHora = Postulacion::select(
            DB::raw("EXTRACT(HOUR FROM fecha_postulacion) as hora"),
            DB::raw('count(*) as total')
        )
            ->whereDate('fecha_postulacion', $hoy)
            ->groupBy('hora')
            ->orderBy('hora')
            ->get()
            ->map(fn($r) => ['hora' => (int)$r->hora, 'total' => (int)$r->total]);

        $postulacionesPorEstado = Postulacion::select('estado_postulacion', DB::raw('count(*) as total'))
            ->groupBy('estado_postulacion')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'kpis'                  => $kpis,
            'feed_reciente'         => $feedReciente,
            'ciudades'              => $ciudades,
            'postulaciones_por_hora' => $postulacionesPorHora,
            'postulaciones_estados'  => $postulacionesPorEstado,
        ]);
    }
}
