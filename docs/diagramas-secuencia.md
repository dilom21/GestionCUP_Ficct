# DIAGRAMAS DE SECUENCIA - GestionCUP_Ficct

> Resumen completo para elaborar diagramas de secuencia, análisis de clases y diagramas de secuencia UML.
> Formato por caso de uso: **Actor → UI (formulario/componente) → Controlador (método @ruta) → Entidades (Modelos)**

---

## LEYENDA PARA DIAGRAMAS

| Símbolo | Significado |
|---------|-------------|
| 👤 Actor | Usuario del sistema (rol) |
| 🖥️ UI | Interfaz de usuario (página React + formulario) |
| 🎮 Controller | Controlador Laravel (método @ ruta) |
| 🗄️ Entity | Modelo/Entidad de base de datos |
| ⚙️ Service | Servicio de lógica de negocio |
| 🔄 External | Sistema externo (Stripe, Supabase, Resend) |

---

## CU1: AUTENTICACIÓN (AuthManualController)

### 1.1 Inicio de Sesión
```
👤 Actor: Administrador / Administrativo / Docente / Director
🖥️ UI: Login.jsx (form: correo + password + show/hide toggle)
🎮 Controller: AuthManualController@iniciarSesion (POST /login)
🗄️ Entities: Usuario, Rol, Bitacora

Flujo:
  1. 👤 Actor ingresa correo y password en Login.jsx
  2. 🖥️ UI envía POST /login con { correo, password }
  3. 🎮 AuthManualController.iniciarSesion()
     3.1 🗄️ Usuario::where('correo', $correo)->first()
     3.2 Verifica: usuario existe? está activo? bloqueado? password correcto?
     3.3 Si bloqueado: calcula tiempo restante, redirige con mensaje
     3.4 Si password incorrecto: incrementa intentos_fallidos
         - 3 fallos: mensaje normal
         - 4 fallos: bloqueo 1 minuto
         - 5 fallos: bloqueo 5 minutos
         - 6+ fallos: bloqueo 15 minutos
     3.5 Si password correcto: resetea intentos_fallidos = 0
     3.6 🗄️ Rol::find(session.id_rol) → obtiene funciones/permisos
     3.7 Crea sesión: usuario_id, nombre, correo, rol_id, rol_nombre, permisos
     3.8 ⚙️ BitacoraService.registrar("INICIO DE SESIÓN", "usuario", usuario_id)
     3.9 Redirige según rol:
         - Administrador → /admin/dashboard
         - Administrativo → /administrativo/dashboard
         - Docente → /docente/dashboard
         - Director → /director/dashboard
         - Postulante → BLOQUEADO (no puede acceder al panel)
  4. 🖥️ UI recibe redirect, carga dashboard correspondiente
```

### 1.2 Cierre de Sesión
```
👤 Actor: Cualquier usuario autenticado
🖥️ UI: Navbar.jsx (botón "Cerrar sesión")
🎮 Controller: AuthManualController@cerrarSesion (POST /logout)
🗄️ Entities: Bitacora

Flujo:
  1. 👤 Actor click "Cerrar sesión" en Navbar
  2. 🖥️ UI envía POST /logout
  3. 🎮 AuthManualController.cerrarSesion()
     3.1 ⚙️ BitacoraService.registrar("CIERRE DE SESIÓN", "usuario", usuario_id)
     3.2 session::flush() + session::invalidate()
     3.3 Regenerate CSRF token
     3.4 Redirige a /login
```

### 1.3 Recuperación de Contraseña
```
👤 Actor: Cualquier usuario (sin autenticar)
🖥️ UI: ForgotPassword.jsx (form: correo) → ResetPassword.jsx (form: password + confirm)
🎮 Controller: PasswordResetManualController
   - sendResetLink (POST /forgot-password)
   - showResetPassword (GET /reset-password/{token})
   - resetPassword (POST /reset-password)
🗄️ Entities: Usuario, ResetPassword

Flujo:
  1. 👤 Actor ingresa correo en ForgotPassword.jsx
  2. 🖥️ UI envía POST /forgot-password
  3. 🎮 sendResetLink()
     3.1 🗄️ Usuario::where('correo', $request->correo)->first()
     3.2 Valida que el usuario exista
     3.3 🗄️ ResetPassword::where('correo', ...)->delete() (invalida anteriores)
     3.4 Genera token 64 chars aleatorio
     3.5 🗄️ ResetPassword::create({ correo, token, usado: false, created_at: now })
     3.6 🔄 ResendEmailService.enviarCorreo(destinatario, asunto, html con link)
     3.7 Retorna redirect back con status "success"
  4. 👤 Actor recibe correo, click enlace (GET /reset-password/{token})
  5. 🎮 showResetPassword($token)
     5.1 Busca ResetPassword por token, verifica validez y no expirado
     5.2 Renderiza ResetPassword.jsx con token
  6. 👤 Actor ingresa nueva password (min 8 chars, mayúscula, minúscula, número)
  7. 🖥️ UI envía POST /reset-password con { token, password, password_confirmation }
  8. 🎮 resetPassword()
     8.1 Valida token nuevamente
     8.2 🗄️ Usuario::where('correo', ...)->update({ password: Hash::make($pass) })
     8.3 🗄️ ResetPassword::where('token', ...)->update({ usado: true })
     8.4 Redirige a /login con mensaje de éxito
```

---

## CU2: GESTIÓN DE USUARIOS (UsuarioController)

### 2.1 Listar Usuarios
```
👤 Actor: Administrador (permiso: usuarios.leer)
🖥️ UI: Usuarios/Index.jsx (tabla con todos los usuarios + rol)
🎮 Controller: UsuarioController@index (GET /usuarios)
🗄️ Entities: Usuario, Rol

Flujo:
  1. 👤 Actor navega a /usuarios
  2. 🖥️ UI carga Usuarios/Index.jsx
  3. 🎮 UsuarioController.index()
     3.1 🗄️ Usuario::with('rol')->orderBy('apellidos')->get()
     3.2 🗄️ Rol::all() (para combo filtro)
     3.3 Renderiza Usuarios/Index.jsx con { usuarios, roles }
```

### 2.2 Crear Usuario
```
👤 Actor: Administrador (permiso: usuarios.escribir)
🖥️ UI: Usuarios/Index.jsx → Modal (form: nombre, apellidos, correo, password, id_rol, estado)
🎮 Controller: UsuarioController@store (POST /usuarios)
🗄️ Entities: Usuario, Bitacora

Flujo:
  1. 👤 Actor click "Nuevo Usuario" → abre modal create
  2. 👤 Actor llena formulario y submit
  3. 🖥️ UI valida con StoreUsuarioRequest (nombre required, correo único, password min:6)
  4. 🖥️ UI envía POST /usuarios con form data
  5. 🎮 UsuarioController.store()
     5.1 Crea Usuario con Hash::make($request->password)
     5.2 🗄️ Bitacora::create({ accion: "INSERCIÓN", tabla_afectada: "usuario", ... })
     5.3 Redirige back con mensaje éxito
```

