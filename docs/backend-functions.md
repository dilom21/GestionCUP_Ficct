# BACKEND - GestionCUP_Ficct

> Documentación completa de todos los controladores, modelos, servicios, jobs, imports, requests y middlewares del backend Laravel.

---

## 1. CONTROLADORES (28 archivos)

### 1.1 Auth (app/Http/Controllers/Auth)

#### AuthManualController.php
| Método | HTTP | Ruta | Descripción | Modelos que usa |
|--------|------|------|-------------|-----------------|
| `mostrarLogin()` | GET | `/login` | Muestra formulario de inicio de sesión | - |
| `iniciarSesion(Request)` | POST | `/login` | Autentica usuario, verifica bloqueo por intentos (3-6+), crea sesión con permisos, registra bitácora, redirige según rol | Usuario, Rol, BitacoraService |
| `cerrarSesion(Request)` | POST | `/logout` | Registra cierre en bitácora, destruye sesión | BitacoraService |

#### PasswordResetManualController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `showForgotPassword()` | GET | `/forgot-password` | Muestra formulario de solicitud de reset | - |
| `sendResetLink(Request)` | POST | `/forgot-password` | Valida correo, genera token 64 chars, invalida anteriores, envía correo via Resend API | Usuario, ResetPassword |
| `showResetPassword(string $token)` | GET | `/reset-password/{token}` | Muestra formulario de nueva contraseña si token válido | ResetPassword |
| `resetPassword(Request)` | POST | `/reset-password` | Valida token, actualiza contraseña (min 8 chars), marca usado | ResetPassword, Usuario |

---

### 1.2 Admin (app/Http/Controllers/Admin)
#### DashboardController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/dashboard` | Renderiza dashboard admin (vacío actualmente) | - |

#### BitacoraController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/bitacora` | Lista bitácora con filtros (acción, usuario, fecha) | Bitacora, Usuario |

#### PostulacionDocenteRevisionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/postulaciones-docentes` | Lista postulaciones docentes con filtros | PostulacionDocente |
| `show($id)` | GET | `/admin/postulaciones-docentes/{id}` | Detalle con documentos, requisitos, revisor | PostulacionDocente |
| `guardarRevision(Request, $id)` | POST | `.../{id}/guardar-revision` | Guarda revisión de requisitos (Cumple/No cumple/Observado/Pendiente) | PostulacionDocente, PostulacionDocenteRequisito, BitacoraService |
| `cambiarEstado(Request, $id, ...)` | POST | `.../{id}/cambiar-estado` | Cambia estado; si Aprobado crea Usuario+Docente+AsignacionAcademica+Horarios, envía correo | PostulacionDocente, Usuario, Docente, AsignacionAcademica, Horario, Grupo, Aula, ResendEmailService, AcademicValidationService |

#### PostulacionPostulanteRevisionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/postulaciones-postulantes` | Lista postulaciones con filtros | Postulacion |
| `show($id)` | GET | `/admin/postulaciones-postulantes/{id}` | Detalle con postulante, carreras, documentos | Postulacion |
| `guardarRevision(Request, $id)` | POST | (misma ruta patrón) | Guarda revisión de requisitos | Postulacion, PostulacionRequisito, BitacoraService |
| `cambiarEstado(Request, $id)` | POST | (misma ruta patrón) | Cambia estado (Observado/Rechazado/Pago/Aprobado); si Aprobado asigna grupo, crea InscripcionCup | Postulacion, GestionCup, Grupo, InscripcionCup, ResendEmailService, BitacoraService |

#### PostulacionKanbanController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/postulaciones-postulantes/kanban` | Renderiza vista Kanban | - |
| `tablero()` | POST | `/admin/kanban/tablero` | Devuelve postulaciones agrupadas por estado | Postulacion |
| `mover(Request, $id)` | POST | `/admin/kanban/mover/{id}` | Mueve postulación entre columnas | Postulacion, BitacoraService |

