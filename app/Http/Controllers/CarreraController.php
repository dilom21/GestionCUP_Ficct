<?php

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Models\Bitacora;
use App\Http\Requests\StoreCarreraRequest;
use App\Http\Requests\UpdateCarreraRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CarreraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carreras = Carrera::orderBy('sigla')
            ->get()
            ->map(function ($carrera) {
                return [
                    'id_carrera' => $carrera->id_carrera,
                    'sigla'      => $carrera->sigla,
                    'nombre'     => $carrera->nombre,
                ];
            });

        return Inertia::render('Carreras/Index', [
            'carreras' => $carreras,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarreraRequest $request)
    {
        Carrera::create($request->validated());

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'INSERCIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'CARRERA',
        ]);

        return redirect()->back()->with('success', 'Carrera creada exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarreraRequest $request, Carrera $carrera)
    {
        $carrera->update($request->validated());

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ACTUALIZACIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'CARRERA',
        ]);

        return redirect()->back()->with('success', 'Carrera actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Carrera $carrera)
    {
        // Validar que no tenga directores asociados
        if ($carrera->directores()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar la carrera porque tiene directores asociados.');
        }

        // Validar que no tenga postulaciones asociadas
        $postulacionesCount = DB::table('postulacion')
            ->where('id_carrera_opcion_1', $carrera->id_carrera)
            ->orWhere('id_carrera_opcion_2', $carrera->id_carrera)
            ->count();

        if ($postulacionesCount > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar la carrera porque tiene postulaciones asociadas.');
        }

        $carrera->delete();

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ELIMINACIÓN',
            'fecha_hora'     => now(),
            'ip'             => request()->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'CARRERA',
        ]);

        return redirect()->back()->with('success', 'Carrera eliminada exitosamente.');
    }
}