### 2.3 Editar Usuario
```
👤 Actor: Administrador (permiso: usuarios.escribir)
🖥️ UI: Usuarios/Index.jsx → Modal edit (campos prellenados, password opcional)
🎮 Controller: UsuarioController@update (PUT /usuarios/{usuario})
🗄️ Entities: Usuario, Bitacora
```

### 2.4 Eliminar Usuario (Borrado Lógico)
```
👤 Actor: Administrador (permiso: usuarios.escribir)
🖥️ UI: Usuarios/Index.jsx → Confirmación → Botón "Dar de Baja"
🎮 Controller: UsuarioController@destroy (DELETE /usuarios/{usuario})
🗄️ Entities: Usuario, Bitacora

Flujo:
  1. 👤 Actor click "Dar de Baja" en fila de usuario
  2. 🖥️ UI muestra confirmación
  3. 👤 Actor confirma
  4. 🖥️ UI envía DELETE /usuarios/{id}
  5. 🎮 UsuarioController.destroy()
     5.1 🗄️ Usuario::find($id)->update({ estado: 'Inactivo' })
     5.2 🗄️ Bitacora.create({ accion: "ELIMINACIÓN LÓGICA", tabla_afectada: "usuario" })
     5.3 Redirige back
```

### 2.5 Importar Usuarios Masivamente
```
👤 Actor: Administrador (permiso: usuarios.escribir)
🖥️ UI: ModalImportarUsuarios.jsx (drag & drop + file input CSV/XLSX/XLS)
🎮 Controller: UsuarioController@importar (POST /usuarios/importar)
🗄️ Entities: UsuariosImport, EnviarCredencialesUsuarioJob, BitacoraService

Flujo:
  1. 👤 Actor click "Importar Usuarios" → abre modal
  2. 👤 Actor arrastra/sube archivo Excel/CSV
  3. 🖥️ UI valida con ImportUsuariosRequest (file, mimes:csv,xlsx,xls, max:5MB)
  4. 🖥️ UI envía POST /usuarios/importar con FormData
  5. 🎮 UsuarioController.importar()
     5.1 Genera UUID único para el batch
     5.2 🗄️ (new UsuariosImport)->import($archivo) — procesa filas:
         - Busca Rol por nombre (case insensitive)
         - Valida correo único
         - Crea Usuario con import_batch = UUID
     5.3 Por cada usuario creado: ⚙️ EnviarCredencialesUsuarioJob::dispatch($usuario)
     5.4 ⚙️ BitacoraService.registrar("INSERCIÓN", "usuario")
     5.5 Retorna success con resumen: { creados, errores (por fila), import_batch }
  6. 🖥️ UI muestra resultado: "X usuarios importados, Y errores"
     6.1 👤 Actor puede click "Deshacer importación"
     6.2 🖥️ UI envía DELETE /usuarios/importar/{batch}/deshacer
     6.3 🎮 UsuarioController.deshacerImportacion()
         - 🗄️ Usuario::where('import_batch', $batch)->forceDelete()
         - ⚙️ BitacoraService.registrar("ELIMINACIÓN", "usuario")
```

---

## CU2: GESTIÓN DE ROLES Y PERMISOS (RolController)

### 2.6 Listar Roles
```
👤 Actor: Administrador (permiso: roles.leer)
🖥️ UI: Roles/Index.jsx + RolesTable
🎮 Controller: RolController@index (GET /roles)
🗄️ Entities: Rol, Modulo, Funcion

Flujo:
  1. 👤 Actor navega a /roles
  2. 🎮 RolController.index()
     2.1 🗄️ Rol::with('funciones.modulo')->get()
     2.2 🗄️ Modulo::with('funciones')->get()
     2.3 Renderiza Roles/Index.jsx con { roles, modulos }
```

### 2.7 Crear Rol con Permisos
```
👤 Actor: Administrador (permiso: roles.escribir)
🖥️ UI: RolModal (form: nombre, descripcion + matrix permisos por módulo)
🎮 Controller: RolController@store (POST /roles)
🗄️ Entities: Rol, Funcion (tabla pivote rol_funcion), Bitacora

Flujo:
  1. 👤 Actor click "Nuevo Rol" → abre RolModal
  2. 👤 Actor completa nombre, descripción y selecciona permisos por módulo
     2.1 Cada módulo muestra sus funciones con checkboxes
     2.2 Los permisos se agrupan por entidad con opciones: Leer/Escribir/Full/Sin permiso
  3. 👤 Actor submit
  4. 🖥️ UI envía POST /roles con { nombre, descripcion, funciones: [id_funcion, ...] }
  5. 🎮 RolController.store()
     5.1 🗄️ Rol::create({ nombre, descripcion })
     5.2 🗄️ $rol->funciones()->sync($request->funciones)
     5.3 🗄️ Bitacora::create({ accion: "INSERCIÓN", tabla_afectada: "rol" })
     5.4 Redirige back
```

### 2.8 Editar Rol (actualiza permisos)
```
👤 Actor: Administrador (permiso: roles.escribir)
🖥️ UI: RolModal (edición, permisos precargados)
🎮 Controller: RolController@update (PUT /roles/{rol})
🗄️ Entities: Rol, Funcion (rol_funcion), Bitacora

Flujo similar a crear, pero:
  5. 🎮 RolController.update()
     5.1 🗄️ $rol->update($request->validated())
     5.2 🗄️ $rol->funciones()->sync($request->funciones)
     5.3 Si el rol editado es el rol actual del usuario: refresca sesión (permisos)
     5.4 🗄️ Bitacora::create({ accion: "ACTUALIZACIÓN", tabla_afectada: "rol" })
```

### 2.9 Eliminar Rol
```
👤 Actor: Administrador (permiso: roles.escribir)
🖥️ UI: RolesTable (botón eliminar con confirmación)
🎮 Controller: RolController@destroy (DELETE /roles/{rol})
🗄️ Entities: Rol, Funcion, Bitacora

Flujo:
  1. 👤 Actor click "Eliminar" en roles sin usuarios asociados
  2. 🎮 RolController.destroy()
     2.1 Verifica: 🗄️ $rol->usuarios()->count() == 0? Si tiene usuarios → error
     2.2 🗄️ $rol->funciones()->detach() (elimina pivotes rol_funcion)
     2.3 🗄️ $rol->delete()
     2.4 🗄️ Bitacora.create({ accion: "ELIMINACIÓN", tabla_afectada: "rol" })
```

