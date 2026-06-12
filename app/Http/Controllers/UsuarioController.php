<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rol;
use App\Models\Bitacora;
use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = User::with('rol')
            ->orderBy('apellidos')
            ->orderBy('nombre')
            ->get()
            ->map(function ($usuario) {
                return [
                    'id'        => $usuario->id,
                    'nombre'     => $usuario->nombre,
                    'apellidos'  => $usuario->apellidos,
                    'correo'     => $usuario->correo,
                    'estado'     => $usuario->estado,
                    'rol'        => $usuario->rol ? $usuario->rol->nombre : 'Sin rol',
                    'id_rol'     => $usuario->id_rol,
                ];
            });

        $roles = Rol::orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles'    => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUsuarioRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        User::create($data);

        // Registrar en bitácora
        Bitacora::create([
            'accion'         => 'INSERCIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'USUARIO',
        ]);

        return redirect()->back()->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUsuarioRequest $request, User $usuario)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $usuario->update($data);

        Bitacora::create([
            'accion'         => 'ACTUALIZACIÓN',
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'USUARIO',
        ]);

        return redirect()->back()->with('success', 'Usuario actualizado exitosamente.');
    }

    public function destroy(User $usuario)
    {
        $usuario->update(['estado' => 'Inactivo']);

        Bitacora::create([
            'accion'         => 'ELIMINACIÓN LÓGICA',
            'fecha_hora'     => now(),
            'ip'             => request()->ip(),
            'id_usuario'     => Auth::id() ?? 1,
            'tabla_afectada' => 'USUARIO',
        ]);

        return redirect()->back()->with('success', 'Usuario dado de baja exitosamente.');
    }
}