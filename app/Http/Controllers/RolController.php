<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Modulo;
use App\Models\Bitacora;
use App\Models\Funcion;
use App\Http\Requests\StoreRolRequest;
use App\Http\Requests\UpdateRolRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Rol::orderBy('nombre')->get();
        $modulos = Modulo::with('funciones')->get();

        return Inertia::render('Roles/Index', [
            'roles'   => $roles,
            'modulos' => $modulos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRolRequest $request)
    {
        $validated = $request->validated();
        $funciones = $validated['funciones'] ?? [];
        unset($validated['funciones']);

        $rol = Rol::create($validated);
        $rol->funciones()->sync($funciones);
        Cache::forget("rol:{$rol->id}:sesion");

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'INSERCIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'ROL',
        ]);

        return redirect()->back()->with('success', 'Rol creado exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRolRequest $request, Rol $rol)
    {
        $validated = $request->validated();
        $funciones = $validated['funciones'] ?? [];
        unset($validated['funciones']);

        $rol->update($validated);
        $rol->funciones()->sync($funciones);
        Cache::forget("rol:{$rol->id}:sesion");

        if ((int) session('usuario_rol_id') === (int) $rol->id) {
            session(['usuario_permisos' => $rol->getPermisosArray()]);
        }

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ACTUALIZACIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'ROL',
        ]);

        return redirect()->back()->with('success', 'Rol actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rol $rol)
    {
        // Validar que no tenga usuarios asociados
        if ($rol->usuarios()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar el rol porque tiene usuarios asociados.');
        }

        $rol->funciones()->detach();
        $rol->delete();

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'ELIMINACIÓN',
            'fecha_hora'     => now(),
            'ip'             => request()->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'ROL',
        ]);

        return redirect()->back()->with('success', 'Rol eliminado exitosamente.');
    }

    /**
     * Obtener las funciones asignadas a un rol específico.
     */
    public function getFunciones(Rol $rol)
    {
        $permisos = Rol::expandirPermisosLegacy(
            $rol->funciones()->pluck('funcion.permiso')->toArray()
        );
        $permisosModernos = array_filter(
            $permisos,
            fn (string $permiso) => str_contains($permiso, '.')
        );

        return response()->json([
            'funciones' => Funcion::whereIn('permiso', $permisosModernos)->pluck('id'),
        ]);
    }
}