---

## CU4: GESTIÓN DE CARRERAS (CarreraController)

### 4.1 CRUD Carreras
```
👤 Actor: Administrador (permiso: carreras.leer/escribir)
🖥️ UI: Carreras/Index.jsx (modal create/edit: sigla max 3 chars, nombre)
🎮 Controller: CarreraController (GET/POST/PUT/DELETE /carreras)
🗄️ Entities: Carrera, Bitacora

Flujo Create:
  1. 👤 Actor click "Nueva Carrera" → modal con sigla + nombre
  2. 🖥️ UI valida StoreCarreraRequest (sigla unique, max:3; nombre unique)
  3. 🎮 CarreraController.store()
     3.1 🗄️ Carrera::create($request->validated())
     3.2 🗄️ Bitacora.create({ accion: "INSERCIÓN", tabla_afectada: "carrera" })

Flujo Delete:
  1. 👤 Actor click "Eliminar"
  2. 🎮 CarreraController.destroy()
     2.1 Valida: sin directores asociados? sin postulaciones (op1/op2)?
     2.2 🗄️ Carrera::find($id_carrera)->delete()
     2.3 🗄️ Bitacora.create({ accion: "ELIMINACIÓN", tabla_afectada: "carrera" })
```

---

## CU6: GESTIÓN DE MATERIAS (MateriaController)

### 6.1 CRUD Materias
```
👤 Actor: Administrador (permiso: materias.leer/escribir)
🖥️ UI: Materias/Index.jsx (modal: nombre)
🎮 Controller: MateriaController (GET/POST/PUT/DELETE /materias)
🗄️ Entities: Materia, Bitacora

Flujo Delete (lógico):
  1. 👤 Actor click "Desactivar"
  2. 🎮 MateriaController.destroy()
     2.1 🗄️ Materia::find($id_materia)->update({ estado: 'Inactivo' })
     2.2 🗄️ Bitacora.create({ accion: "ELIMINACIÓN LÓGICA", tabla_afectada: "materia" })

Flujo Update (reactiva automáticamente):
  1. 👤 Actor edita materia inactiva
  2. 🎮 MateriaController.update()
     2.1 🗄️ $materia->update($data + ['estado' => 'Activo'])  // Reactivación forzada
```

---

## CU9: POSTULACIÓN DOCENTE (Público)

### 9.1 Crear Postulación Docente
```
👤 Actor: Docente (público, sin autenticar)
🖥️ UI: PostulacionDocente/Create.jsx
   (form: datos personales + profesionales + materias checkbox + documentos drag & drop)
🎮 Controller: PostulacionDocenteController@store (POST /postulacion-docente)
🗄️ Entities: PostulacionDocente, RequisitoDocente, DocumentoPostulacionDocente,
    ⚙️ SupabaseStorageService, 🔄 ResendEmailService, ⚙️ BitacoraService

Flujo:
  1. 👤 Actor (docente público) navega a /postulacion-docente
  2. 🎮 PostulacionDocenteController.create()
     2.1 🗄️ RequisitoDocente::where('estado', 'Activo')->get()
     2.2 🗄️ Materia::where('estado', 'Activo')->get()
     2.3 Renderiza Create.jsx con { requisitos, materias }
  3. 👤 Actor completa: nombre, apellido, correo, teléfono, CI, profesión,
     grado académico, experiencia, disponibilidad, materias seleccionadas
  4. 👤 Actor arrastra documentos (PDF/DOC/DOCX, max 20MB c/u)
  5. 🖥️ UI envía POST /postulacion-docente con FormData (multipart)
  6. 🎮 PostulacionDocenteController.store()
     6.1 🗄️ PostulacionDocente::create({...datos personales/profesionales})
     6.2 🗄️ $postulacion->materias()->attach($request->materias)
     6.3 🗄️ RequisitoDocente::all() → crea PostulacionDocenteRequisito checks (Pendiente)
     6.4 🔄 SupabaseStorageService.subirArchivo('postulaciones-docentes', "{id}/{archivo}", $file)
         por cada documento
     6.5 🗄️ DocumentoPostulacionDocente::create({...datos del archivo})
     6.6 🔄 ResendEmailService.enviarCorreo($postulante->correo, "Confirmación", "...")
     6.7 ⚙️ BitacoraService.registrar("INSERCIÓN", "postulacion_docente")
     6.8 Redirige con mensaje de éxito
```

### 9.2 Revisar Postulación Docente (Admin)
```
👤 Actor: Administrador (permiso: postulaciones_docentes.leer/escribir)
🖥️ UI: Admin/PostulacionesDocentes/Show.jsx
   (form: requisitos con select Pendiente/Cumple/No cumple/Observado + observación)
🎮 Controller: PostulacionDocenteRevisionController
   - guardarRevision (POST .../{id}/guardar-revision)
   - cambiarEstado (POST .../{id}/cambiar-estado)
🗄️ Entities: PostulacionDocente, PostulacionDocenteRequisito, BitacoraService

Flujo guardarRevision:
  1. 👤 Actor cambia estado de requisitos y hace submit
  2. 🎮 guardarRevision()
     2.1 Por cada requisito: Upsert en PostulacionDocenteRequisito (estado + observación)
     2.2 ⚙️ BitacoraService.registrar("ACTUALIZACIÓN", "postulacion_docente")

Flujo cambiarEstado (Aprobar → crea usuario docente):
  1. 👤 Actor selecciona estado "Aprobado" y proporciona correo_acceso + password_acceso
  2. 🎮 cambiarEstado()
     2.1 Actualiza estado de PostulacionDocente
     2.2 🗄️ Usuario::create({ nombre, apellido, correo_acceso, password: Hash::make(pass), id_rol: 4 (Docente), estado: 'Activo' })
     2.3 🗄️ Docente::create({ id_usuario, ci, profesion, ... })
     2.4 🗄️ AsignacionAcademica + Horarios auto-creados con validación
     2.5 🔄 ResendEmailService.enviarCorreo(credenciales)
     2.6 ⚙️ BitacoraService.registrar("ACTUALIZACIÓN", "postulacion_docente")
```

---

## CU9: PREINSCRIPCIÓN POSTULANTES (Público)

