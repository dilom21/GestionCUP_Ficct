<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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

        return $next($request);
    }
}