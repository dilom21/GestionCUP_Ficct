<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    private string $supabaseUrl;
    private string $serviceRoleKey;
    private string $bucket;
    private const TIPOS_PERMITIDOS = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    private const TAMANIO_MAXIMO = 20 * 1024 * 1024; // 20 MB

    public function __construct()
    {
        $this->supabaseUrl = rtrim(env('SUPABASE_URL'), '/');
        $this->serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');
        $this->bucket = env('SUPABASE_STORAGE_BUCKET');
    }

    /**
     * Subir un archivo al bucket de Supabase Storage.
     *
     * @param UploadedFile $archivo
     * @param int $idPostulacion
     * @param string $tipoDocumento  Ej: 'titulo', 'ci', 'curriculum'
     * @return array{ruta_archivo: string, nombre_archivo: string, mime_type: string, tamanio: int}
     * @throws \Exception
     */
    public function subir(UploadedFile $archivo, int $idPostulacion, string $tipoDocumento): array
    {
        // Validar tipo MIME
        $mimeType = $archivo->getMimeType();
        if (!in_array($mimeType, self::TIPOS_PERMITIDOS, true)) {
            throw new \Exception("Tipo de archivo no permitido: {$mimeType}. Solo se aceptan PDF, DOC y DOCX.");
        }

        // Validar tamaño
        $tamanio = $archivo->getSize();
        if ($tamanio > self::TAMANIO_MAXIMO) {
            $maxMb = self::TAMANIO_MAXIMO / 1024 / 1024;
            throw new \Exception("El archivo excede el tamaño máximo de {$maxMb} MB.");
        }

        // Generar ruta ordenada
        $extension = $archivo->getClientOriginalExtension();
        $timestamp = now()->timestamp;
        $nombreArchivo = "{$tipoDocumento}_{$timestamp}.{$extension}";
        $rutaCompleta = "postulaciones-docentes/{$idPostulacion}/{$nombreArchivo}";

        // Leer contenido del archivo
        $contenido = file_get_contents($archivo->getRealPath());

        // Subir a Supabase Storage
        $url = "{$this->supabaseUrl}/storage/v1/object/{$this->bucket}/{$rutaCompleta}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->serviceRoleKey}",
            'Content-Type' => $mimeType,
        ])->send('PUT', $url, [
            'body' => $contenido,
        ]);

        if ($response->failed()) {
            Log::error('Error al subir archivo a Supabase Storage.', [
                'ruta' => $rutaCompleta,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            throw new \Exception("Error al subir el archivo a Supabase Storage.");
        }

        return [
            'ruta_archivo' => $rutaCompleta,
            'nombre_archivo' => $nombreArchivo,
            'mime_type' => $mimeType,
            'tamanio' => $tamanio,
        ];
    }

    /**
     * Obtener URL pública de un archivo en Supabase Storage.
     */
    public function getUrlPublica(string $rutaArchivo): string
    {
        return "{$this->supabaseUrl}/storage/v1/object/public/{$this->bucket}/{$rutaArchivo}";
    }

    public function descargar(string $rutaArchivo)
    {
        $url = "{$this->supabaseUrl}/storage/v1/object/{$this->bucket}/{$rutaArchivo}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->serviceRoleKey}",
        ])->get($url);

        if ($response->failed()) {
            Log::error('Error al descargar archivo desde Supabase Storage.', [
                'ruta' => $rutaArchivo,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            throw new \Exception('El archivo no está disponible.');
        }

        return $response;
    }
}