### 9.3 Crear Preinscripción
```
👤 Actor: Postulante (público, sin autenticar)
🖥️ UI: Preinscripcion/Create.jsx (wizard 4 pasos)
   Paso 1 - Datos: nombre, apellidos, correo, teléfono, CI, fecha_nac, sexo, dirección, colegio, ciudad, turno, 2 carreras
   Paso 2 - Requisitos: documentos drag & drop
   Paso 3 - Pago: redirección a Stripe (o PasarelaPago embebido)
   Paso 4 - Estado: confirmación
🎮 Controller: PostulacionPostulanteController@store (POST /preinscripcion)
🗄️ Entities: Postulante, Postulacion, Requisito, DocumentoPostulacionPP, Carrera
    ⚙️ SupabaseStorageService, 🔄 ResendEmailService, ⚙️ BitacoraService

Flujo:
  1. 👤 Actor navega a /preinscripcion
  2. 🎮 PostulacionPostulanteController.create()
     2.1 🗄️ Carrera::all() (para selects)
     2.2 🗄️ Requisito::where('estado', 'Activo')->get()
     2.3 Renderiza Create.jsx
  3. 👤 Actor completa wizard 4 pasos y submit
  4. 🖥️ UI envía POST /preinscripcion con FormData
  5. 🎮 PostulacionPostulanteController.store()
     5.1 🗄️ Postulante::create({...datos personales})
     5.2 Genera nro_formulario único
     5.3 🗄️ Postulacion::create({ id_postulante, id_carrera_opcion_1, id_carrera_opcion_2, nro_formulario, turno, estado: 'Pendiente', token_pago: Str::random(64) })
     5.4 🗄️ Requisito::all() → crea PostulacionRequisito checks
     5.5 🔄 SupabaseStorageService.subirArchivo('postulaciones-postulantes', ...) por cada doc
     5.6 🔄 ResendEmailService.enviarCorreo(confirmación con nro_formulario)
     5.7 ⚙️ BitacoraService.registrar("INSERCIÓN", "postulacion")
     5.8 Redirige a /preinscripcion/{id} con datos de pago
```

### 9.4 Revisar Postulación Postulante (Admin)
```
👤 Actor: Administrador (permiso: postulaciones_postulantes.leer/escribir)
🖥️ UI: Admin/PostulacionesPostulantes/Show.jsx
   (form: requisitos + estado: Observado/Rechazado/Pago/Aprobado)
🎮 Controller: PostulacionPostulanteRevisionController (guardarRevision + cambiarEstado)
🗄️ Entities: Postulacion, PostulacionRequisito, InscripcionCup, Grupo, GestionCup, BitacoraService

Flujo cambiarEstado (Aprobar):
  1. 👤 Actor cambia estado a "Aprobado"
  2. 🎮 PostulacionPostulanteRevisionController.cambiarEstado()
     2.1 Valida transición: solo Pago → Aprobado
     2.2 Actualiza Postulacion.estado_postulacion = 'Aprobado'
     2.3 Busca GestionCup activa
     2.4 Asigna grupo: busca grupo con cupo disponible del turno del postulante
         Si no hay: crea Grupo automáticamente
     2.5 🗄️ InscripcionCup::create({ id_postulacion, id_grupo, id_gestion_cup, estado: 'Activo' })
     2.6 🔄 ResendEmailService.enviarCorreo(notificación de aprobación)
     2.7 ⚙️ BitacoraService.registrar("ACTUALIZACIÓN", "postulacion")
```

---

## CU9: KANBAN BOARD

### 9.5 Mover Postulación en Kanban
```
👤 Actor: Administrador (permiso: postulaciones_postulantes.leer/escribir)
🖥️ UI: KanbanBoard (drag & drop cards entre 5 columnas: Pendiente/Observado/Pago/Aprobado/Rechazado)
🎮 Controller: PostulacionKanbanController
   - tablero (POST /admin/kanban/tablero)
   - mover (POST /admin/kanban/mover/{id})
🗄️ Entities: Postulacion, BitacoraService

Flujo:
  1. 🖥️ KanbanBoard carga → POST /admin/kanban/tablero
  2. 🎮 PostulacionKanbanController.tablero()
     2.1 🗄️ Postulacion::with('postulante', 'carrera1', 'documentos')->get()
     2.2 Agrupa por estado_postulacion
     2.3 Retorna JSON { Pendiente: [...], Observado: [...], Pago: [...], Aprobado: [...], Rechazado: [...] }
  3. 👤 Actor arrastra card de columna origen a columna destino
  4. 🖥️ UI hace optimistic update inmediato
  5. 🖥️ UI envía POST /admin/kanban/mover/{id} con { estado: nuevoEstado }
  6. 🎮 PostulacionKanbanController.mover()
     6.1 Verifica que postulación no esté en estado final
     6.2 🗄️ Postulacion::find($id)->update({ estado_postulacion: $nuevoEstado })
     6.3 ⚙️ BitacoraService.registrar("ACTUALIZACIÓN", "postulacion", "Cambio de estado: X → Y en Kanban")
     6.4 Retorna JSON { success: true }
  7. Si falla: 🖥️ UI revierte optimistic update y muestra error
```

---

## CU10: PAGOS CON STRIPE

### 10.1 Crear Sesión de Pago
```
👤 Actor: Postulante (autenticado en sesión)
🖥️ UI: Financiero/PasarelaPago.jsx (botón "Pagar ahora con Stripe")
🎮 Controller: PagoController@createCheckoutSession (POST /financiero/pago/crear-sesion)
🗄️ Entities: Postulacion, Pago, 🔄 Stripe API, ⚙️ BitacoraService

Flujo:
  1. 👤 Actor click "Pagar ahora con Stripe"
  2. 🖥️ UI envía POST /financiero/pago/crear-sesion con { id_postulacion, token }
  3. 🎮 PagoController.createCheckoutSession()
     3.1 Valida: usuario autenticado? postulación existe? postulante corresponde al usuario? no existe pago confirmado?
     3.2 Calcula monto: 350 Bs = 35000 centavos (definido en backend — seguridad)
     3.3 🔄 Stripe\Checkout\Session::create({
           line_items: [{ price_data: { currency: 'BOB', product_data: { name: 'Preinscripción CUP' }, unit_amount: 35000 } }],
           mode: 'payment',
           success_url: route('pago.exito') + '?session_id={CHECKOUT_SESSION_ID}',
           cancel_url: route('pago.cancelado'),
           metadata: { id_postulacion, id_usuario }
         })
     3.4 🗄️ Pago::create({ id_postulacion, monto: 350, estado_pago: 'Pendiente', cod_transaccion: $session->id })
     3.5 Retorna JSON { url: $session->url }
  4. 🖥️ UI recibe URL y redirige a Stripe Checkout
```

