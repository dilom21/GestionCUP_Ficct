<?php

use App\Http\Controllers\Auth\AuthManualController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\CarreraController;
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

    /*
    |--------------------------------------------------------------------------
    | CU02: Gestión de Usuarios y Roles
    |--------------------------------------------------------------------------
    */
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{rol}', [RolController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{rol}', [RolController::class, 'destroy'])->name('roles.destroy');
    Route::get('/roles/{rol}/funciones', [RolController::class, 'getFunciones'])->name('roles.funciones');

    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU04: Gestión de Carreras
    |--------------------------------------------------------------------------
    */
    Route::get('/carreras', [CarreraController::class, 'index'])->name('carreras.index');
    Route::post('/carreras', [CarreraController::class, 'store'])->name('carreras.store');
    Route::put('/carreras/{carrera}', [CarreraController::class, 'update'])->name('carreras.update');
    Route::delete('/carreras/{carrera}', [CarreraController::class, 'destroy'])->name('carreras.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU06: Gestión de Materias
    |--------------------------------------------------------------------------
    */
    Route::get('/materias', [App\Http\Controllers\Materias\MateriaController::class, 'index'])->name('materias.index');
    Route::post('/materias', [App\Http\Controllers\Materias\MateriaController::class, 'store'])->name('materias.store');
    Route::put('/materias/{materium}', [App\Http\Controllers\Materias\MateriaController::class, 'update'])->name('materias.update');
    Route::delete('/materias/{materium}', [App\Http\Controllers\Materias\MateriaController::class, 'destroy'])->name('materias.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU10: Gestionar Pagos - Stripe Checkout
    |--------------------------------------------------------------------------
    */
    Route::prefix('financiero')->group(function () {
        Route::get('/pagos', [App\Http\Controllers\Financiero\PagoController::class, 'index'])
            ->name('pagos.index');

        Route::post('/pago/crear-sesion', [App\Http\Controllers\Financiero\PagoController::class, 'createCheckoutSession'])
            ->name('pago.crear-sesion');

        Route::get('/pago/exito', [App\Http\Controllers\Financiero\PagoController::class, 'pagoExito'])
            ->name('pago.exito');

        Route::get('/pago/cancelado', [App\Http\Controllers\Financiero\PagoController::class, 'pagoCancelado'])
            ->name('pago.cancelado');
    });
});
