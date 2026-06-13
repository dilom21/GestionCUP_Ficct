<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CupoCarrera;
use App\Models\Carrera;
use App\Models\GestionCup;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CupoCarreraController extends Controller
{
    public function index(Request $request)
    {
        $query = CupoCarrera::with(['carrera', 'gestionCup']);

        if ($request->filled('id_gestion_cup')) {
            $query->where('id_gestion_cup', $request->id_gestion_cup);
        }

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->whereHas('carrera', function ($q) use ($busqueda) {
                $q->where('nombre', 'ilike', "%{$busqueda}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $cupos = $query->get()->map(function ($c) {
            return [
            'id_gestion_cup' => $c->id_gestion_cup,
            'id_carrera'      => $c->id_carrera,
            'carrera'         => $c->carrera ? $c->carrera->nombre : '—',
            'carrera_sigla'   => $c->carrera ? $c->carrera->sigla : '—',
            'gestion'         => $c->gestionCup ? $c->gestionCup->nombre_gestion : '—',
            'cantidad_cupos'  => $c->cantidad_cupos,
            'cupos_ocupados'  => $c->cupos_ocupados,
            'estado'          => $c->estado,
            ];
        });

        $gestiones = GestionCup::orderBy('id', 'desc')->get(['id', 'nombre_gestion']);
        $carreras = Carrera::orderBy('nombre')->get(['id_carrera as id', 'nombre', 'sigla']);

        return Inertia::render('Admin/CuposCarrera/Index', [
            'cupos'     => $cupos,
            'gestiones' => $gestiones,
            'carreras'  => $carreras,
            'filtros'   => [
            'id_gestion_cup' => $request->id_gestion_cup ?? '',
            'busqueda'       => $request->busqueda ?? '',
            'estado'         => $request->estado ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_gestion_cup' => 'required|integer|exists:gestion_cup,id',
            'id_carrera'     => 'required|integer|exists:carrera,id_carrera',
            'cantidad_cupos' => 'required|integer|min:0',
        ]);

        // Verificar que no exista ya un registro para esa carrera y gestión
        $existe = CupoCarrera::where('id_gestion_cup', $validated['id_gestion_cup'])
        ->where('id_carrera', $validated['id_carrera'])
        ->exists();

        if ($existe) {
            return back()->withErrors([
            'id_carrera' => 'Esta carrera ya tiene cupos configurados para la gestión seleccionada.',
            ])->withInput();
        }

        CupoCarrera::create([
            'id_gestion_cup'  => $validated['id_gestion_cup'],
            'id_carrera'      => $validated['id_carrera'],
            'cantidad_cupos'  => $validated['cantidad_cupos'],
            'cupos_ocupados'  => 0,
            'estado'          => 'Activo',
        ]);

        BitacoraService::registrar(
            "Cupo de carrera creado - Gestión: {$validated['id_gestion_cup']}, Carrera: {$validated['id_carrera']}",
            session('usuario_id'),
            'cupo_carrera'
        );

        return back()->with('success', 'Cupos asignados correctamente.');
    }

    public function update(Request $request, $idGestion, $idCarrera)
    {
        $validated = $request->validate([
            'cantidad_cupos' => 'required|integer|min:0',
        ]);

        $cupoExiste = DB::table('cupo_carrera')
            ->where('id_gestion_cup', $idGestion)
            ->where('id_carrera', $idCarrera)
            ->exists();

        abort_unless($cupoExiste, 404);

        DB::table('cupo_carrera')
            ->where('id_gestion_cup', $idGestion)
            ->where('id_carrera', $idCarrera)
            ->update(['cantidad_cupos' => $validated['cantidad_cupos']]);

        BitacoraService::registrar(
            "Cupo de carrera actualizado - Gestión: {$idGestion}, Carrera: {$idCarrera}",
            session('usuario_id'),
            'cupo_carrera'
        );

        return back()->with('success', 'Cupos actualizados correctamente.');
    }

    public function cambiarEstado($idGestion, $idCarrera)
    {
        $cupo = CupoCarrera::where('id_gestion_cup', $idGestion)
            ->where('id_carrera', $idCarrera)
            ->firstOrFail();

        $nuevoEstado = $cupo->estado === 'Activo' ? 'Inactivo' : 'Activo';

        DB::table('cupo_carrera')
            ->where('id_gestion_cup', $idGestion)
            ->where('id_carrera', $idCarrera)
            ->update(['estado' => $nuevoEstado]);

        BitacoraService::registrar(
            "Cupo de carrera {$nuevoEstado} - Gestión: {$idGestion}, Carrera: {$idCarrera}",
            session('usuario_id'),
            'cupo_carrera'
        );

        return back()->with('success', "Cupo marcado como {$nuevoEstado}.");
    }
}