#### ExploradorCupController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/explorador-cup` | Renderiza explorador con selector de gestiones | GestionCup |
| `datos(Request)` | POST | `/admin/explorador-cup/datos` | JSON con funnel, mapa calor, burbujas, timeline, resumen | Postulacion, Pago, InscripcionCup, ResultadoCup, Materia, Grupo, Nota, Evaluacion, Docente |

#### SalaSituacionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/sala-situacion` | Renderiza sala de situación | - |
| `estadisticas()` | POST | `/admin/sala-situacion/estadisticas` | JSON con KPIs (hoy/semana), feed, ciudades, hora, estados | Postulacion, Pago, ResultadoCup, Docente, InscripcionCup, Postulante |

#### NotificacionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/notificaciones` | Notificaciones no leídas (20) y todas (50) + conteo | Notificacion |
| `marcarLeida(int $id)` | POST | `/admin/notificaciones/{id}/leida` | Marca una como leída | Notificacion |
| `marcarTodasLeidas()` | POST | `/admin/notificaciones/todas-leidas` | Marca todas como leídas | Notificacion |
| `noLeidas()` | GET | `/admin/notificaciones/no-leidas` | Últimas 10 no leídas + conteo | Notificacion |

#### HorarioController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/horarios` | Lista horarios con filtros (asignación, día) | Horario, AsignacionAcademica, Aula |
| `store(Request, AcademicValidationService)` | POST | `/horarios` | Crea horario con validaciones de cruce y carga horaria | Horario, AcademicValidationService, BitacoraService |
| `update(Request, Horario, ...)` | PUT | `/horarios/{horario}` | Actualiza horario con validaciones | Horario, AcademicValidationService, BitacoraService |
| `destroy(Horario)` | DELETE | `/horarios/{horario}` | Elimina horario | Horario, BitacoraService |

#### GrupoController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/grupos` | Lista grupos con filtros (búsqueda, turno, gestión) | Grupo, GestionCup |
| `store(StoreGrupoRequest)` | POST | `/grupos` | Crea grupo | Grupo, BitacoraService |
| `update(UpdateGrupoRequest, Grupo)` | PUT | `/grupos/{grupo}` | Actualiza grupo | Grupo, BitacoraService |
| `destroy(Grupo)` | DELETE | `/grupos/{grupo}` | Elimina grupo si no tiene asignaciones/inscripciones | Grupo, BitacoraService |
| `generar(Request, AcademicGroupService)` | POST | `/grupos/generar` | Genera grupos automáticos por turno (80 c/u) | AcademicGroupService, BitacoraService |

#### AulaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/aulas` | Lista aulas con filtros | Aula |
| `store(StoreAulaRequest)` | POST | `/aulas` | Crea aula | Aula, BitacoraService |
| `update(UpdateAulaRequest, Aula)` | PUT | `/aulas/{aula}` | Actualiza aula | Aula, BitacoraService |
| `destroy(Aula)` | DELETE | `/aulas/{aula}` | Elimina aula si no tiene horarios | Aula, BitacoraService |

#### DocenteController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/docentes` | Lista docentes; incluye usuarios disponibles | Docente, Usuario, PostulacionDocente |
| `store(Request)` | POST | `/admin/docentes` | Crea perfil docente para usuario existente | Docente, Usuario, PostulacionDocente, BitacoraService |
| `update(Request, $id)` | PUT | `/admin/docentes/{id}` | Actualiza perfil + teléfono | Docente, Usuario, BitacoraService |
| `cambiarEstado($id)` | POST | `/admin/docentes/{id}/cambiar-estado` | Alterna Activo/Inactivo del usuario asociado | Docente, Usuario, BitacoraService |

#### DocenteMateriaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/docentes-materias` | Lista docentes con materias asignadas | Docente, Materia |
| `store(Request)` | POST | `/docentes-materias` | Asigna materia a docente (reactiva si existe Inactiva) | DocenteMateria, BitacoraService |
| `destroy($idDocente, $idMateria)` | DELETE | `/docentes-materias/{idDocente}/{idMateria}` | Desasigna materia (borrado lógico) | DocenteMateria, BitacoraService |

#### EvaluacionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/evaluaciones` | Lista evaluaciones con filtros | Evaluacion, Materia, GestionCup |
| `store(Request)` | POST | `/admin/evaluaciones` | Crea evaluación (max 3 activas, suma <= 100%) | Evaluacion, BitacoraService |
| `update(Request, $id)` | PUT | `/admin/evaluaciones/{id}` | Actualiza evaluación | Evaluacion, BitacoraService |
| `cambiarEstado($id)` | POST | `/admin/evaluaciones/{id}/cambiar-estado` | Alterna Activo/Inactivo (revalida máximos al activar) | Evaluacion, BitacoraService |

#### ResultadoCupController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/resultados-cup` | Lista inscripciones con notas y resultados | InscripcionCup, Nota, ResultadoCup |
| `calcular($id)` | POST | `/admin/resultados-cup/{id}/calcular` | Calcula resultado individual (P1=30%, P2=30%, EF=40%) | Nota, ResultadoCup |
| `calcularTodos()` | POST | `/admin/resultados-cup/calcular-todos` | Calcula todos en lote | InscripcionCup, Nota, ResultadoCup |

#### AsignacionCarreraController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/asignacion-carrera` | Aprobados ordenados + resumen cupos | ResultadoCup, CupoCarrera, AdmisionCarrera, Carrera, GestionCup |
| `ejecutarAsignacion(Request)` | POST | `/admin/asignacion-carrera/ejecutar` | Asignación automática por mérito (op1→op2→libre→pendiente) | ResultadoCup, CupoCarrera, AdmisionCarrera, BitacoraService |
| `asignarIndividual(Request, $idResultado)` | POST | `/admin/asignacion-carrera/{id}/asignar` | Asigna individualmente | ResultadoCup, CupoCarrera, AdmisionCarrera |

#### ResultadoAdmisionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/resultados-admision` | Lista resultados admisión con filtros | AdmisionCarrera, GestionCup, Carrera |

#### PostulanteGestionController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/admin/postulantes-gestion` | Postulantes que completaron proceso | Postulante, Postulacion |
| `update(Request, $id)` | PUT | `/admin/postulantes-gestion/{id}` | Actualiza datos (teléfono, dirección, ciudad, colegio) | Postulante, BitacoraService |
| `cambiarEstado($id)` | POST | `/admin/postulantes-gestion/{id}/cambiar-estado` | Alterna estado del usuario asociado | Postulante, Usuario, BitacoraService |

#### CupoCarreraController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/cupos-carrera` | Lista cupos con filtros | CupoCarrera, GestionCup, Carrera |
| `store(Request)` | POST | `/admin/cupos-carrera` | Crea cupo (evita duplicados) | CupoCarrera, BitacoraService |
| `update(Request, $idGestion, $idCarrera)` | PUT | `/admin/cupos-carrera/{gestion}/{carrera}` | Actualiza cantidad | CupoCarrera, BitacoraService |
| `cambiarEstado($idGestion, $idCarrera)` | POST | `.../cambiar-estado` | Alterna Activo/Inactivo | CupoCarrera, BitacoraService |

#### AsignacionAcademicaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/asignaciones-academicas` | Lista asignaciones con filtros | AsignacionAcademica, Materia, Grupo, Docente, GestionCup |
| `store(Request, ...)` | POST | `/asignaciones-academicas` | Crea asignación valida habilitación, no duplicado, límite grupos | AsignacionAcademica, DocenteMateria, AcademicValidationService, BitacoraService |
| `update(Request, $aa, ...)` | PUT | `/asignaciones-academicas/{asignacionAcademica}` | Actualiza con validación de cambios | AsignacionAcademica, DocenteMateria, AcademicValidationService, BitacoraService |
| `destroy(AsignacionAcademica)` | DELETE | `/asignaciones-academicas/{asignacionAcademica}` | Elimina si no tiene horarios | AsignacionAcademica, BitacoraService |

