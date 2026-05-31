<?php

namespace App\Http\Middleware;

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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'usuario_id'        => $request->session()->get('usuario_id'),
                'usuario_nombre'    => $request->session()->get('usuario_nombre'),
                'usuario_correo'    => $request->session()->get('usuario_correo'),
                'usuario_rol_id'    => $request->session()->get('usuario_rol_id'),
                'usuario_rol_nombre' => $request->session()->get('usuario_rol_nombre'),
            ],
        ];
    }
}
