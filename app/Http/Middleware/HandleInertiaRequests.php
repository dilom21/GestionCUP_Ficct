<?php

namespace App\Http\Middleware;

use App\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $permisos = Rol::expandirPermisosLegacy(
            $request->session()->get('usuario_permisos', [])
        );

        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'auth' => [
                'user' => $request->user(),
                'usuario_id'         => $request->session()->get('usuario_id'),
                'usuario_nombre'     => $request->session()->get('usuario_nombre'),
                'usuario_correo'     => $request->session()->get('usuario_correo'),
                'usuario_rol_id'     => $request->session()->get('usuario_rol_id'),
                'usuario_rol_nombre' => $request->session()->get('usuario_rol_nombre'),
                'usuario_permisos'   => $permisos,
            ],
        ];
    }
}
