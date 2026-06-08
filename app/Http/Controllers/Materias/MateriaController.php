<?php

namespace App\Http\Controllers\Materias;

use App\Models\Materia;
use App\Models\Bitacora;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMateriaRequest;
use App\Http\Requests\UpdateMateriaRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MateriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materias = Materia::orderBy('nombre')
            ->get()
            ->map(function ($materia) {
                return [
                    'id_materia' => $materia->id_materia,
                    'nombre'     => $materia->nombre,
                    'estado'     => $materia->estado,
                ];
            });

        return Inertia::render('Materias/Index', [
            'materias' => $materias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMateriaRequest $request)
    {
        Materia::create([
            'nombre' => $request->validated()['nombre'],
            'estado' => 'Activo',
        ]);

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'INSERCIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'MATERIA',
        ]);

        return redirect()->back()->with('success', 'Materia creada exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMateriaRequest $request, Materia $materium)
    {
        // Si la materia está inactiva y se intenta editar, la reactivamos
        $data = $request->validated();
        $data['estado'] = 'Activo';

        $materium->update($data);

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ACTUALIZACIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'MATERIA',
        ]);

        return redirect()->back()->with('success', 'Materia actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage (borrado lógico).
     */
    public function destroy(Materia $materium)
    {
        // Borrado lógico: cambiar estado a 'Inactivo'
        $materium->update(['estado' => 'Inactivo']);

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ELIMINACIÓN',
            'fecha_hora'     => now(),
            'ip'             => request()->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'MATERIA',
        ]);

        return redirect()->back()->with('success', 'Materia desactivada exitosamente.');
    }
}