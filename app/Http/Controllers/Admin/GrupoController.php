<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grupo;
use App\Models\GestionCup;
use App\Http\Requests\StoreGrupoRequest;
use App\Http\Requests\UpdateGrupoRequest;
use App\Services\AcademicGroupService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class GrupoController extends Controller
{
    public function index(Request $request)
    {
        $query = Grupo::with('gestionCup');

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('sigla', 'ilike', "%{$busqueda}%")
                  ->orWhere('turno', 'ilike', "%{$busqueda}%");
            });
        }

        if ($request->filled('turno')) {
            $query->where('turno', $request->turno);
        }

        if ($request->filled('id_gestion_cup')) {
            $query->where('id_gestion_cup', $request->id_gestion_cup);
        }

        $grupos = $query->orderBy('sigla')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($grupo) {
                return [
                    'id'               => $grupo->id,
                    'sigla'            => $grupo->sigla,
                    'cupo_maximo'      => $grupo->cupo_maximo,
                    'turno'            => $grupo->turno,
                    'modalidad'        => $grupo->modalidad,
                    'estado'           => $grupo->estado,
                    'gestion'          => $grupo->gestionCup?->nombre_gestion,
                    'id_gestion_cup'   => $grupo->id_gestion_cup,
                ];
            });

        $gestiones = GestionCup::orderBy('id', 'desc')
            ->get(['id', 'nombre_gestion']);

        return Inertia::render('Administrativo/Grupos/Index', [
            'grupos'    => $grupos,
            'gestiones' => $gestiones,
            'filtros'   => [
                'busqueda'       => $request->busqueda ?? '',
                'turno'          => $request->turno ?? '',
                'id_gestion_cup' => $request->id_gestion_cup ?? '',
            ],
        ]);
    }

    public function store(StoreGrupoRequest $request)
    {
        DB::beginTransaction();
        try {
            $grupo = Grupo::create($request->validated());

            BitacoraService::registrar(
                "Grupo creado - {$grupo->sigla} ({$grupo->turno})",
                session('usuario_id'),
                'grupo'
            );

            DB::commit();
            return redirect()->back()->with('success', "Grupo {$grupo->sigla} creado exitosamente.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al crear el grupo: ' . $e->getMessage());
        }
    }

    public function update(UpdateGrupoRequest $request, Grupo $grupo)
    {
        DB::beginTransaction();
        try {
            $grupo->update($request->validated());

            BitacoraService::registrar(
                "Grupo actualizado - {$grupo->sigla} ({$grupo->turno})",
                session('usuario_id'),
                'grupo'
            );

            DB::commit();
            return redirect()->back()->with('success', "Grupo {$grupo->sigla} actualizado exitosamente.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar el grupo: ' . $e->getMessage());
        }
    }

    public function destroy(Grupo $grupo)
    {
        if ($grupo->asignacionesAcademicas()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar el grupo porque tiene asignaciones académicas asociadas.');
        }

        if ($grupo->inscripciones()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar el grupo porque tiene inscripciones asociadas.');
        }

        DB::beginTransaction();
        try {
            $grupo->delete();

            BitacoraService::registrar(
                "Grupo eliminado - {$grupo->sigla} ({$grupo->turno})",
                session('usuario_id'),
                'grupo'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Grupo eliminado exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al eliminar el grupo: ' . $e->getMessage());
        }
    }

    public function generar(Request $request, AcademicGroupService $groupService)
    {
        $idGestionCup = $request->input('id_gestion_cup');

        try {
            $resultado = $groupService->generarGrupos($idGestionCup ? (int) $idGestionCup : null);

            BitacoraService::registrar(
                "Grupos generados automáticamente - Gestión: {$resultado['gestion']} ({$resultado['total_grupos']} grupos para {$resultado['total_postulantes']} postulantes)",
                session('usuario_id'),
                'grupo'
            );

            $mensaje = "Se generaron {$resultado['total_grupos']} grupos para {$resultado['total_postulantes']} postulantes habilitados en la gestión {$resultado['gestion']}.";
            return redirect()->back()->with('success', $mensaje);
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
