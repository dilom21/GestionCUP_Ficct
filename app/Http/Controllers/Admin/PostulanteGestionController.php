<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Postulante;
use App\Models\Postulacion;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostulanteGestionController extends Controller
{
    public function index()
    {
        // Postulantes que completaron todo el proceso (tienen usuario y postulación aprobada)
        $postulantes = Postulante::with(['usuario', 'postulaciones.carrera1', 'postulaciones.carrera2'])
            ->whereNotNull('id_usuario')
            ->get()
            ->map(function ($p) {
                $postulacion = $p->postulaciones->first();
                return [
                    'id' => $p->id_postulante,
                    'nombre' => $p->nombre,
                    'apellidos' => $p->apellidos,
                    'correo' => $p->correo,
                    'ci' => $p->ci,
                    'telefono' => $p->telefono,
                    'direccion' => $p->direccion,
                    'ciudad' => $p->ciudad,
                    'colegio_procedencia' => $p->colegio_procedencia,
                    'turno' => $postulacion?->turno,
                    'carrera1' => $postulacion?->carrera1?->nombre,
                    'carrera1_sigla' => $postulacion?->carrera1?->sigla,
                    'carrera2' => $postulacion?->carrera2?->nombre,
                    'carrera2_sigla' => $postulacion?->carrera2?->sigla,
                    'estado_usuario' => $p->usuario?->estado,
                    'id_usuario' => $p->id_usuario,
                    'usuario' => [
                        'nombre' => $p->usuario?->nombre,
                        'apellidos' => $p->usuario?->apellidos,
                        'correo' => $p->usuario?->correo,
                        'estado' => $p->usuario?->estado,
                        'telefono' => $p->usuario?->telefono,
                    ],
                ];
            });

        return Inertia::render('Admin/PostulantesGestion/Index', [
            'postulantes' => $postulantes,
        ]);
    }

    public function update(Request $request, $id)
    {
        $postulante = Postulante::with('usuario')->findOrFail($id);

        $validated = $request->validate([
            'telefono'            => 'nullable|string|max:50',
            'direccion'           => 'nullable|string|max:500',
            'ciudad'              => 'nullable|string|max:255',
            'colegio_procedencia' => 'nullable|string|max:255',
        ]);

        $postulante->update($validated);

        BitacoraService::registrar(
            "Postulante actualizado - {$postulante->nombre} {$postulante->apellidos}",
            session('usuario_id'),
            'postulante'
        );

        return back()->with('success', 'Postulante actualizado correctamente.');
    }

    public function cambiarEstado($id)
    {
        $postulante = Postulante::with('usuario')->findOrFail($id);
        $usuario = $postulante->usuario;

        if (!$usuario) {
            return back()->withErrors(['error' => 'El postulante no tiene usuario asociado.']);
        }

        $nuevoEstado = $usuario->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $usuario->update(['estado' => $nuevoEstado]);

        BitacoraService::registrar(
            "Postulante {$postulante->nombre} {$postulante->apellidos} cambiado a {$nuevoEstado}",
            session('usuario_id'),
            'usuario'
        );

        return back()->with('success', "Postulante marcado como {$nuevoEstado}.");
    }
}