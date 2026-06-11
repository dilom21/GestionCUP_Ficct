<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use App\Http\Requests\StoreAulaRequest;
use App\Http\Requests\UpdateAulaRequest;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AulaController extends Controller
{
    public function index(Request $request)
    {
        $query = Aula::query();

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('codigo', 'ilike', "%{$busqueda}%")
                  ->orWhere('nombre', 'ilike', "%{$busqueda}%")
                  ->orWhere('ubicacion', 'ilike', "%{$busqueda}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $aulas = $query->orderBy('codigo')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($aula) {
                return [
                    'id'               => $aula->id,
                    'codigo'           => $aula->codigo,
                    'nombre'           => $aula->nombre,
                    'capacidad_maxima' => $aula->capacidad_maxima,
                    'ubicacion'        => $aula->ubicacion,
                    'estado'           => $aula->estado,
                ];
            });

        return Inertia::render('Administrativo/Aulas/Index', [
            'aulas' => $aulas,
            'filtros' => [
                'busqueda' => $request->busqueda ?? '',
                'estado' => $request->estado ?? '',
            ],
        ]);
    }

    public function store(StoreAulaRequest $request)
    {
        DB::beginTransaction();
        try {
            $aula = Aula::create($request->validated());

            BitacoraService::registrar(
                "Aula creada - {$aula->codigo}: {$aula->nombre}",
                session('usuario_id'),
                'aula'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Aula creada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al crear el aula: ' . $e->getMessage());
        }
    }

    public function update(UpdateAulaRequest $request, Aula $aula)
    {
        DB::beginTransaction();
        try {
            $aula->update($request->validated());

            BitacoraService::registrar(
                "Aula actualizada - {$aula->codigo}: {$aula->nombre}",
                session('usuario_id'),
                'aula'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Aula actualizada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar el aula: ' . $e->getMessage());
        }
    }

    public function destroy(Aula $aula)
    {
        if ($aula->horarios()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar el aula porque tiene horarios asociados.');
        }

        DB::beginTransaction();
        try {
            $aula->delete();

            BitacoraService::registrar(
                "Aula eliminada - {$aula->codigo}: {$aula->nombre}",
                session('usuario_id'),
                'aula'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Aula eliminada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al eliminar el aula: ' . $e->getMessage());
        }
    }
}
