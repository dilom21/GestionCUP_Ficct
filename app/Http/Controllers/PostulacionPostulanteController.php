<?php

namespace App\Http\Controllers;

use App\Models\Postulante;
use App\Models\Postulacion;
use App\Models\PostulacionRequisito;
use App\Models\Carrera;
use App\Models\Requisito;
use App\Models\DocumentoPostulacionPostulante;
use App\Services\ResendEmailService;
use App\Services\SupabaseStorageService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostulacionPostulanteController extends Controller
{
    public function create(Request $request)
    {
        $carreras = Carrera::orderBy('nombre')
            ->get(['id_carrera as id', 'nombre', 'sigla']);
        $requisitos = Requisito::where('estado', 'Activo')->get();

        $paymentData = null;
        $paymentSuccess = null;
        $idPostulacion = $request->query('id');
        $token = $request->query('token');

        if ($request->query('status') === 'success' && $idPostulacion) {
            $postulacion = Postulacion::with(['postulante', 'carrera1', 'carrera2'])
                ->find($idPostulacion);
            if ($postulacion) {
                $paymentSuccess = [
                    'id' => $postulacion->id,
                    'nombre' => $postulacion->postulante?->nombre ?? '',
                    'nro_formulario' => $postulacion->nro_formulario,
                    'estado' => $postulacion->estado_postulacion,
                    'session_id' => $request->query('session_id', ''),
                ];
            }
        } elseif ($idPostulacion && $token) {
            $postulacion = Postulacion::with(['postulante', 'carrera1', 'carrera2'])
                ->find($idPostulacion);
            if ($postulacion && $postulacion->token_pago && $postulacion->token_pago === $token && $postulacion->estado_postulacion === 'Pago') {
                $paymentData = [
                    'id' => $postulacion->id,
                    'token' => $token,
                    'nombre' => $postulacion->postulante?->nombre ?? '',
                    'nro_formulario' => $postulacion->nro_formulario,
                    'carrera1' => $postulacion->carrera1?->nombre ?? '',
                    'carrera2' => $postulacion->carrera2?->nombre ?? '',
                ];
            }
        }

        return Inertia::render('Preinscripcion/Create', [
            'carreras' => $carreras,
            'requisitos' => $requisitos,
            'paymentData' => $paymentData,
            'paymentSuccess' => $paymentSuccess,
        ]);
    }

    public function store(Request $request)
    {
        set_time_limit(180);

        // Validar datos del postulante
        $validated = $request->validate([
            'nombre'              => 'required|string|max:255',
            'apellidos'           => 'required|string|max:255',
            'correo'              => 'required|email|max:255',
            'telefono'            => 'nullable|string|max:50',
            'ci'                  => 'required|string|max:50|unique:postulante,ci',
            'fecha_nacimiento'    => 'required|date',
            'sexo'                => 'required|in:M,F',
            'direccion'           => 'nullable|string|max:500',
            'colegio_procedencia' => 'nullable|string|max:255',
            'ciudad'              => 'required|string|max:255',
            'id_carrera_opcion_1' => 'required|integer|exists:carrera,id_carrera',
            'id_carrera_opcion_2' => 'required|integer|exists:carrera,id_carrera|different:id_carrera_opcion_1',
        ], [
            'nombre.required'                => 'El nombre es obligatorio.',
            'apellidos.required'             => 'Los apellidos son obligatorios.',
            'correo.required'                => 'El correo es obligatorio.',
            'correo.email'                   => 'Ingrese un correo válido.',
            'ci.required'                    => 'El CI es obligatorio.',
            'ci.unique'                      => 'Este CI ya está registrado como postulante.',
            'fecha_nacimiento.required'      => 'La fecha de nacimiento es obligatoria.',
            'sexo.required'                  => 'El sexo es obligatorio.',
            'ciudad.required'                => 'La ciudad es obligatoria.',
            'id_carrera_opcion_1.required'   => 'La carrera opción 1 es obligatoria.',
            'id_carrera_opcion_2.required'   => 'La carrera opción 2 es obligatoria.',
            'id_carrera_opcion_2.different'  => 'La opción 2 debe ser diferente a la opción 1.',
        ]);

        // Validar documentos
        $request->validate([
            'documentos'           => 'required|array|min:1',
            'documentos.*'         => 'required|file|mimes:pdf,doc,docx|max:20480',
        ], [
            'documentos.required'  => 'Debe subir al menos un documento.',
            'documentos.*.mimes'   => 'Solo se aceptan archivos PDF, DOC y DOCX.',
            'documentos.*.max'     => 'Cada archivo debe pesar máximo 20 MB.',
        ]);

        // Crear postulante
        $postulante = Postulante::create([
            'nombre'              => $validated['nombre'],
            'apellidos'           => $validated['apellidos'],
            'correo'              => $validated['correo'],
            'telefono'            => $validated['telefono'] ?? null,
            'ci'                  => $validated['ci'],
            'fecha_nacimiento'    => $validated['fecha_nacimiento'],
            'sexo'                => $validated['sexo'],
            'direccion'           => $validated['direccion'] ?? null,
            'colegio_procedencia' => $validated['colegio_procedencia'] ?? null,
            'ciudad'              => $validated['ciudad'],
            'estado_postulante'   => 'Activo',
        ]);

        // Generar nro_formulario
        $nroFormulario = 'CUP-' . now()->format('Ymd') . '-' . str_pad(Postulacion::count() + 1, 4, '0', STR_PAD_LEFT);

        // Crear postulación
        $postulacion = Postulacion::create([
            'id_postulante'       => $postulante->id_postulante,
            'id_carrera_opcion_1' => $validated['id_carrera_opcion_1'],
            'id_carrera_opcion_2' => $validated['id_carrera_opcion_2'],
            'fecha_postulacion'   => now(),
            'nro_formulario'      => $nroFormulario,
            'estado_postulacion'  => 'Pendiente',
        ]);

        // Crear checks de requisitos
        $requisitosActivos = Requisito::where('estado', 'Activo')->get();
        foreach ($requisitosActivos as $req) {
            DB::table('postulacion_requisito')->insert([
                'id_postulacion' => $postulacion->id,
                'id_requisito'   => $req->id,
                'estado_requisito' => 'Pendiente',
            ]);
        }

        // Subir documentos a Supabase Storage
        $supabaseService = new SupabaseStorageService();
        foreach ($request->file('documentos') as $archivo) {
            $tipoDocumento = str_replace(' ', '_', pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME));
            try {
                $resultado = $supabaseService->subirPostulante($archivo, $postulacion->id, $tipoDocumento);
                DocumentoPostulacionPostulante::create([
                    'id_postulacion' => $postulacion->id,
                    'tipo_documento' => $tipoDocumento,
                    'nombre_archivo' => $resultado['nombre_archivo'],
                    'ruta_archivo'   => $resultado['ruta_archivo'],
                    'mime_type'      => $resultado['mime_type'],
                    'tamanio'        => $resultado['tamanio'],
                    'fecha_subida'   => now(),
                ]);
            } catch (\Exception $e) {
                Log::error('Error al subir documento de postulante.', [
                    'id_postulacion' => $postulacion->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Enviar correo de confirmación
        try {
            $resendService = new ResendEmailService();
            $nombreCompleto = e($validated['nombre'] . ' ' . $validated['apellidos']);
            $html = <<<HTML
            <h1>Postulación Recibida</h1>
            <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
            <p>Hemos recibido tu postulación al <strong>Curso Preuniversitario FICCT</strong>.</p>
            <p><strong>Número de formulario:</strong> {$nroFormulario}</p>
            <p><strong>Estado actual:</strong> Pendiente</p>
            <p>Recibirás notificaciones por correo cuando el estado de tu postulación cambie.</p>
            <p>Si no ves respuestas, revisa Spam / Correo no deseado.</p>
            <hr>
            <p style="color:#666;font-size:12px;">Curso Preuniversitario FICCT - Facultad de Ciencias de la Computación y Telecomunicaciones</p>
            HTML;
            $resendService->enviar($validated['correo'], 'Postulación recibida - CUP FICCT', $html);
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar correo de confirmación.', ['error' => $e->getMessage()]);
        }

        BitacoraService::registrar(
            "Postulación de postulante registrada - {$validated['nombre']} {$validated['apellidos']}",
            null,
            'postulacion'
        );

        return redirect()->route('preinscripcion.show', $postulacion->id)
            ->with('success', 'Postulación registrada correctamente.');
    }

    public function show($id)
    {
        $postulacion = Postulacion::with([
            'postulante',
            'carrera1',
            'carrera2',
            'documentos',
            'requisitos.requisito',
        ])->findOrFail($id);

        return Inertia::render('Preinscripcion/Show', [
            'postulacion' => $postulacion,
        ]);
    }
}
