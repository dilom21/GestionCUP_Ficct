<?php

use App\Http\Controllers\Admin\AulaController;
use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\DocenteController;
use App\Http\Controllers\Admin\GrupoController;
use App\Http\Controllers\Admin\HorarioController;
use App\Http\Controllers\Admin\AsignacionAcademicaController;
use App\Http\Controllers\Admin\DocenteMateriaController;
use App\Http\Controllers\Admin\PostulanteGestionController;
use App\Http\Controllers\Docente\AsistenciaController as DocenteAsistenciaController;
use App\Http\Controllers\Postulante\AsistenciaController as PostulanteAsistenciaController;
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

    Route::get('/panel', function () {
        return Inertia::render('Panel/Dashboard');
    })->name('panel.dashboard');
    
    /*
    |--------------------------------------------------------------------------
    | CU13: Gestión de Aulas
    |--------------------------------------------------------------------------
    */
    Route::get('/aulas', [AulaController::class, 'index'])->name('aulas.index');
    Route::post('/aulas', [AulaController::class, 'store'])->name('aulas.store');
    Route::put('/aulas/{aula}', [AulaController::class, 'update'])->name('aulas.update');
    Route::delete('/aulas/{aula}', [AulaController::class, 'destroy'])->name('aulas.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU11: Gestión de Grupos
    |--------------------------------------------------------------------------
    */
    Route::get('/grupos', [GrupoController::class, 'index'])->name('grupos.index');
    Route::post('/grupos', [GrupoController::class, 'store'])->name('grupos.store');
    Route::put('/grupos/{grupo}', [GrupoController::class, 'update'])->name('grupos.update');
    Route::delete('/grupos/{grupo}', [GrupoController::class, 'destroy'])->name('grupos.destroy');
    Route::post('/grupos/generar', [GrupoController::class, 'generar'])->name('grupos.generar');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Asignación Académica
    |--------------------------------------------------------------------------
    */
    Route::get('/asignaciones-academicas', [AsignacionAcademicaController::class, 'index'])->name('asignaciones.index');
    Route::post('/asignaciones-academicas', [AsignacionAcademicaController::class, 'store'])->name('asignaciones.store');
    Route::get('/docentes-materias', [DocenteMateriaController::class, 'index'])->name('docentes.materias.index');
    Route::post('/docentes-materias', [DocenteMateriaController::class, 'store'])->name('docentes.materias.store');
    Route::delete('/docentes-materias/{idDocente}/{idMateria}', [DocenteMateriaController::class, 'destroy'])->name('docentes.materias.destroy');
    Route::put('/asignaciones-academicas/{asignacionAcademica}', [AsignacionAcademicaController::class, 'update'])->name('asignaciones.update');
    Route::delete('/asignaciones-academicas/{asignacionAcademica}', [AsignacionAcademicaController::class, 'destroy'])->name('asignaciones.destroy');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Horarios
    |--------------------------------------------------------------------------
    */
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horarios.index');
    Route::post('/horarios', [HorarioController::class, 'store'])->name('horarios.store');
    Route::put('/horarios/{horario}', [HorarioController::class, 'update'])->name('horarios.update');
    Route::delete('/horarios/{horario}', [HorarioController::class, 'destroy'])->name('horarios.destroy');

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

    /*
    |--------------------------------------------------------------------------
    | CU15: Asistencia Docente y Estudiante
    |--------------------------------------------------------------------------
    */
    Route::prefix('docente')->group(function () {
        Route::get('/asistencia', [DocenteAsistenciaController::class, 'index'])->name('docente.asistencia.index');
        Route::post('/asistencia/generar-qr', [DocenteAsistenciaController::class, 'generarQr'])->name('docente.asistencia.generar-qr');
        Route::post('/asistencia/generar-pin', [DocenteAsistenciaController::class, 'generarPin'])->name('docente.asistencia.generar-pin');
        Route::post('/asistencia/entrada', [DocenteAsistenciaController::class, 'registrarEntrada'])->name('docente.asistencia.entrada');
        Route::post('/asistencia/salida', [DocenteAsistenciaController::class, 'registrarSalida'])->name('docente.asistencia.salida');
        Route::get('/asistencia/estudiantes', [DocenteAsistenciaController::class, 'obtenerEstudiantes'])->name('docente.asistencia.estudiantes');
        Route::post('/asistencia/registrar-estudiante', [DocenteAsistenciaController::class, 'registrarEstudiante'])->name('docente.asistencia.registrar-estudiante');
    });

    Route::prefix('postulante')->group(function () {
        Route::get('/asistencia', [PostulanteAsistenciaController::class, 'index'])->name('postulante.asistencia.index');
        Route::post('/asistencia/escanear', [PostulanteAsistenciaController::class, 'escanearQr'])->name('postulante.asistencia.escanear');
        Route::post('/asistencia/validar-pin', [PostulanteAsistenciaController::class, 'validarPin'])->name('postulante.asistencia.validar-pin');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin: Asistencia y Control (visor con filtros)
    |--------------------------------------------------------------------------
    */
    Route::get('/admin/asistencia', [\App\Http\Controllers\Admin\AsistenciaController::class, 'index'])->name('admin.asistencia.index');
});

Route::post('/financiero/pago/crear-sesion', [PagoController::class, 'createCheckoutSession'])->name('pago.crear-sesion');
Route::get('/financiero/pago/exito', [PagoController::class, 'pagoExito'])->name('pago.exito');
Route::get('/financiero/pago/cancelado', [PagoController::class, 'pagoCancelado'])->name('pago.cancelado');