<?php

use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\PostulacionDocenteRevisionController;
use App\Http\Controllers\Auth\AuthManualController;
use App\Http\Controllers\Auth\PasswordResetManualController;
use App\Http\Controllers\PostulacionDocenteController;
use App\Http\Controllers\PostulacionPostulanteController;
use App\Http\Controllers\Admin\PostulacionPostulanteRevisionController;
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
Route::get('/preinscripcion/pago/{id}', function ($id) {
    $postulacion = \App\Models\Postulacion::with(['postulante', 'carrera1', 'carrera2'])->findOrFail($id);
    return Inertia::render('Preinscripcion/Pago', [
        'postulacion' => $postulacion,
    ]);
})->name('preinscripcion.pago');
Route::get('/preinscripcion/{id}', [PostulacionPostulanteController::class, 'show'])->name('preinscripcion.show');

Route::post('/logout', [AuthManualController::class, 'cerrarSesion'])->name('logout');

/*
|--------------------------------------------------------------------------
| Paneles según rol (protegidos por middleware de sesión)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.sesion')->group(function () {
    Route::get('/admin/bitacora', [BitacoraController::class, 'index'])->name('admin.bitacora');

    // Postulaciones docentes - revisión administrativa
    // Postulantes - revisión administrativa
    Route::get('/admin/postulaciones-postulantes', [PostulacionPostulanteRevisionController::class, 'index'])->name('admin.postulaciones.postulantes');
    Route::get('/admin/postulaciones-postulantes/{id}', [PostulacionPostulanteRevisionController::class, 'show'])->name('admin.postulaciones.postulantes.show');
    Route::post('/admin/postulaciones-postulantes/{id}/guardar-revision', [PostulacionPostulanteRevisionController::class, 'guardarRevision'])->name('admin.postulaciones.postulantes.guardar-revision');
    Route::post('/admin/postulaciones-postulantes/{id}/cambiar-estado', [PostulacionPostulanteRevisionController::class, 'cambiarEstado'])->name('admin.postulaciones.postulantes.cambiar-estado');

    Route::get('/admin/postulaciones-docentes', [PostulacionDocenteRevisionController::class, 'index'])->name('admin.postulaciones.docentes');
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
    Route::get('/admin/postulaciones-docentes/{id}', [PostulacionDocenteRevisionController::class, 'show'])->name('admin.postulaciones.docentes.show');
    Route::post('/admin/postulaciones-docentes/{id}/guardar-revision', [PostulacionDocenteRevisionController::class, 'guardarRevision'])->name('admin.postulaciones.docentes.guardar-revision');
    Route::post('/admin/postulaciones-docentes/{id}/cambiar-estado', [PostulacionDocenteRevisionController::class, 'cambiarEstado'])->name('admin.postulaciones.docentes.cambiar-estado');

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
