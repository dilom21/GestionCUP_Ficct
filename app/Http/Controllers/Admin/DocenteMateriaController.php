<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocenteMateria;
use App\Models\Docente;
use App\Models\Materia;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DocenteMateriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Docente::with(['usuario', 'materias']);

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->whereHas('usuario', function ($q) use ($busqueda) {
                $q->where('nombre', 'ilike', "%{$busqueda}%")
                  ->orWhere('apellidos', 'ilike', "%{$busqueda}%");
            });
        }

        $docentes = $query->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($docente) {
                return [
                    'id'        => $docente->id,
                    'nombre'    => $docente->usuario?->nombre . ' ' . $docente->usuario?->apellidos,
                    'ci'        => $docente->ci,
                    'materias'  => $docente->materias->map(fn ($m) => [
                        'id_materia' => $m->id_materia,
                        'nombre'     => $m->nombre,
                        'estado'     => $m->pivot->estado ?? 'Activo',
                    ]),
                    'materias_count' => $docente->materias->count(),
                ];
            });

        $materias = Materia::where('estado', 'Activo')->orderBy('nombre')->get(['id_materia', 'nombre']);

        return Inertia::render('Administrativo/DocenteMateria/Index', [
            'docentes'  => $docentes,
            'materias'  => $materias,
            'filtros'   => [
                'busqueda' => $request->busqueda ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_docente' => 'required|integer|exists:docente,id',
            'id_materia' => 'required|integer|exists:materia,id_materia',
        ], [
            'id_docente.required' => 'El docente es obligatorio.',
            'id_materia.required' => 'La materia es obligatoria.',
        ]);

        $existe = DocenteMateria::where('id_docente', $validated['id_docente'])
            ->where('id_materia', $validated['id_materia'])
            ->first();

        if ($existe) {
            if ($existe->estado === 'Inactivo') {
                $existe->update(['estado' => 'Activo']);
                BitacoraService::registrar(
                    "Materia reactivada para docente ID: {$validated['id_docente']}",
                    session('usuario_id'),
                    'docente_materia'
                );
                return redirect()->back()->with('success', 'Materia reactivada para el docente.');
            }
            return redirect()->back()->with('error', 'El docente ya tiene esta materia asignada.');
        }

        DB::beginTransaction();
        try {
            DocenteMateria::create([
                'id_docente' => $validated['id_docente'],
                'id_materia' => $validated['id_materia'],
                'estado'     => 'Activo',
            ]);

            BitacoraService::registrar(
                "Materia asignada a docente ID: {$validated['id_docente']}",
                session('usuario_id'),
                'docente_materia'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Materia asignada al docente exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al asignar la materia: ' . $e->getMessage());
        }
    }

    public function destroy($idDocente, $idMateria)
    {
        $pivot = DocenteMateria::where('id_docente', $idDocente)
            ->where('id_materia', $idMateria)
            ->first();

        if (!$pivot) {
            return redirect()->back()->with('error', 'La asignación no existe.');
        }

        DB::beginTransaction();
        try {
            $pivot->update(['estado' => 'Inactivo']);

            BitacoraService::registrar(
                "Materia desasignada de docente ID: {$idDocente}",
                session('usuario_id'),
                'docente_materia'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Materia desasignada del docente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al desasignar la materia: ' . $e->getMessage());
        }
    }
}
