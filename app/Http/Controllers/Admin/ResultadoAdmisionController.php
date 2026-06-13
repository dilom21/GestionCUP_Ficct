<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmisionCarrera;
use App\Models\GestionCup;
use App\Models\Carrera;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultadoAdmisionController extends Controller
{
    public function index(Request $request)
    {
        $gestiones = GestionCup::orderBy('id', 'desc')->get(['id', 'nombre_gestion']);
        $carreras = Carrera::orderBy('nombre')->get(['id_carrera as id', 'nombre', 'sigla']);

        $query = AdmisionCarrera::with([
            'resultadoCup.inscripcionCup.postulacion.postulante',
            'resultadoCup.inscripcionCup.postulacion.carrera1',
            'resultadoCup.inscripcionCup.postulacion.carrera2',
            'carreraAsignada',
        ]);

        if ($request->filled('id_gestion_cup')) {
            $query->whereHas('resultadoCup.inscripcionCup', fn($q) =>
                $q->where('id_gestion_cup', $request->id_gestion_cup)
            );
        }
        if ($request->filled('id_carrera')) {
            $query->where('id_carrera_asignada', $request->id_carrera);
        }
        if ($request->filled('estado_admision')) {
            $query->where('estado_admision', $request->estado_admision);
        }
        if ($request->filled('busqueda')) {
            $b = $request->busqueda;
            $query->whereHas('resultadoCup.inscripcionCup.postulacion.postulante', fn($q) =>
                $q->where('nombre', 'ilike', "%{$b}%")->orWhere('apellidos', 'ilike', "%{$b}%")->orWhere('ci', 'ilike', "%{$b}%")
            );
        }

        $admisiones = $query->orderBy('puntaje_orden_merito')->get()->map(function ($a) {
            $r = $a->resultadoCup;
            $ins = $r?->inscripcionCup;
            $p = $ins?->postulacion;
            $pt = $p?->postulante;
            return [
                'id'               => $a->id,
                'postulante'       => $pt ? $pt->nombre . ' ' . $pt->apellidos : '—',
                'ci'               => $pt?->ci ?? '—',
                'promedio'         => (float)($r?->promedio_general ?? 0),
                'orden_merito'     => $a->puntaje_orden_merito,
                'carrera_asignada' => $a->carreraAsignada?->nombre ?? '—',
                'tipo_asignacion'  => $a->tipo_asignacion,
                'estado'           => $a->estado_admision,
                'opcion_1'         => $p?->carrera1?->nombre ?? '—',
                'opcion_2'         => $p?->carrera2?->nombre ?? '—',
                'nombre'           => $pt?->nombre ?? '',
                'apellidos'        => $pt?->apellidos ?? '',
            ];
        });

        return Inertia::render('Admin/ResultadosAdmision/Index', [
            'admisiones' => $admisiones,
            'gestiones'  => $gestiones,
            'carreras'   => $carreras,
            'filtros'    => [
                'id_gestion_cup'  => $request->id_gestion_cup ?? '',
                'id_carrera'      => $request->id_carrera ?? '',
                'estado_admision' => $request->estado_admision ?? '',
                'busqueda'        => $request->busqueda ?? '',
            ],
        ]);
    }
}