### 10.2 Retorno Exitoso de Stripe
```
👤 Actor: Postulante (redirigido desde Stripe)
🖥️ UI: Financiero/PasarelaPago.jsx (vista success)
🎮 Controller: PagoController@pagoExito (GET /financiero/pago/exito?session_id=xxx)
🗄️ Entities: Pago, Postulacion, Usuario, 🔄 Stripe API, 🔄 ResendEmailService, ⚙️ BitacoraService

Flujo:
  1. 🔄 Stripe redirige al postulante a GET /financiero/pago/exito?session_id=xxx
  2. 🎮 PagoController.pagoExito()
     2.1 🔄 Stripe\Checkout\Session::retrieve($session_id)
     2.2 Si payment_status = 'paid': confirmar pago
     2.3 ⚙️ PagoController.procesarConfirmacionPago($session_id, $id_postulacion)
         - 🗄️ Pago::where('cod_transaccion', $session_id)->update({ estado_pago: 'Confirmado', fecha_pago: now() })
         - 🗄️ Postulacion::find($id_postulacion)->update({ estado: 'Aprobado', id_usuario_creado: $nuevoUserId })
         - 🗄️ Usuario::create({ nombre, apellidos, correo, password: Hash::make(aleatorio), id_rol: 5 (Postulante), estado: 'Activo' })
         - Asocia usuario al Postulante
         - 🔄 ResendEmailService.enviarCorreo(credenciales)
         - ⚙️ BitacoraService.registrar("ACTUALIZACIÓN", "pago")
     2.4 Renderiza vista success
```

### 10.3 Webhook Stripe (Confirmación Real)
```
👤 Actor: 🔄 Stripe (sistema externo, sin sesión)
🖥️ UI: (ninguna — es endpoint POST)
🎮 Controller: PagoController@handleWebhook (POST /stripe/webhook)
🗄️ Entities: Pago, Postulacion, Usuario, 🔄 ResendEmailService, ⚙️ BitacoraService

Flujo:
  1. 🔄 Stripe envía POST /stripe/webhook con evento checkout.session.completed
  2. 🎮 PagoController.handleWebhook()
     2.1 🔄 Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret)
     2.2 Si evento = 'checkout.session.completed':
         - Extrae session_id y metadata.id_postulacion
         - ⚙️ procesarConfirmacionPago($session_id, $id_postulacion)
         - Retorna response()->json(['status' => 'success'])
     2.3 Retorna response()->json(['status' => 'received'])
```

---

## GESTIÓN ACADÉMICA

### Aulas CRUD (CU13)
```
👤 Actor: Administrativo (permiso: aulas.leer/escribir)
🖥️ UI: Administrativo/Aulas/Index.jsx (modal: codigo, nombre, capacidad_maxima, ubicacion)
🎮 Controller: AulaController (GET/POST/PUT/DELETE /aulas)
🗄️ Entities: Aula, BitacoraService
```

### Grupos CRUD + Generación Automática
```
👤 Actor: Administrativo (permiso: grupos.leer/escribir)
🖥️ UI: Administrativo/Grupos/Index.jsx (modal: gestion, sigla, cupo_maximo, turno, modalidad)
🎮 Controller: GrupoController (CRUD) + AcademicGroupService
🗄️ Entities: Grupo, GestionCup, ⚙️ AcademicGroupService, BitacoraService

Flujo Generar:
  1. 👤 Actor click "Generar Grupos" → confirmación
  2. 🎮 GrupoController.generar()
     2.1 ⚙️ AcademicGroupService.generarGrupos($idGestionCup, $turno)
         - Cuenta postulaciones aprobadas del turno
         - Crea grupos de 80 estudiantes (redondea hacia arriba)
         - Siglas: GRUPO-1, GRUPO-2, ...
     2.2 ⚙️ BitacoraService.registrar("INSERCIÓN", "grupo")
```

### Horarios CRUD + Validación de Cruces
```
👤 Actor: Administrativo (permiso: horarios.leer/escribir)
🖥️ UI: Administrativo/Horarios/Index.jsx (modal: asignacion, aula, dia_semana, hora_inicio, hora_fin)
🎮 Controller: HorarioController (CRUD) + ⚙️ AcademicValidationService
🗄️ Entities: Horario, AsignacionAcademica, Aula, AcademicValidationService, BitacoraService

Flujo validación compleja:
  1. 👤 Actor crea/edita horario
  2. 🎮 HorarioController.store()
     2.1 ⚙️ AcademicValidationService.validarCruces($data)
         - Cruce de aula: misma aula, mismo día, horario traslapado
         - Cruce de grupo: mismo grupo, mismo día, horario traslapado
         - Cruce de docente: mismo docente, mismo día, horario traslapado
     2.2 ⚙️ AcademicValidationService.validarCargaHoraria($data)
         - Suma de horas del docente no excede límite
     2.3 Si validación pasa → 🗄️ Horario::create()
     2.4 ⚙️ BitacoraService.registrar("INSERCIÓN", "horario")
```

### Asignación Académica CRUD
```
👤 Actor: Administrativo (permiso: asignacion_academica.leer/escribir)
🖥️ UI: Administrativo/AsignacionAcademica/Index.jsx (modal: materia, grupo, docente, gestion, carga_horaria)
🎮 Controller: AsignacionAcademicaController (CRUD) + ⚙️ AcademicValidationService
🗄️ Entities: AsignacionAcademica, DocenteMateria, AcademicValidationService, BitacoraService

Flujo store:
  1. 👤 Actor crea asignación
  2. 🎮 AsignacionAcademicaController.store()
     2.1 Valida: docente habilitado para materia (DocenteMateria activo)
     2.2 Valida: no duplicado (mismo materia+grupo+docente+gestion)
     2.3 Valida: límite de grupos por docente
     2.4 🗄️ AsignacionAcademica::create()
     2.5 ⚙️ BitacoraService.registrar("INSERCIÓN", "asignacion_academica")
```

---

## EVALUACIONES Y RESULTADOS

### Evaluaciones CRUD
```
👤 Actor: Administrador (permiso: evaluaciones.leer/escribir)
🖥️ UI: Admin/Evaluaciones/Index.jsx (modal: materia, gestion, nombre, porcentaje, puntaje_max, fecha)
🎮 Controller: EvaluacionController (CRUD)
🗄️ Entities: Evaluacion, Materia, GestionCup, BitacoraService

Flujo store con validación:
  1. 👤 Actor crea evaluación
  2. 🎮 EvaluacionController.store()
     2.1 Valida: max 3 evaluaciones ACTIVAS por materia+gestion
     2.2 Valida: suma de porcentajes ≤ 100% (incluyendo la nueva)
     2.3 🗄️ Evaluacion::create({ ... })
     2.4 ⚙️ BitacoraService.registrar("INSERCIÓN", "evaluacion")
```

