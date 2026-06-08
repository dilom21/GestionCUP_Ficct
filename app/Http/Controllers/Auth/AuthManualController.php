<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthManualController extends Controller
{
    /**
     * Mostrar la vista de inicio de sesión.
     */
    public function mostrarLogin()
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Procesar el inicio de sesión.
     */
    public function iniciarSesion(Request $request)
    {
        // 1. Validar campos requeridos
        $request->validate([
            'correo'    => 'required|string',
            'password'  => 'required|string',
        ], [
            'correo.required'   => 'El correo es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $correo  = $request->input('correo');
        $password = $request->input('password');

        // 2. Buscar usuario por correo
        $usuario = User::where('correo', $correo)->first();

        if (!$usuario) {
            return back()->withErrors([
                'correo' => 'Las credenciales no coinciden con nuestros registros.',
            ])->onlyInput('correo');
        }

        // 3. Verificar estado = Activo
        if ($usuario->estado !== 'Activo') {
            return back()->withErrors([
                'correo' => 'Tu cuenta no está activa. Contacta al administrador.',
            ])->onlyInput('correo');
        }

        // 4. Verificar password con Hash::check()
        if (!Hash::check($password, $usuario->password)) {
            return back()->withErrors([
                'correo' => 'Las credenciales no coinciden con nuestros registros.',
            ])->onlyInput('correo');
        }

        // 5. Obtener rol y verificar que no sea Postulante
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

        // 6. Obtener permisos del rol
        $permisos = $rol->getPermisosArray();

        // 7. Guardar datos en sesión (incluyendo permisos)
        session([
            'usuario_id'         => $usuario->id,
            'usuario_nombre'     => $usuario->nombre . ' ' . $usuario->apellidos,
            'usuario_correo'     => $usuario->correo,
            'usuario_rol_id'     => $rol->id,
            'usuario_rol_nombre' => $rol->nombre,
            'usuario_permisos'   => $permisos,
        ]);

        session()->regenerate();

        // 7. Redirigir según rol
        return redirect()->intended($this->redirigirSegunRol($rol->nombre));
    }

    /**
     * Cerrar sesión.
     */
    public function cerrarSesion(Request $request)
    {
        session()->flush();
        session()->regenerate();

        return redirect('/login');
    }

    /**
     * Determinar la ruta de redirección según el nombre del rol.
     */
    private function redirigirSegunRol(string $rolNombre): string
    {
        return match (strtolower($rolNombre)) {
            'administrador'        => '/admin/dashboard',
            'administrativo'       => '/administrativo/dashboard',
            'docente'              => '/docente/dashboard',
            'director de carrera'  => '/director/dashboard',
            default                => '/login',
        };
    }
}
