<?php

use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\DocenteController;
use App\Http\Controllers\Admin\PostulanteGestionController;
use App\Http\Controllers\Admin\PostulacionDocenteRevisionController;
use App\Http\Controllers\Admin\PostulacionPostulanteRevisionController;
use App\Http\Controllers\Auth\AuthManualController;
use App\Http\Controllers\Auth\PasswordResetManualController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\Financiero\PagoController;
use App\Http\Controllers\Materias\MateriaController;
use App\Http\Controllers\PostulacionDocenteController;
use App\Http\Controllers\PostulacionPostulanteController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UsuarioController;
use App\Models\DocumentoPostulacionDocente;
use App\Models\DocumentoPostulacionPostulante;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
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

    Route::get('/forgot-password', [PasswordResetManualController::class, 'showForgotPassword'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetManualController::class, 'sendResetLink'])
        ->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetManualController::class, 'showResetPassword'])
        ->name('password.reset');
    Route::post('/reset-password', [PasswordResetManualController::class, 'resetPassword'])
        ->name('password.update');
});

Route::get('/postulacion-docente', [PostulacionDocenteController::class, 'create'])->name('postulacion.docente.create');
Route::post('/postulacion-docente', [PostulacionDocenteController::class, 'store'])->name('postulacion.docente.store');

Route::get('/preinscripcion', [PostulacionPostulanteController::class, 'create'])->name('preinscripcion.create');
Route::post('/preinscripcion', [PostulacionPostulanteController::class, 'store'])->name('preinscripcion.store');
Route::get('/preinscripcion/pago/{id}', function (Illuminate\Http\Request $request, $id) {
    $token = $request->query('token');
    $query = $token ? '?token=' . urlencode($token) : '';
    return redirect('/preinscripcion?id=' . $id . $query);
})->name('preinscripcion.pago');
Route::get('/preinscripcion/{id}', [PostulacionPostulanteController::class, 'show'])->name('preinscripcion.show');

Route::post('/logout', [AuthManualController::class, 'cerrarSesion'])->name('logout');

Route::post('/stripe/webhook', [PagoController::class, 'handleWebhook'])->name('stripe.webhook');


/*
|--------------------------------------------------------------------------
| Paneles según rol (protegidos por middleware de sesión)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.sesion')->group(function () {
    Route::get('/admin/bitacora', [BitacoraController::class, 'index'])->name('admin.bitacora');

    // Docentes - gestión de perfiles
    Route::get('/admin/docentes', [DocenteController::class, 'index'])->name('admin.docentes.index');
    Route::post('/admin/docentes', [DocenteController::class, 'store'])->name('admin.docentes.store');
    Route::match(['put', 'patch'], '/admin/docentes/{id}', [DocenteController::class, 'update'])->name('admin.docentes.update');
    Route::post('/admin/docentes/{id}/cambiar-estado', [DocenteController::class, 'cambiarEstado'])->name('admin.docentes.cambiar-estado');

    // Postulantes - gestión de perfiles (solo los que completaron el proceso)
    Route::get('/admin/postulantes-gestion', [PostulanteGestionController::class, 'index'])->name('admin.postulantes.gestion');
    Route::match(['put', 'patch'], '/admin/postulantes-gestion/{id}', [PostulanteGestionController::class, 'update'])->name('admin.postulantes.gestion.update');
    Route::post('/admin/postulantes-gestion/{id}/cambiar-estado', [PostulanteGestionController::class, 'cambiarEstado'])->name('admin.postulantes.gestion.cambiar-estado');

    // Postulaciones docentes - revisión administrativa
    Route::get('/admin/postulaciones-docentes', [PostulacionDocenteRevisionController::class, 'index'])->name('admin.postulaciones.docentes');
    Route::get('/admin/postulaciones-docentes/{id}', [PostulacionDocenteRevisionController::class, 'show'])->name('admin.postulaciones.docentes.show');
    Route::post('/admin/postulaciones-docentes/{id}/guardar-revision', [PostulacionDocenteRevisionController::class, 'guardarRevision'])->name('admin.postulaciones.docentes.guardar-revision');
    Route::post('/admin/postulaciones-docentes/{id}/cambiar-estado', [PostulacionDocenteRevisionController::class, 'cambiarEstado'])->name('admin.postulaciones.docentes.cambiar-estado');

    Route::get('/admin/postulaciones-postulantes', [PostulacionPostulanteRevisionController::class, 'index'])->name('admin.postulaciones.postulantes');
    Route::get('/admin/postulaciones-postulantes/{id}', [PostulacionPostulanteRevisionController::class, 'show'])->name('admin.postulaciones.postulantes.show');
    Route::post('/admin/postulaciones-postulantes/{id}/guardar-revision', [PostulacionPostulanteRevisionController::class, 'guardarRevision'])->name('admin.postulaciones.postulantes.guardar-revision');
    Route::post('/admin/postulaciones-postulantes/{id}/cambiar-estado', [PostulacionPostulanteRevisionController::class, 'cambiarEstado'])->name('admin.postulaciones.postulantes.cambiar-estado');

    Route::get('/admin/postulaciones-postulantes/documentos/{documento}/descargar', function (Request $request, DocumentoPostulacionPostulante $documento) {
        try {
            $storageService = new SupabaseStorageService();
            $archivo = $storageService->descargarPostulante($documento->ruta_archivo);
        } catch (\Throwable) {
            abort(404, 'El archivo no está disponible.');
        }
        $nombre = str_replace('"', '', $documento->nombre_archivo);
        return response($archivo->body(), 200, [
            'Content-Type' => $documento->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.$nombre.'"',
        ]);
    })->name('admin.postulaciones.postulantes.descargar');

    Route::get('/admin/postulaciones-docentes/documentos/{documento}/descargar', function (Request $request, DocumentoPostulacionDocente $documento) {
        try {
            $storageService = new SupabaseStorageService();
            $archivo = $storageService->descargar($documento->ruta_archivo);
        } catch (\Throwable) {
            abort(404, 'El archivo no está disponible.');
        }
        $disposition = $request->boolean('inline') ? 'inline' : 'attachment';
        $nombre = str_replace('"', '', $documento->nombre_archivo);
        return response($archivo->body(), 200, [
            'Content-Type' => $documento->mime_type ?: 'application/octet-stream',
            'Content-Length' => strlen($archivo->body()),
            'Content-Disposition' => $disposition.'; filename="'.$nombre.'"',
        ]);
    })->name('admin.postulaciones.docentes.descargar');

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
    Route::get('/materias', [MateriaController::class, 'index'])->name('materias.index');
    Route::post('/materias', [MateriaController::class, 'store'])->name('materias.store');
    Route::put('/materias/{materium}', [MateriaController::class, 'update'])->name('materias.update');
    Route::delete('/materias/{materium}', [MateriaController::class, 'destroy'])->name('materias.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU10: Gestionar Pagos - Stripe Checkout
    |--------------------------------------------------------------------------
    */
    Route::prefix('financiero')->group(function () {
        Route::get('/pagos', [PagoController::class, 'index'])->name('pagos.index');
    });
});

Route::post('/financiero/pago/crear-sesion', [PagoController::class, 'createCheckoutSession'])->name('pago.crear-sesion');
Route::get('/financiero/pago/exito', [PagoController::class, 'pagoExito'])->name('pago.exito');
Route::get('/financiero/pago/cancelado', [PagoController::class, 'pagoCancelado'])->name('pago.cancelado');