<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AsignacionAcademica;
use App\Models\DocenteMateria;
use App\Models\Horario;
use App\Models\Materia;
use App\Models\Grupo;
use App\Models\Docente;
use App\Models\GestionCup;
use App\Services\AcademicValidationService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AsignacionAcademicaController extends Controller
{
    public function index(Request $request)
    {
        $query = AsignacionAcademica::with([
            'materia',
            'grupo',
            'docente.usuario',
            'gestionCup',
            'horarios.aula',
        ]);

        if ($request->filled('id_gestion_cup')) {
            $query->where('id_gestion_cup', $request->id_gestion_cup);
        }

        if ($request->filled('id_docente')) {
            $query->where('id_docente', $request->id_docente);
        }

        $asignaciones = $query->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($asignacion) {
                return [
                    'id'               => $asignacion->id,
                    'materia'          => $asignacion->materia?->nombre,
                    'id_materia'       => $asignacion->id_materia,
                    'grupo'            => $asignacion->grupo?->sigla,
                    'id_grupo'         => $asignacion->id_grupo,
                    'docente'          => $asignacion->docente?->usuario?->nombre . ' ' . $asignacion->docente?->usuario?->apellidos,
                    'id_docente'       => $asignacion->id_docente,
                    'gestion'          => $asignacion->gestionCup?->nombre_gestion,
                    'carga_horaria'    => $asignacion->carga_horaria,
                    'estado'           => $asignacion->estado,
                    'horarios_count'   => $asignacion->horarios->count(),
                ];
            });

        $materias = Materia::where('estado', 'Activo')->orderBy('nombre')->get(['id_materia', 'nombre']);
        $grupos = Grupo::where('estado', 'Activo')->orderBy('sigla')->get(['id', 'sigla', 'turno']);
        $docentes = Docente::with('usuario')->get()->map(fn ($d) => [
            'id'     => $d->id,
            'nombre' => $d->usuario?->nombre . ' ' . $d->usuario?->apellidos,
        ]);
        $gestiones = GestionCup::orderBy('id', 'desc')->get(['id', 'nombre_gestion']);

        return Inertia::render('Administrativo/AsignacionAcademica/Index', [
            'asignaciones' => $asignaciones,
            'materias'     => $materias,
            'grupos'       => $grupos,
            'docentes'     => $docentes,
            'gestiones'    => $gestiones,
            'filtros'      => [
                'id_gestion_cup' => $request->id_gestion_cup ?? '',
                'id_docente'     => $request->id_docente ?? '',
            ],
        ]);
    }

    public function store(Request $request, AcademicValidationService $validationService)
    {
        $validated = $request->validate([
            'id_materia'    => 'required|integer|exists:materia,id_materia',
            'id_grupo'      => 'required|integer|exists:grupo,id',
            'id_docente'    => 'required|integer|exists:docente,id',
            'id_gestion_cup'=> 'required|integer|exists:gestion_cup,id',
            'carga_horaria' => 'required|integer|min:1|max:200',
        ], [
            'id_materia.required'     => 'La materia es obligatoria.',
            'id_grupo.required'       => 'El grupo es obligatorio.',
            'id_docente.required'     => 'El docente es obligatorio.',
            'id_gestion_cup.required' => 'La gestión es obligatoria.',
            'carga_horaria.required'  => 'La carga horaria es obligatoria.',
            'carga_horaria.min'       => 'La carga horaria mínima es 1.',
            'carga_horaria.max'       => 'La carga horaria máxima es 200.',
        ]);

        // Validar que el docente esté habilitado para la materia (docente_materia)
        $habilitado = DocenteMateria::where('id_docente', $validated['id_docente'])
            ->where('id_materia', $validated['id_materia'])
            ->where('estado', 'Activo')
            ->exists();

        if (!$habilitado) {
            return redirect()->back()->with('error', 'El docente no está habilitado para impartir esta materia. Debe asignarle la materia primero en "Gestión de Materias por Docente".')->withInput();
        }

        // Validar límite de grupos del docente
        $validationService->validarLimiteGruposDocente(
            $validated['id_docente'],
            $validated['id_gestion_cup']
        );

        DB::beginTransaction();
        try {
            $asignacion = AsignacionAcademica::create($validated);

            BitacoraService::registrar(
                "Asignación académica creada - Docente ID: {$validated['id_docente']}, Grupo ID: {$validated['id_grupo']}",
                session('usuario_id'),
                'asignacion_academica'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Asignación académica creada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al crear la asignación: ' . $e->getMessage());
        }
    }

    public function update(Request $request, AsignacionAcademica $asignacionAcademica, AcademicValidationService $validationService)
    {
        $validated = $request->validate([
            'id_materia'    => 'required|integer|exists:materia,id_materia',
            'id_grupo'      => 'required|integer|exists:grupo,id',
            'id_docente'    => 'required|integer|exists:docente,id',
            'carga_horaria' => 'required|integer|min:1|max:200',
            'estado'        => 'nullable|string|max:50',
        ]);

        $cambioDocente = (int) $validated['id_docente'] !== (int) $asignacionAcademica->id_docente;
        $cambioMateria = (int) $validated['id_materia'] !== (int) $asignacionAcademica->id_materia;
        $cambioGrupo   = (int) $validated['id_grupo']   !== (int) $asignacionAcademica->id_grupo;

        if ($cambioDocente || $cambioMateria) {
            $habilitado = DocenteMateria::where('id_docente', $validated['id_docente'])
                ->where('id_materia', $validated['id_materia'])
                ->where('estado', 'Activo')
                ->exists();
            if (!$habilitado) {
                return redirect()->back()->with('error', 'El docente no está habilitado para impartir esta materia.')->withInput();
            }
        }

        if ($cambioDocente) {
            $validationService->validarLimiteGruposDocente(
                $validated['id_docente'],
                $asignacionAcademica->id_gestion_cup
            );
        }

        if ($cambioGrupo) {
            $nuevoGrupo = Grupo::find($validated['id_grupo']);
            $horariosExistentes = Horario::where('id_asignacion_academica', $asignacionAcademica->id)->get();
            foreach ($horariosExistentes as $horario) {
                $validationService->validarVentanaTurno($nuevoGrupo->turno, $horario->horario_inicio, $horario->horario_fin);
                $validationService->validarCruceGrupo($asignacionAcademica->id, $horario->dia_semana, $horario->horario_inicio, $horario->horario_fin, $horario->id);
            }
        }

        DB::beginTransaction();
        try {
            $asignacionAcademica->update($validated);

            BitacoraService::registrar(
                "Asignación académica actualizada - ID: {$asignacionAcademica->id}",
                session('usuario_id'),
                'asignacion_academica'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Asignación académica actualizada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar la asignación: ' . $e->getMessage());
        }
    }

    public function destroy(AsignacionAcademica $asignacionAcademica)
    {
        if ($asignacionAcademica->horarios()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar la asignación porque tiene horarios asociados.');
        }

        DB::beginTransaction();
        try {
            $asignacionAcademica->delete();

            BitacoraService::registrar(
                "Asignación académica eliminada - ID: {$asignacionAcademica->id}",
                session('usuario_id'),
                'asignacion_academica'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Asignación académica eliminada exitosamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al eliminar la asignación: ' . $e->getMessage());
        }
    }
}