#### AsistenciaController.php (Admin)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index(Request)` | GET | `/admin/asistencia` | Visor de asistencias con pestañas (docente/estudiante), filtros periodo/grupo/materia/docente | AsistenciaDocente, AsistenciaEstudiante, Grupo, Materia, Docente |

#### ConsultaVozController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `procesar(Request)` | POST | `/admin/consultavoz/procesar` | Interpreta texto de consulta natural, genera reporte | ConsultaVoz, InterpretadorConsultaService, ReporteController, BitacoraService |
| `historial(Request)` | GET | `/admin/consultavoz/historial` | Historial de consultas del usuario | ConsultaVoz |

---

### 1.3 Docente (app/Http/Controllers/Docente)
#### AsistenciaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/docente/asistencia` | Asignaciones del docente + horarios + asistencias hoy | Docente, AsignacionAcademica, AsistenciaDocente |
| `generarQr(Request, QrTokenService)` | POST | `/docente/asistencia/generar-qr` | Token QR 64 chars, 15s validez | QrTokenService, BitacoraService |
| `registrarEntrada(Request, QrTokenService)` | POST | `/docente/asistencia/entrada` | Entrada con tolerancia +/-15 min | QrTokenService, BitacoraService |
| `registrarSalida(Request, QrTokenService)` | POST | `/docente/asistencia/salida` | Salida (debe tener entrada) | QrTokenService, BitacoraService |
| `generarPin(Request, QrTokenService)` | POST | `/docente/asistencia/generar-pin` | PIN 6 dígitos, 60s validez | QrTokenService, BitacoraService |
| `obtenerEstudiantes(Request)` | GET | `/docente/asistencia/estudiantes` | Lista de estudiantes del grupo + estados hoy | QrTokenService |
| `registrarEstudiante(Request, QrTokenService)` | POST | `/docente/asistencia/registrar-estudiante` | Asistencia manual: Presente/Ausente/Tardanza | QrTokenService, BitacoraService |

---

### 1.4 Postulante (app/Http/Controllers/Postulante)
#### AsistenciaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/postulante/asistencia` | Inscripciones del postulante con horarios | Postulante, InscripcionCup |
| `escanearQr(Request, QrTokenService)` | POST | `/postulante/asistencia/escanear` | Escanea QR y registra asistencia | QrTokenService |
| `validarPin(Request, QrTokenService)` | POST | `/postulante/asistencia/validar-pin` | Valida PIN 6 dígitos y registra | QrTokenService |

#### PostulanteController.php (sin uso actual)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `create()` | GET | - | Formulario registro postulante | - |
| `store(Request)` | POST | - | Guarda postulante con notas, calcula promedio | Postulante |

#### PagoController.php (Postulante, sin uso actual)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | - | Pasarela de pago | - |

#### NotaController.php (Postulante, sin uso actual)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | - | Notas del postulante | - |

#### InscripcionController.php (Postulante, sin uso actual)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | - | Formulario inscripción | - |

---

### 1.5 Público (app/Http/Controllers)

#### PostulacionDocenteController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `create()` | GET | `/postulacion-docente` | Formulario público con requisitos y materias | RequisitoDocente, Materia |
| `store(Request)` | POST | `/postulacion-docente` | Procesa postulación: guarda materias, crea checks, sube docs a Supabase, envía correo | PostulacionDocente, RequisitoDocente, DocumentoPD, SupabaseStorageService, ResendEmailService, BitacoraService |

#### PostulacionPostulanteController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `create(Request)` | GET | `/preinscripcion` | Formulario preinscripción con estados de pago | Carrera, Requisito, Postulacion |
| `store(Request)` | POST | `/preinscripcion` | Crea Postulante + Postulacion + checks + sube docs + envía correo | Postulante, Postulacion, Requisito, DocumentoPP, SupabaseStorageService, ResendEmailService, BitacoraService |
| `show($id)` | GET | `/preinscripcion/{id}` | Detalle de postulación creada | Postulacion |