### Calcular Resultados CUP
```
👤 Actor: Administrador (permiso: resultados_cup.leer/escribir)
🖥️ UI: Admin/ResultadosCup/Index.jsx (botones "Calcular" / "Calcular todos")
🎮 Controller: ResultadoCupController (POST .../{id}/calcular, POST .../calcular-todos)
🗄️ Entities: Nota, ResultadoCup, InscripcionCup, Evaluacion

Flujo calcular individual:
  1. 👤 Actor click "Calcular" en fila de estudiante
  2. 🎮 ResultadoCupController.calcular($id)
     2.1 🗄️ Nota::where('id_inscripcion_cup', $id)->with('evaluacion')->get()
     2.2 Para cada materia: verifica si nota < 60 en alguna → REPROBADO
     2.3 Si no: calcula promedio ponderado:
         - Parcial 1 (30%), Parcial 2 (30%), Examen Final (40%)
         - promedio = Σ(nota × porcentaje) / Σ(porcentaje)
     2.4 🗄️ ResultadoCup::updateOrCreate({ id_inscripcion_cup: $id }, {
           promedio_general: $promedio,
           estado_resultado: $promedio >= 60 ? 'APROBADO' : 'REPROBADO'
         })
```

### Asignación a Carrera por Mérito
```
👤 Actor: Administrador (permiso: asignacion_carrera.escribir)
🖥️ UI: Admin/AsignacionCarrera/Index.jsx (botón "Ejecutar asignación por mérito")
🎮 Controller: AsignacionCarreraController@ejecutarAsignacion
   (POST /admin/asignacion-carrera/ejecutar)
🗄️ Entities: ResultadoCup, CupoCarrera, AdmisionCarrera, Carrera, BitacoraService

Flujo:
  1. 👤 Actor click "Ejecutar asignación por mérito"
  2. 🎮 AsignacionCarreraController.ejecutarAsignacion()
     2.1 🗄️ ResultadoCup::where('estado_resultado', 'APROBADO')
            ->where('id_gestion_cup', $gestionId)
            ->orderBy('promedio_general', 'DESC')
            ->get()
     2.2 Por cada estudiante (orden descendente por promedio):
         2.2.1 Intenta opción 1: si hay cupo → asigna
         2.2.2 Si no: intenta opción 2: si hay cupo → asigna
         2.2.3 Si no: busca carrera libre (distinta a op1/op2) con cupo → asigna
         2.2.4 Si no: marca estado_admision = 'Pendiente'
         2.2.5 🗄️ AdmisionCarrera::create({ id_resultado_cup, id_carrera_asignada, tipo_asignacion, ... })
         2.2.6 🗄️ CupoCarrera::increment('cupos_ocupados')
     2.3 ⚙️ BitacoraService.registrar("INSERCIÓN", "admision_carrera")
```

---

## ASISTENCIA (QR/PIN)

### Docente: Registrar Entrada con QR
```
👤 Actor: Docente (autenticado)
🖥️ UI: Docente/Asistencia/Index.jsx (botón "QR" → modal con QR animado que rota cada 15s)
🎮 Controller: Docente\AsistenciaController
   - generarQr (POST /docente/asistencia/generar-qr)
   - registrarEntrada (POST /docente/asistencia/entrada)
🗄️ Entities: AsignacionAcademica, AsistenciaDocente, ⚙️ QrTokenService, BitacoraService

Flujo:
  1. 👤 Actor click "QR" → modal muestra QR
  2. 🎮 Docente\AsistenciaController.generarQr()
     2.1 ⚙️ QrTokenService.generarToken('qr', 15, { id_asignacion, id_docente })
         → Genera token de 64 chars, almacena en cache con TTL 15s
     2.2 Retorna JSON { token, expires_in: 15 }
  3. 🖥️ UI genera QR code en canvas (regenera cada 15s)
  4. 👤 Actor escanea QR con su teléfono o hace clic en "Registrar Entrada"
  5. 🥇🎮 Docente\AsistenciaController.registrarEntrada()
     5.1 ⚙️ QrTokenService.validarToken($token, 'qr') — verifica en cache
     5.2 🗄️ AsistenciaDocente::create({ id_asignacion_academica, id_docente, fecha, hora_entrada: now(), estado: 'Presente' })
     5.3 ⚙️ BitacoraService.registrar("INSERCIÓN", "asistencia_docente")
```

### Docente: Marcar Estudiante con PIN
```
👤 Actor: Docente (autenticado)
🖥️ UI: Docente/Asistencia/Index.jsx (botón "Código" → PIN grande 6 dígitos + botón "Lista" → modal estudiantes)
🎮 Controller: Docente\AsistenciaController
   - generarPin (POST /docente/asistencia/generar-pin)
   - registrarEstudiante (POST /docente/asistencia/registrar-estudiante)
🗄️ Entities: AsignacionAcademica, AsistenciaEstudiante, ⚙️ QrTokenService, BitacoraService

Flujo:
  1. 👤 Actor (docente) click "Código" → PIN mostrado grande en pantalla
  2. 👤 Actor (docente) click "Lista" → modal con estudiantes del grupo
  3. 👤 Actor click Presente/Ausente/Tardanza por cada estudiante
  4. 🖥️ UI envía POST /docente/asistencia/registrar-estudiante
  5. 🎮 Docente\AsistenciaController.registrarEstudiante()
     5.1 🗄️ AsistenciaEstudiante::updateOrCreate({ ... }, { estado: $estado })
     5.2 ⚙️ BitacoraService.registrar("INSERCIÓN", "asistencia_estudiante")
```

### Postulante: Marcar Asistencia Escaneando QR
```
👤 Actor: Postulante (autenticado)
🖥️ UI: Postulante/Asistencia/Index.jsx (escáner QR con cámara o keypad PIN)
🎮 Controller: Postulante\AsistenciaController
   - escanearQr (POST /postulante/asistencia/escanear)
   - validarPin (POST /postulante/asistencia/validar-pin)
🗄️ Entities: InscripcionCup, AsistenciaEstudiante, ⚙️ QrTokenService

Flujo QR:
  1. 👤 Actor activa cámara, escanea QR del docente
  2. 🎮 Postulante\AsistenciaController.escanearQr()
     2.1 ⚙️ QrTokenService.validarToken($token, 'qr')
     2.2 🗄️ AsistenciaEstudiante::create({ id_inscripcion_cup, fecha, hora_entrada: now(), estado: 'Presente' })
     2.3 Retorna JSON { success: true, mensaje: "Asistencia registrada" }
```

---

## REPORTES Y ANALÍTICA

