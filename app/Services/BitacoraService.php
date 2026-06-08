<?php

namespace App\Services;

use App\Models\Bitacora;
use Illuminate\Support\Facades\Log;

class BitacoraService
{
    public static function registrar(string $accion, ?int $idUsuario = null, ?string $tablaAfectada = null): void
    {
        $request = request();
        $ip = $request->ip() ?? '127.0.0.1';

        if (!$idUsuario) {
            $idUsuario = session('usuario_id');
        }

        if (!$idUsuario) {
            return;
        }

        try {
            Bitacora::create([
                'accion' => $accion,
                'fecha_hora' => now(),
                'ip' => $ip,
                'id_usuario' => $idUsuario,
                'tabla_afectada' => $tablaAfectada ?? 'N/A',
            ]);
        } catch (\Throwable $exception) {
            Log::warning('No se pudo registrar una operación en la bitácora.', [
                'accion' => $accion,
                'id_usuario' => $idUsuario,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
