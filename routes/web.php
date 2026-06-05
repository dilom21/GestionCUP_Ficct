<?php

use App\Http\Controllers\Auth\AuthManualController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Ruta pública - Landing page
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => true,
        'canRegister' => false,
        'gestion' => 'Gestión 1 - 2026',
    ]);
});

/*
|--------------------------------------------------------------------------
| Autenticación manual con tabla usuario (CU1)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthManualController::class, 'mostrarLogin'])->name('login');
    Route::post('/login', [AuthManualController::class, 'iniciarSesion']);
});

Route::post('/logout', [AuthManualController::class, 'cerrarSesion'])->name('logout');

/*
|--------------------------------------------------------------------------
| Paneles según rol (protegidos por middleware de sesión)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.sesion')->group(function () {
    Route::get('/admin/dashboard', function () {
        if (session('usuario_rol_nombre') !== 'Administrador') {
            return redirect('/login');
        }
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/administrativo/dashboard', function () {
        if (session('usuario_rol_nombre') !== 'Administrativo') {
            return redirect('/login');
        }
        return Inertia::render('Administrativo/Dashboard');
    })->name('administrativo.dashboard');

    Route::get('/docente/dashboard', function () {
        if (session('usuario_rol_nombre') !== 'Docente') {
            return redirect('/login');
        }
        return Inertia::render('Docente/Dashboard');
    })->name('docente.dashboard');

    Route::get('/director/dashboard', function () {
        if (session('usuario_rol_nombre') !== 'Director de Carrera') {
            return redirect('/login');
        }
        return Inertia::render('Director/Dashboard');
    })->name('director.dashboard');
});
