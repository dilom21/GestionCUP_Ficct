<?php

namespace App\Http\Middleware;

use App\Models\Rol;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarPermiso
{
    public function handle(Request $request, Closure $next, string ...$permisos): Response
    {
        if ($request->session()->get('usuario_rol_nombre') === 'Administrador') {
            return $next($request);
        }

        $permisosUsuario = Rol::expandirPermisosLegacy(
            $request->session()->get('usuario_permisos', [])
        );

        foreach ($permisos as $permiso) {
            if (in_array($permiso, $permisosUsuario, true)) {
                return $next($request);
            }
        }

        abort(403, 'No tienes permisos para acceder a esta funcionalidad.');
    }
}
