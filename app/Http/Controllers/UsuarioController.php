<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rol;
use App\Models\Bitacora;
use App\Http\Requests\ImportUsuariosRequest;
use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Imports\UsuariosImport;
use App\Jobs\EnviarCredencialesUsuarioJob;
use App\Services\BitacoraService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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

    public function importar(ImportUsuariosRequest $request)
    {
        $archivo = $request->file('archivo');
        $batchId = (string) Str::uuid();

        $import = new UsuariosImport($batchId);

        try {
            Excel::import($import, $archivo);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Error al procesar el archivo: ' . $e->getMessage());
        }

        $creados = $import->getCreados();
        $errores = $import->getErrores();

        foreach ($creados as $item) {
            EnviarCredencialesUsuarioJob::dispatch($item['usuario'], $item['passwordPlano']);
        }

        if (count($creados) > 0) {
            BitacoraService::registrar(
                "IMPORTACIÓN MASIVA — " . count($creados) . " usuarios creados (batch: {$batchId})",
                Auth::id() ?? 1,
                'USUARIO'
            );
        }

        return redirect()->back()->with('import_resultado', [
            'import_batch' => $batchId,
            'creados'      => $creados,
            'errores'      => $errores,
            'total_creados' => count($creados),
            'total_errores' => count($errores),
        ]);
    }

    public function deshacerImportacion(string $batch)
    {
        $eliminados = User::where('import_batch', $batch)->delete();

        BitacoraService::registrar(
            "IMPORTACIÓN DESHECHA — {$eliminados} usuarios eliminados (batch: {$batch})",
            Auth::id() ?? 1,
            'USUARIO'
        );

        return redirect()->back()->with('success', "Importación deshecha. {$eliminados} usuarios eliminados.");
    }
}