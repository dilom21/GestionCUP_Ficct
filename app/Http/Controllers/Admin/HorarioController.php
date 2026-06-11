<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Horario;
use App\Models\AsignacionAcademica;
use App\Models\Aula;
use App\Services\AcademicValidationService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HorarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Horario::with([
            'asignacionAcademica.materia',
            'asignacionAcademica.grupo',
            'asignacionAcademica.docente.usuario',
            'aula',
        ]);

        if ($request->filled('id_asignacion_academica')) {
            $query->where('id_asignacion_academica', $request->id_asignacion_academica);
        }

        if ($request->filled('dia_semana')) {
            $query->where('dia_semana', $request->dia_semana);
        }

        $horarios = $query->orderBy('dia_semana')->orderBy('horario_inicio')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($horario) {
                return [
                    'id'                      => $horario->id,
                    'id_asignacion_academica' => $horario->id_asignacion_academica,
                    'materia'                 => $horario->asignacionAcademica?->materia?->nombre,
                    'grupo'                   => $horario->asignacionAcademica?->grupo?->sigla,
                    'docente'                 => $horario->asignacionAcademica?->docente?->usuario?->nombre
                        . ' ' . $horario->asignacionAcademica?->docente?->usuario?->apellidos,
                    'aula'      => $horario->aula?->codigo,
                    'id_aula'   => $horario->id_aula,
                    'dia_semana'=> $horario->dia_semana,
                    'horario_inicio' => $horario->horario_inicio,
                    'horario_fin'    => $horario->horario_fin,
                ];
            });

        $asignaciones = AsignacionAcademica::with(['materia', 'grupo', 'docente.usuario'])
            ->where('estado', 'Activo')
            ->get()
            ->map(fn ($a) => [
                'id'      => $a->id,
                'label'   => ($a->materia?->nombre ?? '?') . ' - ' . ($a->grupo?->sigla ?? '?')
                    . ' (' . ($a->docente?->usuario?->apellidos ?? '?') . ')',
            ]);

        $aulas = Aula::where('estado', 'Activo')
            ->orderBy('codigo')
            ->get(['id', 'codigo', 'nombre', 'capacidad_maxima']);

        return Inertia::render('Administrativo/Horarios/Index', [
            'horarios'     => $horarios,
            'asignaciones' => $asignaciones,
            'aulas'        => $aulas,
            'filtros'      => [
                'id_asignacion_academica' => $request->id_asignacion_academica ?? '',
                'dia_semana'              => $request->dia_semana ?? '',
            ],
        ]);
    }

    public function store(Request $request, AcademicValidationService $validationService)
    {
        $validated = $request->validate([
            'id_asignacion_academica' => 'required|integer|exists:asignacion_academica,id',
            'id_aula'                 => 'required|integer|exists:aula,id',
            'dia_semana'              => 'required|string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado',
            'horario_inicio'          => 'required|date_format:H:i',
            'horario_fin'             => 'required|date_format:H:i|after:horario_inicio',
        ], [
            'id_asignacion_academica.required' => 'La asignación académica es obligatoria.',
            'id_aula.required'                 => 'El aula es obligatoria.',
            'dia_semana.required'              => 'El día de semana es obligatorio.',
            'dia_semana.in'                    => 'Día inválido. Use: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado.',
            'horario_inicio.required'          => 'La hora de inicio es obligatoria.',
            'horario_inicio.date_format'       => 'La hora de inicio debe tener formato HH:MM.',
            'horario_fin.required'             => 'La hora de fin es obligatoria.',
            'horario_fin.date_format'          => 'La hora de fin debe tener formato HH:MM.',
            'horario_fin.after'                => 'La hora de fin debe ser posterior a la hora de inicio.',
        ]);

        // Validaciones estrictas de cruce
        $validationService->validarHorarioCompleto(
            $validated['id_asignacion_academica'],
            $validated['id_aula'],
            $validated['dia_semana'],
            $validated['horario_inicio'],
            $validated['horario_fin']
        );

        // GAP 9: Validar que no se exceda la carga horaria de la asignación
        $validationService->validarCargaHoraria(
            $validated['id_asignacion_academica'],
            $validated['horario_inicio'],
            $validated['horario_fin']
        );

        DB::beginTransaction();
        try {
            $horario = Horario::create($validated);

            BitacoraService::registrar(
                "Horario creado - {$validated['dia_semana']} {$validated['horario_inicio']}-{$validated['horario_fin']}",
                session('usuario_id'),
                'horario'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Horario creado exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al crear el horario: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Horario $horario, AcademicValidationService $validationService)
    {
        $validated = $request->validate([
            'id_aula'        => 'required|integer|exists:aula,id',
            'dia_semana'     => 'required|string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado',
            'horario_inicio' => 'required|date_format:H:i',
            'horario_fin'    => 'required|date_format:H:i|after:horario_inicio',
        ], [
            'id_aula.required'    => 'El aula es obligatoria.',
            'dia_semana.required' => 'El día de semana es obligatorio.',
            'dia_semana.in'       => 'Día inválido.',
            'horario_inicio.date_format' => 'Formato HH:MM requerido.',
            'horario_fin.date_format'    => 'Formato HH:MM requerido.',
            'horario_fin.after'   => 'La hora de fin debe ser posterior al inicio.',
        ]);

        // Validaciones estrictas ignorando el horario actual
        $validationService->validarHorarioCompleto(
            $horario->id_asignacion_academica,
            $validated['id_aula'],
            $validated['dia_semana'],
            $validated['horario_inicio'],
            $validated['horario_fin'],
            $horario->id
        );

        // GAP 9: Validar que no se exceda la carga horaria (excluyendo el horario actual)
        $validationService->validarCargaHoraria(
            $horario->id_asignacion_academica,
            $validated['horario_inicio'],
            $validated['horario_fin'],
            $horario->id
        );

        DB::beginTransaction();
        try {
            $horario->update($validated);

            BitacoraService::registrar(
                "Horario actualizado - ID: {$horario->id}",
                session('usuario_id'),
                'horario'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Horario actualizado exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar el horario: ' . $e->getMessage());
        }
    }

    public function destroy(Horario $horario)
    {
        DB::beginTransaction();
        try {
            $horario->delete();

            BitacoraService::registrar(
                "Horario eliminado - ID: {$horario->id}",
                session('usuario_id'),
                'horario'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Horario eliminado exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al eliminar el horario: ' . $e->getMessage());
        }
    }
}