### Generar Reporte
```
👤 Actor: Administrador / Administrativo (permiso: reportes.leer)
🖥️ UI: Administrativo/Reportes/Index.jsx
   (selector 8 tipos + PanelFiltros + Tabla/Gráfico + BotonExportar)
🎮 Controller: ReporteController
   - generar (POST /admin/reportes/generar)
   - exportarCsv (POST /admin/reportes/exportar/csv)
   - exportarPdf (POST /admin/reportes/exportar/pdf)
   - exportarExcel (POST /admin/reportes/exportar/excel)
🗄️ Entities: Postulacion, ResultadoCup, Grupo, Materia, AsignacionAcademica...

Flujo generar:
  1. 👤 Actor selecciona tipo de reporte (ej: "Lista General")
  2. 👤 Actor configura filtros (gestión, carrera, estado, etc.)
  3. 👤 Actor click "Generar Reporte"
  4. 🖥️ UI envía POST /admin/reportes/generar con { tipo, filtros }
  5. 🎮 ReporteController.generar()
     5.1 Según tipo, llama método privado:
         - reporteListaGeneral(): 🗄️ Postulacion::with(...)->get()
         - reporteAprobados(): 🗄️ ResultadoCup::where('estado', 'APROBADO')->get()
         - reporteEstadisticasMateria(): 🗄️ Materia::with('evaluaciones.notas')->get()
         - ... (8 tipos)
     5.2 Retorna JSON { columns: [...], data: [...], chart: { type: 'bar'|'pie', labels, values } }
  6. 🖥️ UI renderiza tabla y/o gráfico según vista seleccionada
  7. 👤 Actor puede exportar a CSV/PDF/Excel
```

### Sala de Situación (Tiempo Real)
```
👤 Actor: Administrador (permiso: reportes.leer)
🖥️ UI: Admin/SalaSituacion/Index.jsx (auto-refresh 15s, toggle dark/light)
   8 KPI Glow cards, FeedTicker, BarrasCiudades, GraficoHora, TimelineFlash
🎮 Controller: SalaSituacionController@estadisticas (POST /admin/sala-situacion/estadisticas)
🗄️ Entities: Postulacion, Pago, InscripcionCup, Postulante, Docente, ResultadoCup

Flujo:
  1. 🖥️ UI monta → POST /admin/sala-situacion/estadisticas
  2. 🎮 SalaSituacionController.estadisticas()
     2.1 KPIs Hoy: Postulaciones hoy, Pagos hoy, Inscripciones hoy, Resultados hoy
     2.2 KPIs Semana: Postulaciones semana, Pagos semana
     2.3 Totales: Total postulantes, Total docentes
     2.4 🗄️ Postulacion::selectRaw('HOUR(fecha_postulacion) as hora, COUNT(*) as total')->groupBy('hora')->get()
     2.5 🗄️ Postulante::select('ciudad', DB::raw('COUNT(*) as total'))->groupBy('ciudad')->get()
     2.6 🗄️ Reciente: Últimas 10 actividades (Postulaciones, Pagos, Resultados)
     2.7 🗄️ Estados: COUNT agrupado por estado_postulacion
     2.8 Retorna JSON { kpis, feed, ciudades, horas, estados }
  3. 🖥️ UI actualiza cada 15s via setInterval → repite paso 1
  4. 👤 Actor puede toggle dark/light mode (persiste en estado local)
```

### Consulta por Voz
```
👤 Actor: Administrador (permiso: reportes.leer)
🖥️ UI: ModalVoz.jsx (mic button + transcript + consultar)
   + FloatingMic.jsx (botón flotante)
🎮 Controller: ConsultaVozController@procesar (POST /admin/consultavoz/procesar)
🗄️ Entities: ⚙️ InterpretadorConsultaService, ReporteController, ConsultaVoz, BitacoraService

Flujo:
  1. 👤 Actor click mic flotante → abre ModalVoz
  2. 👤 Actor habla o escribe: "¿Cuántos postulantes aprobaron esta gestión?"
  3. 🖥️ UI envía POST /admin/consultavoz/procesar con { consulta_texto }
  4. 🎮 ConsultaVozController.procesar()
     4.1 ⚙️ InterpretadorConsultaService.interpretar($texto)
         - Analiza palabras clave → determina tipo reporte + filtros
         - Ej: "aprobados" → tipo: aprobados, "esta gestión" → gestión actual
     4.2 🎮 ReporteController.generar() con los parámetros interpretados
     4.3 🗄️ ConsultaVoz::create({ consulta_texto, resultado, id_usuario })
     4.4 ⚙️ BitacoraService.registrar("INSERCIÓN", "consulta_voz")
     4.5 Retorna JSON { tipo, resultado, resumen_textual }
  5. 🖥️ UI muestra resumen textual + opción "Abrir en Reportes"
```

---

## TRAYECTORIAS (TIMELINE VISUAL)

### Trayectoria Pública
```
👤 Actor: Postulante / Cualquiera con token
🖥️ UI: Trayectoria/Publica.jsx (timeline vertical animado 7 etapas con scroll reveal)
🎮 Controller: TrayectoriaController@publica (GET /trayectoria/{token})
🗄️ Entities: Postulacion

Flujo:
  1. 👤 Actor abre enlace: /trayectoria/{token_pago}
  2. 🎮 TrayectoriaController.publica($token)
     2.1 🗄️ Postulacion::with('postulante', 'pagos', 'inscripcionCup.resultado.admisionCarreras')
            ->where('token_pago', $token)->firstOrFail()
     2.2 ⚙️ generarNodos($postulacion) → 7 etapas:
         1. Postulación (completado si existe)
         2. Revisión de Documentos (completado si estado != Pendiente)
         3. Pago (completado si existe pago Confirmado)
         4. Inscripción (completado si existe InscripcionCup)
         5. Evaluaciones (completado si existe Nota)
         6. Resultados (completado si existe ResultadoCup)
         7. Admisión (completado si existe AdmisionCarrera)
     2.3 Renderiza Publica.jsx con { postulante, nodos }
  3. 👤 Actor scrollea → cada nodo se anima secuencialmente (Framer Motion)
```

### Trayectoria Admin (Buscador)
```
👤 Actor: Administrador (permiso: postulaciones_postulantes.leer)
🖥️ UI: Admin/Trayectorias/Index.jsx (input búsqueda con debounce 300ms + timeline)
🎮 Controller: TrayectoriaController@buscar (POST /admin/trayectorias/buscar)
🗄️ Entities: Postulacion

Flujo:
  1. 👤 Actor escribe en buscador (mínimo 3 caracteres)
  2. 🖥️ UI debounce 300ms → POST /admin/trayectorias/buscar { busqueda }
  3. 🎮 TrayectoriaController.buscar()
     3.1 🗄️ Postulacion::whereHas('postulante', fn($q) =>
            $q->where('ci', 'ILIKE', "%{$busqueda}%")
              ->orWhere('nombre', 'ILIKE', "%{$busqueda}%")
              ->orWhere('apellidos', 'ILIKE', "%{$busqueda}%")
         )->with('postulante.carrera1')->get()
     3.2 Retorna JSON [{ id, nro_formulario, postulante, carrera }]
  4. 🖥️ UI muestra resultados en lista
  5. 👤 Actor click en resultado → muestra timeline con 7 nodos
```