#### TrayectoriaController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `publica($token)` | GET | `/trayectoria/{token}` | Trayectoria pública (7 etapas timeline) | Postulacion |
| `adminIndex()` | GET | `/admin/trayectorias` | Buscador de trayectorias admin | - |
| `buscar(Request)` | POST | `/admin/trayectorias/buscar` | Busca postulaciones por CI/nombre | Postulacion |

#### UsuarioController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/usuarios` | Lista usuarios con rol | Usuario, Rol |
| `store(StoreUsuarioRequest)` | POST | `/usuarios` | Crea usuario con password hasheado | Usuario, Bitacora |
| `update(UpdateUsuarioRequest, User)` | PUT | `/usuarios/{usuario}` | Actualiza (password solo si se envía) | Usuario, Bitacora |
| `destroy(User)` | DELETE | `/usuarios/{usuario}` | Borrado lógico (estado=Inactivo) | Usuario, Bitacora |
| `importar(ImportUsuariosRequest)` | POST | `/usuarios/importar` | Importa Excel/CSV, despacha jobs de credenciales | UsuariosImport, EnviarCredencialesUsuarioJob, BitacoraService |
| `deshacerImportacion(string $batch)` | DELETE | `/usuarios/importar/{batch}/deshacer` | Hard delete por batch | Usuario, BitacoraService |

#### RolController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/roles` | Roles + módulos con funciones | Rol, Modulo |
| `store(StoreRolRequest)` | POST | `/roles` | Crea rol + sync funciones | Rol, Funcion, Bitacora |
| `update(UpdateRolRequest, Rol)` | PUT | `/roles/{rol}` | Actualiza rol + resync funciones | Rol, Funcion, Bitacora |
| `destroy(Rol)` | DELETE | `/roles/{rol}` | Elimina rol si no tiene usuarios | Rol, Bitacora |
| `getFunciones(Rol)` | GET | `/roles/{rol}/funciones` | IDs de funciones asignadas | Rol, Funcion |

#### CarreraController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/carreras` | Lista carreras por sigla | Carrera |
| `store(StoreCarreraRequest)` | POST | `/carreras` | Crea carrera | Carrera, Bitacora |
| `update(UpdateCarreraRequest, Carrera)` | PUT | `/carreras/{carrera}` | Actualiza | Carrera, Bitacora |
| `destroy(Carrera)` | DELETE | `/carreras/{carrera}` | Elimina si no tiene directores/postulaciones | Carrera, Bitacora |

