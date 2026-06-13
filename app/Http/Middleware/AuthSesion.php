<?php

namespace App\Http\Middleware;

use App\Models\Rol;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class AuthSesion
{
    /**
     * Handle an incoming request.
     * Verifica que la sesión tenga usuario_id (está autenticado con sesión manual).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('usuario_id')) {
            return redirect('/login');
        }

        $rolId = (int) $request->session()->get('usuario_rol_id');

        if ($rolId > 0) {
            $datosRol = Cache::remember(
                "rol:{$rolId}:sesion",
                now()->addHour(),
                function () use ($rolId) {
                    $rol = Rol::find($rolId);

                    return $rol ? [
                        'nombre' => $rol->nombre,
                        'permisos' => $rol->getPermisosArray(),
                    ] : null;
                }
            );

            if ($datosRol) {
                $request->session()->put([
                    'usuario_rol_nombre' => $datosRol['nombre'],
                    'usuario_permisos' => $datosRol['permisos'],
                ]);
            }
        }

        return $next($request);
    }
}