---

## NOTIFICACIONES Y BITÁCORA

### Centro de Notificaciones
```
👤 Actor: Administrador / cualquier rol autenticado
🖥️ UI: PanelNotificaciones.jsx (dropdown en Navbar, polling 30s)
🎮 Controller: NotificacionController
   - noLeidas (GET /admin/notificaciones/no-leidas)
   - marcarLeida (POST /admin/notificaciones/{id}/leida)
   - marcarTodasLeidas (POST /admin/notificaciones/todas-leidas)
🗄️ Entities: Notificacion

Flujo:
  1. 🖥️ UI monta → setInterval 30s → GET /admin/notificaciones/no-leidas
  2. 🎮 NotificacionController.noLeidas()
     2.1 🗄️ Notificacion::where('leida', false)->latest()->take(10)->get()
     2.2 Retorna JSON { notificaciones, total }
  3. 🖥️ UI actualiza badge con total no leídas
  4. 👤 Actor click campana → abre dropdown con lista
  5. 👤 Actor click en notificación → POST /admin/notificaciones/{id}/leida
  6. 👤 Actor click "Marcar todas" → POST /admin/notificaciones/todas-leidas
```

### Visor de Bitácora
```
👤 Actor: Administrador (permiso: bitacora.leer)
🖥️ UI: Admin/Bitacora/Index.jsx (filtros: acción, usuario, fecha_desde, fecha_hasta)
🎮 Controller: BitacoraController@index (GET /admin/bitacora)
🗄️ Entities: Bitacora, Usuario

Flujo:
  1. 👤 Actor navega a /admin/bitacora
  2. 🎮 BitacoraController.index()
     2.1 🗄️ Bitacora::with('usuario')->orderBy('fecha_hora', 'DESC')
     2.2 Aplica filtros: accion LIKE, id_usuario, fecha_desde, fecha_hasta
     2.3 🗄️ Usuario::all() (para combo filtro)
     2.4 Renderiza Index.jsx con { registros, usuarios, filtros }
  3. 👤 Actor puede filtrar y buscar
```

---

## DASHBOARDS (ACTUALMENTE VACÍOS)

### Admin Dashboard
```
👤 Actor: Administrador
🖥️ UI: Admin/Dashboard.jsx → ACTUALMENTE VACÍO (solo `<h1>Panel de Administración</h1>`)
🎮 Controller: Admin\DashboardController@index (GET /admin/dashboard)
🗄️ Entities: (ninguno consultado actualmente)
```

### Docente Dashboard
```
👤 Actor: Docente
🖥️ UI: Docente/Dashboard.jsx → ACTUALMENTE VACÍO (solo `<h1>Panel del Docente</h1>`)
```

### Postulante Dashboard
```
👤 Actor: Postulante
🖥️ UI: Postulante/Dashboard.jsx → ACTUALMENTE VACÍO (solo `<h1>Panel del Postulante</h1>`)
```

### Director Dashboard
```
👤 Actor: Director de Carrera
🖥️ UI: Director/Dashboard.jsx → ACTUALMENTE MÍNIMO (welcome + nombre + rol + logout)
```

### Administrativo Dashboard
```
👤 Actor: Administrativo
🖥️ UI: Administrativo/Dashboard.jsx → ACTUALMENTE MÍNIMO
```

---

## RESUMEN GENERAL PARA DIAGRAMAS UML

### 1. DIAGRAMAS DE CLASES
Entidades principales con relaciones:
- **Usuario** (1) ⟷ (N) **Rol** → (N) ⟷ (N) **Funcion** → (N) ⟷ (1) **Modulo**
- **Carrera** (1) ⟷ (N) **CupoCarrera** | **Carrera** (1) ⟷ (N) **DirectorCarrera**
- **Postulante** (1) ⟷ (N) **Postulacion** → (N) ⟷ (N) **Requisito** (via PostulacionRequisito)
- **Postulacion** (1) ⟷ (1) **Pago** | (1) ⟷ (1) **InscripcionCup**
- **InscripcionCup** (N) ⟷ (1) **Grupo** | (1) ⟷ (N) **AsistenciaEstudiante**
- **InscripcionCup** (1) ⟷ (N) **Nota** → (N) ⟷ (1) **Evaluacion**
- **InscripcionCup** (1) ⟷ (1) **ResultadoCup** → (1) ⟷ (N) **AdmisionCarrera**
- **Grupo** (1) ⟷ (N) **Horario** → (N) ⟷ (1) **Aula**
- **AsignacionAcademica** (N) ⟷ (1) **Materia** | (N) ⟷ (1) **Docente** | (N) ⟷ (1) **Grupo**
- **Docente** (N) ⟷ (N) **Materia** (via DocenteMateria)

### 2. DIAGRAMAS DE SECUENCIA (más importantes)
Prioridad sugerida:
1. Inicio de sesión (CU1) — flujo base
2. Crear postulación postulante (CU9) — flujo público más complejo
3. Pagar con Stripe (CU10) — incluye sistema externo
4. Aprobar docente con creación automática de usuario (CU9)
5. Mover tarjeta en Kanban (CU9) — optimistic update
6. Calcular resultados CUP y asignar a carrera por mérito
7. Registrar asistencia con QR (docente + postulante)

### 3. ACTORES DEL SISTEMA
| Actor | Descripción | Módulos que usa |
|-------|-------------|-----------------|
| Administrador | Acceso total al panel | Todos los módulos admin |
| Administrativo | Gestión académica | Aulas, Grupos, Horarios, Asignaciones, Docentes-Materias, Reportes |
| Docente | Marca asistencia, ve horarios | Dashboard, Asistencia Docente |
| Director de Carrera | Consulta información | Dashboard (limitado) |
| Postulante | Preinscripción, pago, asistencia | Preinscripción, Asistencia Postulante |
| Público (sin auth) | Postulación docente, preinscripción | PostulacionDocente, Preinscripcion |

### 4. SISTEMAS EXTERNOS
| Sistema | Uso | Endpoints |
|---------|-----|-----------|
| Stripe | Pasarela de pagos | createCheckoutSession, pagoExito, handleWebhook |
| Supabase Storage | Almacenamiento documentos | subirArchivo, descargarArchivo |
| Resend API | Correos electrónicos | enviarCorreo (confirmación, credenciales, recuperación) |