#### MateriaController.php (namespace Materias)
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/materias` | Lista materias con estado | Materia |
| `store(StoreMateriaRequest)` | POST | `/materias` | Crea (estado Activo default) | Materia, Bitacora |
| `update(UpdateMateriaRequest, Materia)` | PUT | `/materias/{materium}` | Actualiza y reactiva | Materia, Bitacora |
| `destroy(Materia)` | DELETE | `/materias/{materium}` | Borrado lógico (estado=Inactivo) | Materia, Bitacora |

---

### 1.6 Financiero (app/Http/Controllers/Financiero)
#### PagoController.php
| Método | HTTP | Ruta | Descripción | Modelos |
|--------|------|------|-------------|---------|
| `index()` | GET | `/financiero/pagos` | Lista pagos con postulante | Pago |
| `createCheckoutSession(Request)` | POST | `/financiero/pago/crear-sesion` | Stripe Checkout 350Bs, registra Pago Pendiente | Postulacion, Pago, Bitacora |
| `pagoExito(Request)` | GET | `/financiero/pago/exito` | Retorno exitoso Stripe, confirma pago + crea usuario postulante | Stripe\Checkout\Session, Pago, Postulacion, Usuario, ResendEmailService, BitacoraService |
| `pagoCancelado(Request)` | GET | `/financiero/pago/cancelado` | Vista de cancelación | - |
| `handleWebhook(Request)` | POST | `/stripe/webhook` | Webhook Stripe `checkout.session.completed` | Pago, Postulacion, Usuario, ResendEmailService, BitacoraService |

---

## 2. MODELOS (27 modelos)

| Modelo | Tabla | PK | Clave | Relaciones principales |
|--------|-------|----|-------|----------------------|
| Usuario | `usuario` | id | - | rol(), docente() |
| Rol | `rol` | id | - | usuarios(), funciones() |
| Funcion | `funcion` | id | - | modulo(), roles() |
| Modulo | `modulo` | id | - | funciones() |
| Carrera | `carrera` | id_carrera | - | directores(), cupos() |
| Materia | `materia` | id_materia | - | evaluaciones(), docentes(), postulaciones() |
| Postulante | `postulante` | id_postulante | - | usuario(), postulaciones() |
| Postulacion | `postulacion` | id | - | postulante(), carrera1(), carrera2(), revisor(), requisitos(), documentos(), pagos(), inscripcionCup() |
| Pago | `pago` | id | - | postulacion() |
| Bitacora | `bitacora` | id_bitacora | - | usuario() |
| PostulacionDocente | `postulacion_docente` | id | - | documentos(), requisitos(), revisor(), materias() |
| Docente | `docente` | id | - | usuario(), materias(), asignacionesAcademicas() |
| InscripcionCup | `inscripcion_cup` | id | - | postulacion(), grupo(), gestionCup(), resultado() |
| Grupo | `grupo` | id | - | gestionCup(), asignacionesAcademicas(), inscripciones() |
| Horario | `horario` | id | - | asignacionAcademica(), aula() |
| Aula | `aula` | id | - | horarios() |
| AsignacionAcademica | `asignacion_academica` | id | - | materia(), grupo(), docente(), gestionCup(), horarios() |
| Evaluacion | `evaluacion` | id | - | materia(), gestionCup(), notas() |
| Nota | `nota` | id_nota | - | evaluacion(), inscripcionCup() |
| ResultadoCup | `resultado_cup` | id | - | inscripcionCup(), admisionCarreras() |
| AdmisionCarrera | `admision_carrera` | id | - | resultadoCup(), carreraAsignada() |
| GestionCup | `gestion_cup` | id | - | grupos(), cuposCarrera(), asignacionesAcademicas() |
| CupoCarrera | `cupo_carrera` | compuesta | id_gestion_cup + id_carrera | carrera(), gestionCup() |
| DocenteMateria | `docente_materia` | compuesta | id_materia + id_docente | materia(), docente() |
| DirectorCarrera | `director_carrera` | id | - | - |
| Requisito | `requisitos` | id | - | - |
| Notificacion | `notificacion` | id | - | - |

---

## 3. FORM REQUESTS (13 archivos)

| Request | Validaciones principales |
|---------|------------------------|
| StoreUsuarioRequest | nombre, apellidos, correo (unique:usuario), password (min:6), id_rol (exists:rol), estado |
| UpdateUsuarioRequest | igual + correo unique ignore current + password nullable |
| ImportUsuariosRequest | archivo (file, mimes:csv,xlsx,xls, max:5120) |
| StoreRolRequest | nombre (unique:rol), funciones.* (exists:funcion) |
| UpdateRolRequest | nombre (unique ignore current), funciones.* |
| StoreCarreraRequest | sigla (max:3, unique), nombre (max:150, unique) |
| UpdateCarreraRequest | sigla + nombre (unique ignore current) |
| StoreMateriaRequest | nombre (max:150, unique) |
| UpdateMateriaRequest | nombre (unique ignore current) |
| StoreGrupoRequest | id_gestion_cup, sigla, cupo_maximo (min:1), turno (in:Manana,Tarde,Noche) |
| UpdateGrupoRequest | sigla, cupo_maximo, turno |
| StoreAulaRequest | codigo (unique), nombre, capacidad_maxima (min:1) |
| UpdateAulaRequest | codigo (unique ignore current), nombre, capacidad_maxima |

---

## 4. SERVICES (7 servicios)

| Service | Métodos públicos | Descripción |
|---------|-----------------|-------------|
| SupabaseStorageService.php | `subirArchivo($bucket, $path, $file)`, `descargarArchivo($bucket, $path)`, `eliminarArchivo($bucket, $path)` | Subida/descarga de documentos a Supabase Storage |
| BitacoraService.php | `registrar($accion, $tabla = null, $idUsuario = null)` | Registro centralizado de auditoría |
| ResendEmailService.php | `enviarCorreo($destinatario, $asunto, $contenidoHtml)` | Envío de correos vía Resend API |
| AcademicGroupService.php | `generarGrupos($idGestionCup, $turno)` | Generación automática de grupos (80 estudiantes c/u) |
| AcademicValidationService.php | `validarCruces($data, $excluirId = null)`, `validarCargaHoraria($data, $excluirId = null)`, `validarVentanaTurno($data)` | Validaciones de cruces horarios, carga horaria, ventana de turno |
| QrTokenService.php | `generarToken($tipo, $validez, $datos)`, `validarToken($token, $tipo)` | Generación y validación de tokens QR (15s) y PIN (60s) |
| InterpretadorConsultaService.php | `interpretar($texto)` | Interpreta lenguaje natural para consultas de voz |

---

## 5. JOBS (1)

| Job | Queue | Descripción |
|-----|-------|-------------|
| EnviarCredencialesUsuarioJob.php | database (cola) | Envía correo con credenciales al crear usuario vía ResendEmailService |

---

## 6. IMPORTS (1)

| Import | Procesa | Descripción |
|--------|---------|-------------|
| UsuariosImport.php (Maatwebsite/LaravelExcel) | CSV/XLSX/XLS | Lee columnas: Nombre, Apellido, Correo, Rol. Busca rol por nombre case-insensitive. Cada fila validada individualmente. |

---

## 7. MIDDLEWARE (3)

| Alias | Clase | Lógica |
|-------|-------|--------|
| `auth.sesion` | AuthSesion.php | Verifica `usuario_id` en sesión; si existe y tiene rol, actualiza sesión con nombre y permisos desde caché (1hr). Redirige a `/login` si no. |
| `permiso` | VerificarPermiso.php | Si rol = Administrador, acceso total. Si no, expande permisos legacy y verifica que al menos uno de los requeridos esté presente. Aborta 403 si no. |
| (web global) | HandleInertiaRequests.php | Comparte con Inertia: flash messages, auth.user, auth.usuario_id/nombre/correo/rol_id/rol_nombre/permisos |

---

## 8. TOTAL DE RUTAS: 122

Grupos de rutas: Landing (1), Auth guest (6), Postulación Docente (2), Preinscripción (4), Logout (1), Webhook (1), Trayectoria pública (1), Admin Bitácora (1), Admin Docentes (4), Admin Postulantes Gestión (3), Admin Evaluaciones (4), Admin Resultados CUP (3), Admin Cupos Carrera (4), Admin Asignación Carrera (3), Admin Resultados Admisión (1), Admin Postulaciones Docentes (4), Admin Postulaciones Postulantes (5), Admin Trayectorias (2), Admin Reportes (5), Admin Consulta Voz (2), Admin Explorador CUP (2), Admin Sala Situación (2), Admin Notificaciones (4), Admin Descarga Docs (2), Panel (1), CRUD Aulas (4), CRUD Grupos (5), CRUD Asignación Académica (7), CRUD Horarios (4), CRUD Roles (5), CRUD Usuarios (6), CRUD Carreras (4), CRUD Materias (4), Financiero listado (1), Docente Asistencia (7), Postulante Asistencia (3), Admin Asistencia (1), Stripe Checkout (3)
