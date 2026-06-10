<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use App\Models\PostulacionDocente;
use App\Models\User;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocenteController extends Controller
{
    public function index(Request $request)
    {
        $query = Docente::with('usuario.rol');

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->whereHas('usuario', function ($q) use ($busqueda) {
                $q->where('nombre', 'ilike', "%{$busqueda}%")
                  ->orWhere('apellidos', 'ilike', "%{$busqueda}%")
                  ->orWhere('correo', 'ilike', "%{$busqueda}%");
            })->orWhere('ci', 'ilike', "%{$busqueda}%");
        }

        if ($request->filled('estado')) {
            $query->whereHas('usuario', function ($q) use ($request) {
                $q->where('estado', $request->estado);
            });
        }

        $docentes = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Usuarios disponibles (rol Docente, activos, sin perfil docente) con datos de postulación
        $usuariosDisponibles = User::whereHas('rol', function ($q) {
                $q->whereRaw('LOWER(nombre) = ?', ['docente']);
            })
            ->where('estado', 'Activo')
            ->whereDoesntHave('docente')
            ->get(['id', 'nombre', 'apellidos', 'correo']);

        // Adjuntar datos de postulación aprobada a cada usuario (por id_usuario_creado)
        $usuariosDisponibles->each(function ($user) {
            $postulacion = PostulacionDocente::where('id_usuario_creado', $user->id)
                ->first(['id', 'ci', 'profesion', 'grado_academico', 'experiencia_anios']);
            $user->postulacion = $postulacion;
        });

        return Inertia::render('Admin/Docentes/Index', [
            'docentes' => $docentes,
            'usuarios' => $usuariosDisponibles,
            'filtros' => [
                'busqueda' => $request->busqueda ?? '',
                'estado' => $request->estado ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_usuario'               => 'required|integer|exists:usuario,id',
            'ci'                       => 'required|string|max:50|unique:docente,ci',
            'profesion'                => 'required|string|max:255',
            'area_profesional'         => 'nullable|string|max:255',
            'grado_academico'          => 'required|string|max:255',
            'maestria'                 => 'boolean',
            'diplomado_educacion_superior' => 'boolean',
            'experiencia_anios'        => 'required|integer|min:0',
            'maximo_grupos'            => 'required|integer|min:0',
        ], [
            'id_usuario.required'      => 'Debe seleccionar un usuario.',
            'ci.required'              => 'El CI es obligatorio.',
            'ci.unique'                => 'Este CI ya está registrado.',
            'profesion.required'       => 'La profesión es obligatoria.',
            'grado_academico.required' => 'El grado académico es obligatorio.',
            'experiencia_anios.required' => 'La experiencia es obligatoria.',
        ]);

        $usuario = User::with('rol')->findOrFail($validated['id_usuario']);

        if (strtolower($usuario->rol->nombre) !== 'docente') {
            return back()->withErrors(['id_usuario' => 'El usuario no tiene rol Docente.'])->withInput();
        }

        if ($usuario->estado !== 'Activo') {
            return back()->withErrors(['id_usuario' => 'El usuario no está activo.'])->withInput();
        }

        if (Docente::where('id_usuario', $usuario->id)->exists()) {
            return back()->withErrors(['id_usuario' => 'Este usuario ya tiene perfil docente.'])->withInput();
        }

        // Buscar postulación asociada para la FK (por id_usuario_creado)
        $postulacion = PostulacionDocente::where('id_usuario_creado', $usuario->id)
            ->first();

        $docente = Docente::create([
            'id_usuario'                  => $validated['id_usuario'],
            'ci'                          => $validated['ci'],
            'profesion'                   => $validated['profesion'],
            'area_profesional'            => $validated['area_profesional'] ?? null,
            'grado_academico'             => $validated['grado_academico'],
            'maestria'                    => $request->boolean('maestria'),
            'diplomado_educacion_superior' => $request->boolean('diplomado_educacion_superior'),
            'experiencia_anios'           => $validated['experiencia_anios'],
            'maximo_grupos'               => $validated['maximo_grupos'],
            'id_postulacion_docente'      => $postulacion?->id,
        ]);

        BitacoraService::registrar(
            "Perfil docente creado - {$usuario->nombre} {$usuario->apellidos}",
            session('usuario_id'),
            'docente'
        );

        return redirect()->route('admin.docentes.index')
            ->with('success', 'Docente registrado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $docente = Docente::findOrFail($id);

        $validated = $request->validate([
            'ci'                       => "required|string|max:50|unique:docente,ci,{$id}",
            'profesion'                => 'required|string|max:255',
            'area_profesional'         => 'nullable|string|max:255',
            'grado_academico'          => 'required|string|max:255',
            'maestria'                 => 'boolean',
            'diplomado_educacion_superior' => 'boolean',
            'experiencia_anios'        => 'required|integer|min:0',
            'maximo_grupos'            => 'required|integer|min:0',
            'telefono'                 => 'nullable|string|max:50',
        ]);

        if ($request->filled('telefono')) {
            $docente->usuario->update(['telefono' => $request->telefono]);
        }

        $docente->update([
            'ci'                          => $validated['ci'],
            'profesion'                   => $validated['profesion'],
            'area_profesional'            => $validated['area_profesional'] ?? null,
            'grado_academico'             => $validated['grado_academico'],
            'maestria'                    => $request->boolean('maestria'),
            'diplomado_educacion_superior' => $request->boolean('diplomado_educacion_superior'),
            'experiencia_anios'           => $validated['experiencia_anios'],
            'maximo_grupos'               => $validated['maximo_grupos'],
        ]);

        BitacoraService::registrar(
            "Perfil docente actualizado - ID {$id}",
            session('usuario_id'),
            'docente'
        );

        return redirect()->route('admin.docentes.index')
            ->with('success', 'Docente actualizado correctamente.');
    }

    public function cambiarEstado($id)
    {
        $docente = Docente::with('usuario')->findOrFail($id);
        $usuario = $docente->usuario;

        $nuevoEstado = $usuario->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $usuario->update(['estado' => $nuevoEstado]);

        BitacoraService::registrar(
            "Docente {$usuario->nombre} {$usuario->apellidos} cambiado a {$nuevoEstado}",
            session('usuario_id'),
            'usuario'
        );

        return back()->with('success', "Docente marcado como {$nuevoEstado}.");
    }
}