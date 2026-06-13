<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evaluacion;
use App\Models\Materia;
use App\Models\GestionCup;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluacionController extends Controller
{
    public function index(Request $request)
    {
        $query = Evaluacion::with(['materia', 'gestionCup'])
            ->orderBy('fecha_evaluacion', 'desc');

        if ($request->filled('id_gestion_cup')) {
            $query->where('id_gestion_cup', $request->id_gestion_cup);
        }
        if ($request->filled('id_materia')) {
            $query->where('id_materia', $request->id_materia);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where('nombre', 'ilike', "%{$busqueda}%");
        }

        $evaluaciones = $query->get();

        $materias = Materia::where('estado', 'Activo')->get(['id_materia as id', 'nombre']);
        $gestiones = GestionCup::orderBy('id', 'desc')->get(['id', 'nombre_gestion']);

        return Inertia::render('Admin/Evaluaciones/Index', [
            'evaluaciones' => $evaluaciones,
            'materias' => $materias,
            'gestiones' => $gestiones,
            'filtros' => [
                'id_gestion_cup' => $request->id_gestion_cup ?? '',
                'id_materia' => $request->id_materia ?? '',
                'estado' => $request->estado ?? '',
                'busqueda' => $request->busqueda ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_materia'      => 'required|integer|exists:materia,id_materia',
            'id_gestion_cup'  => 'required|integer|exists:gestion_cup,id',
            'nombre'          => 'required|string|max:255',
            'porcentaje'      => 'required|integer|min:1|max:100',
            'puntaje_maximo'  => 'required|integer|min:1',
            'fecha_evaluacion' => 'required|date',
        ], [
            'id_materia.required'     => 'La materia es obligatoria.',
            'id_gestion_cup.required' => 'La gestión es obligatoria.',
            'nombre.required'         => 'El nombre de la evaluación es obligatorio.',
            'porcentaje.required'     => 'El porcentaje es obligatorio.',
            'porcentaje.max'          => 'El porcentaje no puede ser mayor a 100.',
            'puntaje_maximo.required' => 'El puntaje máximo es obligatorio.',
            'fecha_evaluacion.required' => 'La fecha es obligatoria.',
        ]);

        // Validar máximo 3 evaluaciones activas por materia/gestión
        $activas = Evaluacion::where('id_materia', $validated['id_materia'])
            ->where('id_gestion_cup', $validated['id_gestion_cup'])
            ->where('estado', 'Activo')
            ->count();

        if ($activas >= 3) {
            return back()->withErrors([
                'id_materia' => 'Ya existen 3 evaluaciones activas para esta materia y gestión.',
            ])->withInput();
        }

        // Validar suma de porcentajes no pase 100%
        $sumaActual = Evaluacion::where('id_materia', $validated['id_materia'])
            ->where('id_gestion_cup', $validated['id_gestion_cup'])
            ->where('estado', 'Activo')
            ->sum('porcentaje');

        if (($sumaActual + $validated['porcentaje']) > 100) {
            return back()->withErrors([
                'porcentaje' => "La suma de porcentajes no puede pasar 100%. Actual: {$sumaActual}%",
            ])->withInput();
        }

        Evaluacion::create($validated);

        BitacoraService::registrar(
            "Evaluación creada - {$validated['nombre']}",
            session('usuario_id'),
            'evaluacion'
        );

        return back()->with('success', 'Evaluación creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $evaluacion = Evaluacion::findOrFail($id);

        $validated = $request->validate([
            'id_materia'      => 'required|integer|exists:materia,id_materia',
            'id_gestion_cup'  => 'required|integer|exists:gestion_cup,id',
            'nombre'          => 'required|string|max:255',
            'porcentaje'      => 'required|integer|min:1|max:100',
            'puntaje_maximo'  => 'required|integer|min:1',
            'fecha_evaluacion' => 'required|date',
        ]);

        // Validar suma de porcentajes (ignorando esta evaluación)
        $sumaActual = Evaluacion::where('id_materia', $validated['id_materia'])
            ->where('id_gestion_cup', $validated['id_gestion_cup'])
            ->where('estado', 'Activo')
            ->where('id', '!=', $id)
            ->sum('porcentaje');

        if (($sumaActual + $validated['porcentaje']) > 100) {
            return back()->withErrors([
                'porcentaje' => "La suma de porcentajes no puede pasar 100%. Actual: {$sumaActual}%",
            ])->withInput();
        }

        $evaluacion->update($validated);

        BitacoraService::registrar(
            "Evaluación actualizada - {$validated['nombre']}",
            session('usuario_id'),
            'evaluacion'
        );

        return back()->with('success', 'Evaluación actualizada correctamente.');
    }

    public function cambiarEstado($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $nuevoEstado = $evaluacion->estado === 'Activo' ? 'Inactivo' : 'Activo';

        // Si va a activar, validar reglas
        if ($nuevoEstado === 'Activo') {
            $activas = Evaluacion::where('id_materia', $evaluacion->id_materia)
                ->where('id_gestion_cup', $evaluacion->id_gestion_cup)
                ->where('estado', 'Activo')
                ->where('id', '!=', $evaluacion->id)
                ->count();

            if ($activas >= 3) {
                return back()->withErrors(['error' => 'Ya existen 3 evaluaciones activas para esta materia y gestión.']);
            }

            $sumaActual = Evaluacion::where('id_materia', $evaluacion->id_materia)
                ->where('id_gestion_cup', $evaluacion->id_gestion_cup)
                ->where('estado', 'Activo')
                ->where('id', '!=', $evaluacion->id)
                ->sum('porcentaje');

            if (($sumaActual + $evaluacion->porcentaje) > 100) {
                return back()->withErrors(['error' => "La suma de porcentajes pasaría 100%. Actual: {$sumaActual}%"]);
            }
        }

        $evaluacion->update(['estado' => $nuevoEstado]);

        BitacoraService::registrar(
            "Evaluación {$nuevoEstado} - {$evaluacion->nombre}",
            session('usuario_id'),
            'evaluacion'
        );

        return back()->with('success', "Evaluación marcada como {$nuevoEstado}.");
    }
}