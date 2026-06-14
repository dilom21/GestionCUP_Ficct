<?php

use App\Http\Controllers\Admin\AulaController;
use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\DocenteController;
use App\Http\Controllers\Admin\EvaluacionController;
use App\Http\Controllers\Admin\AsignacionCarreraController;
use App\Http\Controllers\Admin\ResultadoAdmisionController;
use App\Http\Controllers\Admin\CupoCarreraController;
use App\Http\Controllers\Admin\ResultadoCupController;
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

Route::get('/trayectoria/{token}', [\App\Http\Controllers\TrayectoriaController::class, 'publica'])->name('trayectoria.publica');

/*
|--------------------------------------------------------------------------
| Paneles según rol (protegidos por middleware de sesión)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.sesion')->group(function () {
    Route::get('/admin/bitacora', [BitacoraController::class, 'index'])->middleware('permiso:bitacora.leer')->name('admin.bitacora');

    // Docentes - gestión de perfiles
    Route::get('/admin/docentes', [DocenteController::class, 'index'])->middleware('permiso:gestion_docentes.leer')->name('admin.docentes.index');
    Route::post('/admin/docentes', [DocenteController::class, 'store'])->middleware('permiso:gestion_docentes.escribir')->name('admin.docentes.store');
    Route::match(['put', 'patch'], '/admin/docentes/{id}', [DocenteController::class, 'update'])->middleware('permiso:gestion_docentes.escribir')->name('admin.docentes.update');
    Route::post('/admin/docentes/{id}/cambiar-estado', [DocenteController::class, 'cambiarEstado'])->middleware('permiso:gestion_docentes.escribir')->name('admin.docentes.cambiar-estado');

    // Postulantes - gestión de perfiles (solo los que completaron el proceso)
    Route::get('/admin/postulantes-gestion', [PostulanteGestionController::class, 'index'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.postulantes.gestion');
    Route::match(['put', 'patch'], '/admin/postulantes-gestion/{id}', [PostulanteGestionController::class, 'update'])->middleware('permiso:postulaciones_postulantes.escribir')->name('admin.postulantes.gestion.update');
    Route::post('/admin/postulantes-gestion/{id}/cambiar-estado', [PostulanteGestionController::class, 'cambiarEstado'])->middleware('permiso:postulaciones_postulantes.escribir')->name('admin.postulantes.gestion.cambiar-estado');

    // Evaluaciones
    Route::get('/admin/evaluaciones', [EvaluacionController::class, 'index'])->middleware('permiso:evaluaciones.leer')->name('admin.evaluaciones.index');
    Route::post('/admin/evaluaciones', [EvaluacionController::class, 'store'])->middleware('permiso:evaluaciones.escribir')->name('admin.evaluaciones.store');
    Route::match(['put', 'patch'], '/admin/evaluaciones/{id}', [EvaluacionController::class, 'update'])->middleware('permiso:evaluaciones.escribir')->name('admin.evaluaciones.update');
    Route::post('/admin/evaluaciones/{id}/cambiar-estado', [EvaluacionController::class, 'cambiarEstado'])->middleware('permiso:evaluaciones.escribir')->name('admin.evaluaciones.cambiar-estado');

    // Resultados CUP
    Route::get('/admin/resultados-cup', [ResultadoCupController::class, 'index'])->middleware('permiso:resultados_cup.leer')->name('admin.resultados-cup.index');
    Route::post('/admin/resultados-cup/{id}/calcular', [ResultadoCupController::class, 'calcular'])->middleware('permiso:resultados_cup.escribir')->name('admin.resultados-cup.calcular');
    Route::post('/admin/resultados-cup/calcular-todos', [ResultadoCupController::class, 'calcularTodos'])->middleware('permiso:resultados_cup.escribir')->name('admin.resultados-cup.calcular-todos');

    // Cupos por Carrera
    Route::get('/admin/cupos-carrera', [CupoCarreraController::class, 'index'])->middleware('permiso:cupos_carrera.leer')->name('admin.cupos-carrera.index');
    Route::post('/admin/cupos-carrera', [CupoCarreraController::class, 'store'])->middleware('permiso:cupos_carrera.escribir')->name('admin.cupos-carrera.store');
    Route::match(['put', 'patch'], '/admin/cupos-carrera/{idGestion}/{idCarrera}', [CupoCarreraController::class, 'update'])->middleware('permiso:cupos_carrera.escribir')->name('admin.cupos-carrera.update');
    Route::post('/admin/cupos-carrera/{idGestion}/{idCarrera}/cambiar-estado', [CupoCarreraController::class, 'cambiarEstado'])->middleware('permiso:cupos_carrera.escribir')->name('admin.cupos-carrera.cambiar-estado');

    // Asignación de Estudiantes a Carrera
    Route::get('/admin/asignacion-carrera', [AsignacionCarreraController::class, 'index'])->middleware('permiso:asignacion_carrera.leer')->name('admin.asignacion-carrera.index');
    Route::post('/admin/asignacion-carrera/ejecutar', [AsignacionCarreraController::class, 'ejecutarAsignacion'])->middleware('permiso:asignacion_carrera.escribir')->name('admin.asignacion-carrera.ejecutar');
    Route::post('/admin/asignacion-carrera/{idResultado}/asignar', [AsignacionCarreraController::class, 'asignarIndividual'])->middleware('permiso:asignacion_carrera.escribir')->name('admin.asignacion-carrera.asignar');

    // Resultados de Admisión
    Route::get('/admin/resultados-admision', [ResultadoAdmisionController::class, 'index'])->middleware('permiso:resultados_admision.leer')->name('admin.resultados-admision.index');

    // Postulaciones docentes - revisión administrativa
    Route::get('/admin/postulaciones-docentes', [PostulacionDocenteRevisionController::class, 'index'])->middleware('permiso:postulaciones_docentes.leer')->name('admin.postulaciones.docentes');
    Route::get('/admin/postulaciones-docentes/{id}', [PostulacionDocenteRevisionController::class, 'show'])->middleware('permiso:postulaciones_docentes.leer')->name('admin.postulaciones.docentes.show');
    Route::post('/admin/postulaciones-docentes/{id}/guardar-revision', [PostulacionDocenteRevisionController::class, 'guardarRevision'])->middleware('permiso:postulaciones_docentes.escribir')->name('admin.postulaciones.docentes.guardar-revision');
    Route::post('/admin/postulaciones-docentes/{id}/cambiar-estado', [PostulacionDocenteRevisionController::class, 'cambiarEstado'])->middleware('permiso:postulaciones_docentes.escribir')->name('admin.postulaciones.docentes.cambiar-estado');

    Route::get('/admin/postulaciones-postulantes', [PostulacionPostulanteRevisionController::class, 'index'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.postulaciones.postulantes');

    // Kanban de postulaciones (ANTES de {id} para que no lo capture como parámetro)
    Route::get('/admin/postulaciones-postulantes/kanban', [\App\Http\Controllers\Admin\PostulacionKanbanController::class, 'index'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.postulaciones.kanban');
    Route::post('/admin/kanban/tablero', [\App\Http\Controllers\Admin\PostulacionKanbanController::class, 'tablero'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.kanban.tablero');
    Route::post('/admin/kanban/mover/{id}', [\App\Http\Controllers\Admin\PostulacionKanbanController::class, 'mover'])->middleware('permiso:postulaciones_postulantes.escribir')->name('admin.kanban.mover');

    Route::post('/admin/postulaciones-postulantes/{id}/guardar-revision', [PostulacionPostulanteRevisionController::class, 'guardarRevision'])->middleware('permiso:postulaciones_postulantes.escribir')->name('admin.postulaciones.postulantes.guardar-revision');
    Route::post('/admin/postulaciones-postulantes/{id}/cambiar-estado', [PostulacionPostulanteRevisionController::class, 'cambiarEstado'])->middleware('permiso:postulaciones_postulantes.escribir')->name('admin.postulaciones.postulantes.cambiar-estado');
    Route::get('/admin/postulaciones-postulantes/{id}', [PostulacionPostulanteRevisionController::class, 'show'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.postulaciones.postulantes.show');

    // Trayectorias
    Route::get('/admin/trayectorias', [\App\Http\Controllers\TrayectoriaController::class, 'adminIndex'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.trayectorias.index');
    Route::post('/admin/trayectorias/buscar', [\App\Http\Controllers\TrayectoriaController::class, 'buscar'])->middleware('permiso:postulaciones_postulantes.leer')->name('admin.trayectorias.buscar');

    Route::get('/admin/reportes', [\App\Http\Controllers\Admin\ReporteController::class, 'index'])->middleware('permiso:reportes.leer')->name('admin.reportes.index');
    Route::post('/admin/reportes/generar', [\App\Http\Controllers\Admin\ReporteController::class, 'generar'])->middleware('permiso:reportes.leer')->name('admin.reportes.generar');
    Route::post('/admin/reportes/exportar/csv', [\App\Http\Controllers\Admin\ReporteController::class, 'exportarCsv'])->middleware('permiso:reportes.escribir')->name('admin.reportes.exportar.csv');
    Route::post('/admin/reportes/exportar/pdf', [\App\Http\Controllers\Admin\ReporteController::class, 'exportarPdf'])->middleware('permiso:reportes.escribir')->name('admin.reportes.exportar.pdf');
    Route::post('/admin/reportes/exportar/excel', [\App\Http\Controllers\Admin\ReporteController::class, 'exportarExcel'])->middleware('permiso:reportes.escribir')->name('admin.reportes.exportar.excel');

    Route::get('/admin/consultavoz/historial', [\App\Http\Controllers\Admin\ConsultaVozController::class, 'historial'])->middleware('permiso:reportes.leer')->name('admin.consultavoz.historial');
    Route::post('/admin/consultavoz/procesar', [\App\Http\Controllers\Admin\ConsultaVozController::class, 'procesar'])->middleware('permiso:reportes.leer')->name('admin.consultavoz.procesar');

    // Explorador CUP
    Route::get('/admin/explorador-cup', [\App\Http\Controllers\Admin\ExploradorCupController::class, 'index'])->middleware('permiso:reportes.leer')->name('admin.explorador-cup.index');
    Route::post('/admin/explorador-cup/datos', [\App\Http\Controllers\Admin\ExploradorCupController::class, 'datos'])->middleware('permiso:reportes.leer')->name('admin.explorador-cup.datos');

    // Sala de Situación
    Route::get('/admin/sala-situacion', [\App\Http\Controllers\Admin\SalaSituacionController::class, 'index'])->middleware('permiso:reportes.leer')->name('admin.sala-situacion.index');
    Route::post('/admin/sala-situacion/estadisticas', [\App\Http\Controllers\Admin\SalaSituacionController::class, 'estadisticas'])->middleware('permiso:reportes.leer')->name('admin.sala-situacion.estadisticas');

    // Notificaciones AJAX
    Route::get('/admin/notificaciones', [\App\Http\Controllers\Admin\NotificacionController::class, 'index'])->middleware('auth.sesion')->name('admin.notificaciones.index');
    Route::get('/admin/notificaciones/no-leidas', [\App\Http\Controllers\Admin\NotificacionController::class, 'noLeidas'])->middleware('auth.sesion')->name('admin.notificaciones.no-leidas');
    Route::post('/admin/notificaciones/{id}/leida', [\App\Http\Controllers\Admin\NotificacionController::class, 'marcarLeida'])->middleware('auth.sesion')->name('admin.notificaciones.marcar-leida');
    Route::post('/admin/notificaciones/todas-leidas', [\App\Http\Controllers\Admin\NotificacionController::class, 'marcarTodasLeidas'])->middleware('auth.sesion')->name('admin.notificaciones.todas-leidas');

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
    })->middleware('permiso:postulaciones_postulantes.leer')->name('admin.postulaciones.postulantes.descargar');

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
    })->middleware('permiso:postulaciones_docentes.leer')->name('admin.postulaciones.docentes.descargar');

    Route::get('/panel', function () {
        return Inertia::render('Panel/Dashboard');
    })->name('panel.dashboard');
    
    /*
    |--------------------------------------------------------------------------
    | CU13: Gestión de Aulas
    |--------------------------------------------------------------------------
    */
    Route::get('/aulas', [AulaController::class, 'index'])->middleware('permiso:aulas.leer')->name('aulas.index');
    Route::post('/aulas', [AulaController::class, 'store'])->middleware('permiso:aulas.escribir')->name('aulas.store');
    Route::put('/aulas/{aula}', [AulaController::class, 'update'])->middleware('permiso:aulas.escribir')->name('aulas.update');
    Route::delete('/aulas/{aula}', [AulaController::class, 'destroy'])->middleware('permiso:aulas.escribir')->name('aulas.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU11: Gestión de Grupos
    |--------------------------------------------------------------------------
    */
    Route::get('/grupos', [GrupoController::class, 'index'])->middleware('permiso:grupos.leer')->name('grupos.index');
    Route::post('/grupos', [GrupoController::class, 'store'])->middleware('permiso:grupos.escribir')->name('grupos.store');
    Route::put('/grupos/{grupo}', [GrupoController::class, 'update'])->middleware('permiso:grupos.escribir')->name('grupos.update');
    Route::delete('/grupos/{grupo}', [GrupoController::class, 'destroy'])->middleware('permiso:grupos.escribir')->name('grupos.destroy');
    Route::post('/grupos/generar', [GrupoController::class, 'generar'])->middleware('permiso:grupos.escribir')->name('grupos.generar');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Asignación Académica
    |--------------------------------------------------------------------------
    */
    Route::get('/asignaciones-academicas', [AsignacionAcademicaController::class, 'index'])->middleware('permiso:asignacion_academica.leer')->name('asignaciones.index');
    Route::post('/asignaciones-academicas', [AsignacionAcademicaController::class, 'store'])->middleware('permiso:asignacion_academica.escribir')->name('asignaciones.store');
    Route::get('/docentes-materias', [DocenteMateriaController::class, 'index'])->middleware('permiso:docentes_materias.leer')->name('docentes.materias.index');
    Route::post('/docentes-materias', [DocenteMateriaController::class, 'store'])->middleware('permiso:docentes_materias.escribir')->name('docentes.materias.store');
    Route::delete('/docentes-materias/{idDocente}/{idMateria}', [DocenteMateriaController::class, 'destroy'])->middleware('permiso:docentes_materias.escribir')->name('docentes.materias.destroy');
    Route::put('/asignaciones-academicas/{asignacionAcademica}', [AsignacionAcademicaController::class, 'update'])->middleware('permiso:asignacion_academica.escribir')->name('asignaciones.update');
    Route::delete('/asignaciones-academicas/{asignacionAcademica}', [AsignacionAcademicaController::class, 'destroy'])->middleware('permiso:asignacion_academica.escribir')->name('asignaciones.destroy');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Horarios
    |--------------------------------------------------------------------------
    */
    Route::get('/horarios', [HorarioController::class, 'index'])->middleware('permiso:horarios.leer')->name('horarios.index');
    Route::post('/horarios', [HorarioController::class, 'store'])->middleware('permiso:horarios.escribir')->name('horarios.store');
    Route::put('/horarios/{horario}', [HorarioController::class, 'update'])->middleware('permiso:horarios.escribir')->name('horarios.update');
    Route::delete('/horarios/{horario}', [HorarioController::class, 'destroy'])->middleware('permiso:horarios.escribir')->name('horarios.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU02: Gestión de Usuarios y Roles
    |--------------------------------------------------------------------------
    */
    Route::get('/roles', [RolController::class, 'index'])->middleware('permiso:roles.leer')->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->middleware('permiso:roles.escribir')->name('roles.store');
    Route::put('/roles/{rol}', [RolController::class, 'update'])->middleware('permiso:roles.escribir')->name('roles.update');
    Route::delete('/roles/{rol}', [RolController::class, 'destroy'])->middleware('permiso:roles.escribir')->name('roles.destroy');
    Route::get('/roles/{rol}/funciones', [RolController::class, 'getFunciones'])->middleware('permiso:roles.leer')->name('roles.funciones');

    Route::get('/usuarios', [UsuarioController::class, 'index'])->middleware('permiso:usuarios.leer')->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->middleware('permiso:usuarios.escribir')->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update'])->middleware('permiso:usuarios.escribir')->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy'])->middleware('permiso:usuarios.escribir')->name('usuarios.destroy');
    Route::post('/usuarios/importar', [UsuarioController::class, 'importar'])->middleware('permiso:usuarios.escribir')->name('usuarios.importar');
    Route::delete('/usuarios/importar/{batch}/deshacer', [UsuarioController::class, 'deshacerImportacion'])->middleware('permiso:usuarios.escribir')->name('usuarios.importar.deshacer');

    /*
    |--------------------------------------------------------------------------
    | CU04: Gestión de Carreras
    |--------------------------------------------------------------------------
    */
    Route::get('/carreras', [CarreraController::class, 'index'])->middleware('permiso:carreras.leer')->name('carreras.index');
    Route::post('/carreras', [CarreraController::class, 'store'])->middleware('permiso:carreras.escribir')->name('carreras.store');
    Route::put('/carreras/{carrera}', [CarreraController::class, 'update'])->middleware('permiso:carreras.escribir')->name('carreras.update');
    Route::delete('/carreras/{carrera}', [CarreraController::class, 'destroy'])->middleware('permiso:carreras.escribir')->name('carreras.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU06: Gestión de Materias
    |--------------------------------------------------------------------------
    */
    Route::get('/materias', [MateriaController::class, 'index'])->middleware('permiso:materias.leer')->name('materias.index');
    Route::post('/materias', [MateriaController::class, 'store'])->middleware('permiso:materias.escribir')->name('materias.store');
    Route::put('/materias/{materium}', [MateriaController::class, 'update'])->middleware('permiso:materias.escribir')->name('materias.update');
    Route::delete('/materias/{materium}', [MateriaController::class, 'destroy'])->middleware('permiso:materias.escribir')->name('materias.destroy');

    /*
    |--------------------------------------------------------------------------
    | CU10: Gestionar Pagos - Stripe Checkout
    |--------------------------------------------------------------------------
    */
    Route::prefix('financiero')->group(function () {
        Route::get('/pagos', [PagoController::class, 'index'])->middleware('permiso:pagos_listado.leer')->name('pagos.index');
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
    Route::get('/admin/asistencia', [\App\Http\Controllers\Admin\AsistenciaController::class, 'index'])->middleware('permiso:asistencia_docente.leer,asistencia_estudiantes.leer')->name('admin.asistencia.index');
});

Route::post('/financiero/pago/crear-sesion', [PagoController::class, 'createCheckoutSession'])->name('pago.crear-sesion');
Route::get('/financiero/pago/exito', [PagoController::class, 'pagoExito'])->name('pago.exito');
Route::get('/financiero/pago/cancelado', [PagoController::class, 'pagoCancelado'])->name('pago.cancelado');
