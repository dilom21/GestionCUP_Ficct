<?php

namespace App\Http\Controllers;

use App\Models\PostulacionDocente;
use App\Models\PostulacionDocenteRequisito;
use App\Models\RequisitoDocente;
use App\Models\Materia;
use App\Models\DocumentoPostulacionDocente;
use App\Services\BitacoraService;
use App\Services\ResendEmailService;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostulacionDocenteController extends Controller
{
    /**
     * Mostrar formulario de postulación docente.
     */
    public function create()
    {
        $requisitos = RequisitoDocente::where('estado', 'Activo')->get();
        $materias = Materia::where('estado', 'Activo')->get(['id_materia', 'nombre']);

        return Inertia::render('PostulacionDocente/Create', [
            'requisitos' => $requisitos,
            'materias' => $materias,
            'success' => session('success'),
        ]);
    }

    /**
     * Procesar la postulación docente.
     */
    public function store(Request $request)
    {
        // Validar datos del postulante
        $validated = $request->validate([
            'nombre'                 => 'required|string|max:255',
            'apellido'               => 'required|string|max:255',
            'correo'                 => 'required|email|max:255',
            'telefono'               => 'nullable|string|max:50',
            'ci'                     => 'required|string|max:50',
            'profesion'              => 'required|string|max:255',
            'experiencia_anios'      => 'required|integer|min:0',
            'disponibilidad_horaria' => 'required|string|max:500',
            'grado_academico'        => 'required|string|max:255',
            'materias'               => 'required|array|min:1',
            'materias.*'             => 'required|integer|exists:materia,id_materia',
        ], [
            'nombre.required'                 => 'El nombre es obligatorio.',
            'apellido.required'               => 'El apellido es obligatorio.',
            'correo.required'                 => 'El correo es obligatorio.',
            'correo.email'                    => 'Ingrese un correo válido.',
            'ci.required'                     => 'El CI es obligatorio.',
            'profesion.required'              => 'La profesión es obligatoria.',
            'experiencia_anios.required'      => 'La experiencia es obligatoria.',
            'experiencia_anios.integer'       => 'La experiencia debe ser un número entero.',
            'experiencia_anios.min'           => 'La experiencia no puede ser negativa.',
            'disponibilidad_horaria.required' => 'La disponibilidad horaria es obligatoria.',
            'grado_academico.required'        => 'El grado académico es obligatorio.',
            'materias.required'               => 'Debe seleccionar al menos una materia.',
            'materias.min'                    => 'Debe seleccionar al menos una materia.',
            'materias.*.exists'               => 'Una de las materias seleccionadas no existe.',
        ]);

        // Validar documentos
        $request->validate([
            'documentos'             => 'required|array|min:1',
            'documentos.*'           => 'required|file|mimes:pdf,doc,docx|max:20480',
        ], [
            'documentos.required'    => 'Debe subir al menos un documento.',
            'documentos.*.mimes'     => 'Solo se aceptan archivos PDF, DOC y DOCX.',
            'documentos.*.max'       => 'Cada archivo debe pesar máximo 20 MB.',
        ]);

        // 1. Crear la postulación (sin materia_postulada)
        $postulacion = PostulacionDocente::create([
            'nombre'                 => $validated['nombre'],
            'apellido'               => $validated['apellido'],
            'correo'                 => $validated['correo'],
            'telefono'               => $validated['telefono'] ?? null,
            'ci'                     => $validated['ci'],
            'profesion'              => $validated['profesion'],
            'experiencia_anios'      => $validated['experiencia_anios'],
            'disponibilidad_horaria' => $validated['disponibilidad_horaria'],
            'grado_academico'        => $validated['grado_academico'],
            'estado_postulacion'     => 'Pendiente',
            'fecha_postulacion'      => now(),
        ]);

        // 2. Guardar materias seleccionadas en la tabla intermedia (sin columna id)
        foreach ($validated['materias'] as $idMateria) {
            DB::table('postulacion_docente_materia')->insert([
                'id_postulacion_docente' => $postulacion->id,
                'id_materia'             => $idMateria,
            ]);
        }

        // 3. Crear checks iniciales de requisitos
        $requisitosActivos = RequisitoDocente::where('estado', 'Activo')->get();
        foreach ($requisitosActivos as $requisito) {
            DB::table('postulacion_docente_requisito')->insert([
                'id_postulacion_docente' => $postulacion->id,
                'id_requisito'           => $requisito->id,
                'estado'                 => 'Pendiente',
            ]);
        }

        // 4. Subir documentos a Supabase Storage y guardar en BD
        $supabaseService = new SupabaseStorageService();
        $documentosSubidos = [];

        foreach ($request->file('documentos') as $archivo) {
            $tipoDocumento = pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME);
            $tipoDocumento = str_replace(' ', '_', $tipoDocumento);

            try {
                $resultado = $supabaseService->subir($archivo, $postulacion->id, $tipoDocumento);

                DocumentoPostulacionDocente::create([
                    'id_postulacion_docente' => $postulacion->id,
                    'tipo_documento'         => $tipoDocumento,
                    'nombre_archivo'         => $resultado['nombre_archivo'],
                    'ruta_archivo'           => $resultado['ruta_archivo'],
                    'mime_type'              => $resultado['mime_type'],
                    'tamanio'                => $resultado['tamanio'],
                    'fecha_subida'           => now(),
                ]);

                $documentosSubidos[] = $resultado;
            } catch (\Exception $e) {
                Log::error('Error al subir documento de postulación docente.', [
                    'id_postulacion' => $postulacion->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // 5. Enviar correo de confirmación por Resend
        try {
            $resendService = new ResendEmailService();
            $nombreCompleto = e($validated['nombre'] . ' ' . $validated['apellido']);

            $html = <<<HTML
            <h1>Postulación Docente Recibida</h1>
            <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
            <p>Hemos recibido tu postulación docente para el <strong>Curso Preuniversitario FICCT</strong>.</p>
            <p><strong>Estado actual:</strong> Pendiente</p>
            <p>Recibirás notificaciones por correo cuando el estado de tu postulación cambie.</p>
            <p>Si no ves respuestas en tu bandeja de entrada, revisa la carpeta de <strong>Spam / Correo no deseado</strong>.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Curso Preuniversitario FICCT - Facultad de Ciencias de la Computación y Telecomunicaciones</p>
            HTML;

            $resendService->enviar(
                $validated['correo'],
                'Postulación docente recibida - CUP FICCT',
                $html
            );
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar el correo de confirmación de postulación.', [
                'error' => $e->getMessage(),
                'id_postulacion' => $postulacion->id,
            ]);
        }

        // Registrar en bitácora
        BitacoraService::registrar(
            "Postulación docente registrada - {$validated['nombre']} {$validated['apellido']}",
            null,
            'postulacion_docente'
        );

        return redirect()->route('postulacion.docente.create')->with('success', 'Postulación registrada correctamente. Revise su correo para el seguimiento.');
    }
}
