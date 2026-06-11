<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rol;
use App\Services\BitacoraService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthManualController extends Controller
{
    private const MAX_INTENTOS_SIN_BLOQUEO = 3;
    private const BLOQUEO_4 = 1;    // 1 minuto
    private const BLOQUEO_5 = 5;    // 5 minutos
    private const BLOQUEO_6_MAS = 15; // 15 minutos

    public function mostrarLogin()
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'bloqueado_hasta' => session('bloqueado_hasta'),
        ]);
    }

    public function iniciarSesion(Request $request)
    {
        // 1. Validar campos
        $request->validate([
            'correo'    => 'required|string',
            'password'  => 'required|string',
        ], [
            'correo.required'   => 'El correo es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $correo   = $request->input('correo');
        $password = $request->input('password');

        // 2. Buscar usuario
        $usuario = User::where('correo', $correo)->first();

        if (!$usuario) {
            return back()->withErrors([
                'correo' => 'Las credenciales no coinciden con nuestros registros.',
            ])->onlyInput('correo');
        }

        // 3. Verificar si está bloqueado por intentos
        if ($usuario->bloqueado_hasta && Carbon::parse($usuario->bloqueado_hasta)->greaterThan(now())) {
            $minutosRestantes = ceil(
                Carbon::parse($usuario->bloqueado_hasta)->diffInMinutes(now())
            );
            return back()->withErrors([
                'correo' => "Demasiados intentos fallidos. Intenta de nuevo en {$minutosRestantes} minuto(s).",
            ])->onlyInput('correo');
        }

        // 4. Verificar estado
        if ($usuario->estado !== 'Activo') {
            return back()->withErrors([
                'correo' => 'Tu cuenta no está activa. Contacta al administrador.',
            ])->onlyInput('correo');
        }

        // 5. Verificar contraseña
        if (!Hash::check($password, $usuario->password)) {
            // Incrementar intentos fallidos
            $usuario->increment('intentos_fallidos');

            $intentos = $usuario->intentos_fallidos;
            if ($intentos > self::MAX_INTENTOS_SIN_BLOQUEO) {
                $minutosBloqueo = match (true) {
                    $intentos === 4       => self::BLOQUEO_4,
                    $intentos === 5       => self::BLOQUEO_5,
                    default               => self::BLOQUEO_6_MAS,
                };
                $usuario->bloqueado_hasta = now()->addMinutes($minutosBloqueo);
                $usuario->save();

                session()->flash('bloqueado_hasta', $usuario->bloqueado_hasta->toIso8601String());

                return back()->withErrors([
                    'correo' => "Credenciales incorrectas. Cuenta bloqueada por {$minutosBloqueo} minuto(s).",
                ])->onlyInput('correo');
            }

            $usuario->save();

            return back()->withErrors([
                'correo' => 'Las credenciales no coinciden con nuestros registros.',
            ])->onlyInput('correo');
        }

        // 6. Login exitoso → resetear contadores
        $usuario->intentos_fallidos = 0;
        $usuario->bloqueado_hasta = null;
        $usuario->save();

        // 7. Obtener rol
        $rol = Rol::find($usuario->id_rol);

        if (!$rol) {
            return back()->withErrors([
                'correo' => 'Error: rol no asignado. Contacta al administrador.',
            ])->onlyInput('correo');
        }

        if (strtolower($rol->nombre) === 'postulante') {
            return back()->withErrors([
                'correo' => 'Los postulantes no pueden acceder al panel institucional.',
            ])->onlyInput('correo');
        }

        // Obtener permisos del rol
        $permisos = $rol->getPermisosArray();

        // Guardar datos en sesión (incluyendo permisos)
        session([
            'usuario_id'         => $usuario->id,
            'usuario_nombre'     => $usuario->nombre . ' ' . $usuario->apellidos,
            'usuario_correo'     => $usuario->correo,
            'usuario_rol_id'     => $rol->id,
            'usuario_rol_nombre' => $rol->nombre,
            'usuario_permisos'   => $permisos,
        ]);

        session()->regenerate();

        BitacoraService::registrar(
            'Inicio de sesión exitoso',
            $usuario->id,
            'usuario'
        );

        // 9. Redirigir según rol
        return redirect()->intended($this->redirigirSegunRol($rol->nombre));
    }

    public function cerrarSesion(Request $request)
    {
        BitacoraService::registrar(
            'Cierre de sesión',
            session('usuario_id'),
            'usuario'
        );

        session()->flush();
        session()->regenerate();
        return redirect('/login');
    }

    private function redirigirSegunRol(string $rolNombre): string
    {
        return '/panel';
    }
}