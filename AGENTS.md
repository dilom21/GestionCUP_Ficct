# GestionCUP_Ficct - Documentación para IA

## 📋 Resumen del Proyecto

**Sistema de Gestión del Curso Preuniversitario (CUP)** para la **Facultad de Ciencias de la Computación y Telecomunicaciones (FICCT)**. Es una plataforma web que gestiona todo el ciclo de admisión: postulaciones, pagos, revisión de documentos, asignación de roles/permisos, y administración de carreras/materias.

---

## 🏗 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Laravel** | 12.x | Backend PHP (API + MVC) |
| **React** | 18.x | Frontend SPA |
| **Inertia.js** | 2.x | Bridge Laravel ↔ React (SPA sin API REST) |
| **TailwindCSS** | 3.x/4.x | Estilos utilitarios |
| **Vite** | 7.x | Bundler frontend |
| **Stripe** (stripe-php + stripe-js) | ~20.x / ~9.x | Pasarela de pagos |
| **Supabase Storage** | - | Almacenamiento de documentos (PDF, DOC, DOCX) |
| **Resend** | - | Envío de correos electrónicos |
| **Headless UI** | ^2.0 | Componentes UI accesibles |
| **Framer Motion** | ^12.40 | Animaciones React |
| **Axios** | ^1.11 | Cliente HTTP |
| **Ziggy** | ^2.0 | Rutas Laravel en JS |

---

## 🧱 Arquitectura del Sistema

### Backend (Laravel)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── AuthManualController.php      # Login/Logout manual (CU1)
│   │   │   └── PasswordResetManualController.php  # Reset de contraseña
│   │   ├── Admin/
│   │   │   ├── BitacoraController.php         # Visor de bitácora
│   │   │   ├── PostulacionDocenteRevisionController.php  # Revisión docentes
│   │   │   └── PostulacionPostulanteRevisionController.php # Revisión postulantes
│   │   ├── Financiero/
│   │   │   └── PagoController.php             # Stripe Checkout (CU10)
│   │   ├── Materias/
│   │   │   └── MateriaController.php          # CRUD Materias (CU6)
│   │   ├── CarreraController.php              # CRUD Carreras (CU4)
│   │   ├── PostulacionDocenteController.php   # Postulación pública docentes
│   │   ├── PostulacionPostulanteController.php # Preinscripción pública postulantes
│   │   ├── RolController.php                  # CRUD Roles + permisos (CU2)
│   │   └── UsuarioController.php              # CRUD Usuarios (CU2)
│   ├── Middleware/
│   │   └── HandleInertiaRequests.php          # Comparte datos auth con frontend
│   └── Requests/
│       ├── StoreUsuarioRequest.php
│       ├── UpdateUsuarioRequest.php
│       ├── ImportUsuariosRequest.php
│       ├── StoreRolRequest.php
│       ├── UpdateRolRequest.php
│       ├── StoreCarreraRequest.php
│       ├── UpdateCarreraRequest.php
│       ├── StoreMateriaRequest.php
│       └── UpdateMateriaRequest.php
├── Models/
│   ├── Usuario.php               # Autenticación (extends Authenticatable)
│   ├── Rol.php                   # Roles con permisos (belongsToMany Funcion)
│   ├── Funcion.php               # Permisos individuales
│   ├── Modulo.php                # Módulos del sidebar (agrupan funciones)
│   ├── Carrera.php               # Carreras universitarias
│   ├── Materia.php               # Materias académicas
│   ├── Postulante.php            # Postulantes al CUP
│   ├── Postulacion.php           # Postulaciones (elige 2 carreras)
│   ├── Pago.php                  # Pagos con Stripe
│   ├── Bitacora.php              # Auditoría de acciones
│   ├── DirectorCarrera.php       # Directores de carrera
│   ├── PostulacionDocente.php    # Postulaciones docentes
│   └── ... (otros modelos)
├── Imports/
│   └── UsuariosImport.php        # Importación masiva Excel/CSV (CU2)
├── Jobs/
│   └── EnviarCredencialesUsuarioJob.php  # Envío cola de credenciales
├── Services/
│   ├── SupabaseStorageService.php # Subida/descarga de documentos
│   ├── BitacoraService.php       # Registro centralizado de auditoría
│   └── ResendEmailService.php    # Envío de correos
└── Providers/
    └── ...
```

### Frontend (React + Inertia)

```
resources/js/
├── Components/
│   └── navigation/
│       ├── SidebarAdmin.jsx      # Barra lateral dinámica con permisos
│       └── Navbar.jsx            # Barra superior
├── Data/
│   └── sidebarConfig.js          # Config centralizada de módulos/permisos
├── Helpers/
│   └── Permisos.js               # Helper de permisos (comprobar, sincronizar)
├── Layouts/
│   └── AdminLayout.jsx           # Layout principal admin (sidebar + navbar)
├── Pages/
│   ├── Auth/
│   │   └── Login.jsx             # Página de inicio de sesión
│   ├── Admin/
│   │   └── Dashboard.jsx         # Dashboard Administrador
│   ├── Administrativo/
│   │   └── Dashboard.jsx
│   ├── Docente/
│   │   └── Dashboard.jsx
│   ├── Director/
│   │   └── Dashboard.jsx
│   ├── Roles/
│   │   ├── Index.jsx             # CRUD Roles con permisos
│   │   ├── _components/
│   │   │   ├── RolesPageHeader.jsx
│   │   │   ├── RolesTable.jsx
│   │   │   ├── RolModal.jsx
│   │   │   ├── PermisosModuloAccordion.jsx
│   │   │   └── PermisosViewModal.jsx
│   │   ├── _hooks/
│   │   │   └── useGestionRoles.js
│   │   └── _constants/
│   │       └── roles.js
│   ├── Usuarios/
│   │   └── Index.jsx             # CRUD Usuarios
│   ├── Carreras/
│   │   └── Index.jsx             # CRUD Carreras
│   ├── Materias/
│   │   └── Index.jsx             # CRUD Materias
│   ├── Financiero/
│   │   ├── Pagos.jsx             # Listado de pagos
│   │   └── PasarelaPago.jsx      # Página éxito/cancelación Stripe
│   ├── Admin/
│   │   ├── PostulacionesDocentes/  # Revisión postulaciones docentes
│   │   └── PostulacionesPostulantes/ # Revisión postulaciones postulantes
│   ├── Preinscripcion/
│   │   └── Pago.jsx              # Pago de preinscripción
│   └── Welcome.jsx               # Landing page
```

---

## 🔐 Sistema de Autenticación (CU1)

**Archivo principal:** `AuthManualController.php`

**Características:**
- Autenticación basada en **sesión** (no JWT, no Sanctum)
- Tabla `usuario` con campos: `nombre`, `apellidos`, `correo`, `password` (hasheado), `id_rol`, `estado`, `intentos_fallidos`, `bloqueado_hasta`
- **Bloqueo progresivo por intentos fallidos:**
  - 3 intentos: mensaje normal
  - 4 intentos: bloqueo 1 minuto
  - 5 intentos: bloqueo 5 minutos
  - 6+ intentos: bloqueo 15 minutos
- **Restricción de roles:** Los postulantes NO pueden acceder al panel institucional
- **Redirección por rol:**
  - Administrador → `/admin/dashboard`
  - Administrativo → `/administrativo/dashboard`
  - Docente → `/docente/dashboard`
  - Director de Carrera → `/director/dashboard`
- **Sesión guarda:** `usuario_id`, `usuario_nombre`, `usuario_correo`, `usuario_rol_id`, `usuario_rol_nombre`, `usuario_permisos`
- **Middleware:** `auth.sesion` protege rutas del panel
- **HandleInertiaRequests** comparte datos de sesión con el frontend React

---

## 👥 Sistema de Roles y Permisos (CU2)

### Modelo de Datos

```
Modulo (1) ──── (N) Funcion (N) ──── (N) Rol (1) ──── (N) Usuario
```

- **Modulo:** Agrupa funciones. Ej: "Usuarios y Seguridad", "Pagos y Habilitación"
- **Funcion:** Permiso atómico. Ej: `usuarios.leer`, `usuarios.escribir`
- **Rol:** Conjunto de funciones asignadas vía tabla pivote `rol_funcion`

### Patrón de Permisos

Cada permiso sigue el formato: `{entidad}.{accion}` donde:
- `entidad`: identificador del botón/módulo (ej: `usuarios`, `roles`, `carreras`)
- `accion`: `leer` o `escribir`

### Frontend de Permisos

- **sidebarConfig.js:** Configuración centralizada. Cada módulo define sus botones hijos con su permiso asociado
- **getSidebarItemsByModule():** Obtiene todos los botones agrupados por módulo para la UI de asignación de permisos
- **Permisos.js (Helper):** Funciones `tienePermiso()`, `tieneAlgunPermiso()`, `tieneTodosPermisos()`, componente `<Permiso>` condicional
- **Sincronización:** Los permisos se sincronizan desde Inertia (`window.__INERTIA_DATA__`) a `sessionStorage`
- **Componente RolModal:** Modal con acordeones por módulo para asignar/desasignar permisos
- **Componente PermisosModuloAccordion:** Acordeón que muestra funciones de cada módulo con checkboxes
- **PermisosViewModal:** Modal para visualizar permisos de un rol en modo solo lectura

### Seeders
- **RolFuncionSeeder.php:** Crea 9 módulos y 14 funciones/permisos, asigna todos al rol Administrador
- **DatabaseSeeder.php:** Población masiva (3 gestiones × 100 estudiantes con usuarios, postulantes, postulaciones, pagos, inscripciones y notas)

---

## 🎓 CRUD Usuarios (CU2)

**Controlador:** `UsuarioController.php`
**Vista:** `Usuarios/Index.jsx`
**Requests:** `StoreUsuarioRequest.php`, `UpdateUsuarioRequest.php`, `ImportUsuariosRequest.php`

**Operaciones:**
- **Listar:** Muestra usuarios con su rol (join con tabla rol), ordenado por apellidos
- **Crear:** Hash de contraseña con `Hash::make()`, registra en bitácora
- **Actualizar:** Solo actualiza password si se proporciona uno nuevo. Bitácora
- **Eliminar:** **Borrado lógico** → cambia estado a `'Inactivo'`. Bitácora
- **Importar Masivamente:** Sube Excel/CSV vía `POST /usuarios/importar`
  - Archivo: `ImportUsuariosRequest` (CSV/XLSX/XLS, ≤5MB)
  - Procesamiento: `UsuariosImport` (maatwebsite/excel) — lee columnas `Nombre, Apellido, Correo, Rol`
  - Validación por fila: busca el rol por nombre (case insensitive), verifica correo único
  - Cada usuario creado se etiqueta con un `import_batch` (UUID)
  - Se despacha 1 `EnviarCredencialesUsuarioJob` por usuario (cola `database`)
  - Los correos se envían en segundo plano vía `ResendEmailService`
  - Los usuarios válidos se crean, los errores se reportan por fila
  - Botón "Deshacer importación": `DELETE /usuarios/importar/{batch}/deshacer` (hard delete por batch)
- **Queue:** `QUEUE_CONNECTION=database`. Worker se inicia con `composer dev` o `php artisan queue:work`

---

## 🔑 CRUD Roles (CU2)

**Controlador:** `RolController.php`
**Vista:** `Roles/Index.jsx` con componentes modulares

**Operaciones:**
- **Listar:** Roles + módulos con funciones (para UI de asignación)
- **Crear:** Crea rol + sincroniza funciones seleccionadas via `sync()`
- **Actualizar:** Actualiza rol + resincroniza funciones
- **Eliminar:** Valida que no tenga usuarios asociados. Detacha funciones y elimina

---

## 🏛 CRUD Carreras (CU4)

**Controlador:** `CarreraController.php`
**Vista:** `Carreras/Index.jsx`
**Modelo:** `Carrera` (tabla `carrera`, PK `id_carrera`)

**Operaciones:**
- **Listar:** Ordenado por sigla
- **Crear:** Registra bitácora
- **Actualizar:** Registra bitácora
- **Eliminar:** Valida que no tenga directores asociados ni postulaciones referenciadas (como opción 1 o 2)

**Migraciones:** Se renombró `id` a `id_carrera` para consistencia

---

## 📚 CRUD Materias (CU6)

**Controlador:** `MateriaController.php` (en namespace `Materias`)
**Vista:** `Materias/Index.jsx`
**Modelo:** `Materia` (tabla `materia`, PK `id_materia`)

**Operaciones:**
- **Listar:** Ordenado por nombre
- **Crear:** Estado por defecto `'Activo'`
- **Actualizar:** Reactiva materia si estaba inactiva (cambia estado a `'Activo'`)
- **Eliminar:** **Borrado lógico** → cambia estado a `'Inactivo'`

---

## 📋 Postulaciones (CU9)

### Postulaciones de Docentes
**Controlador público:** `PostulacionDocenteController.php`
**Controlador admin:** `PostulacionDocenteRevisionController.php`
**Rutas públicas:** `GET/POST /postulacion-docente`

**Flujo:**
1. Docente se postula desde formulario público
2. Sube documentos (PDF, DOC, DOCX) a **Supabase Storage**
3. Administrador revisa requisitos (Cumple/No cumple/Observado/Pendiente)
4. Administrador cambia estado: Aprobado, Rechazado, Observado
5. Al **aprobar**: Se crea automáticamente un usuario con rol Docente (id_rol=4)
6. Se envía **correo electrónico** (Resend) al postulante con credenciales
7. Se registra todo en **bitácora**

### Preinscripción de Postulantes (Estudiantes)
**Controlador público:** `PostulacionPostulanteController.php`
**Controlador admin:** `PostulacionPostulanteRevisionController.php`
**Rutas públicas:** `GET/POST /preinscripcion`

**Flujo similar:** Formulario público → subida documentos → revisión admin → aprobación/rechazo

### Almacenamiento de Documentos
- **SupabaseStorageService:** Servicio para subir/descargar archivos
- Buckets separados para docentes y postulantes
- Validación: solo PDF, DOC, DOCX ≤ 20MB
- Rutas organizadas: `postulaciones-docentes/{id}/{archivo}`

---

## 💰 Gestión de Pagos con Stripe (CU10)

**Controlador:** `PagoController.php` (namespace `Financiero`)
**Vista frontend:** `Financiero/PasarelaPago.jsx`, `Financiero/Pagos.jsx`
**Modelo:** `Pago` (tabla `pago`)

**Flujo de pago con Stripe Checkout:**
1. Postulante inicia pago desde frontend → llama a `createCheckoutSession`
2. Backend valida:
   - Usuario autenticado (sesión)
   - Postulación existe
   - Postulante corresponde al usuario
   - No existe pago confirmado previo
3. **Monto definido en backend** (350 Bs = 35000 centavos) - seguridad
4. Crea sesión Stripe Checkout con metadatos (id_postulacion, id_usuario)
5. Registra pago como **"Pendiente"**
6. Redirige a Stripe Checkout
7. Al éxito: muestra vista de confirmación
8. Al cancelar: muestra vista de cancelación
9. **Webhook (CU11):** (pendiente de implementación completa) Confirmación real vía webhook Stripe

**Modelo Pago:** `id_postulacion`, `monto`, `fecha_pago`, `referencia`, `estado_pago` (Pendiente/Confirmado), `cod_transaccion`

---

## 📊 Bitácora (Auditoría)

**Modelo:** `Bitacora` (tabla `bitacora`)
**Service:** `BitacoraService.php`

**Campos:** `id_bitacora`, `accion`, `fecha_hora`, `ip`, `id_usuario`, `tabla_afectada`

Se registra en todas las operaciones CRUD: INSERCIÓN, ACTUALIZACIÓN, ELIMINACIÓN, ELIMINACIÓN LÓGICA, cambios de estado de postulaciones, inicios/cierres de sesión.

**Ruta admin:** `/admin/bitacora` (controlador `BitacoraController`)

---

## 🌐 Rutas (web.php)

| Grupo | Rutas | Middleware |
|---|---|---|
| **Públicas** | `/` (Landing), `/login`, `/forgot-password`, `/reset-password`, `/postulacion-docente`, `/preinscripcion`, `/preinscripcion/pago/{id}`, `/preinscripcion/{id}` | `guest` o ninguna |
| **Protegidas** | `/admin/bitacora`, `/admin/postulaciones-docentes`, `/admin/postulaciones-postulantes`, dashboards por rol, `/roles`, `/usuarios`, `/carreras`, `/materias`, `/financiero/*` | `auth.sesion` |

**Cierre sesión:** `POST /logout` (sin middleware específico)

---

## 🎨 Sidebar y Navegación

**Archivo:** `SidebarAdmin.jsx` + `sidebarConfig.js`

**Módulos configurados:**
1. 📊 Dashboard
2. 📋 Postulantes y Requisitos (con sub-items: Docentes, Postulantes)
3. 💰 Pagos y Habilitación (con sub-item: Pagos)
4. 📅 Grupos Horarios y Aulas
5. 👨‍🏫 Docentes y Carga Horaria
6. 📚 Materias y Notas (con sub-item: Materias)
7. 🎯 Cupos y Admisión
8. 👥 Usuarios y Seguridad (con sub-items: Usuarios, Roles, Carreras, Bitácora)
9. 📈 Reportes

Los permisos se sincronizan automáticamente entre sidebarConfig.js y el seeder RolFuncionSeeder.php.

---

## 🚀 Scripts de Desarrollo

```bash
composer setup          # Instalación completa (composer, .env, key, migrate, npm, build)
composer dev            # Desarrollo simultáneo: server + queue + logs + vite
composer test           # Ejecutar tests
npm run dev             # Solo Vite dev server
npm run build           # Build producción frontend
```

---

## 🌿 Git Workflow

- **Ramas activas:** `main`, `dev-josias`, `dev-amador`
- **Convención de merges:** `dev-amador → dev-josias → main`
- **Commits notables:**
  - `88f83b6` - Entorno base Laravel Breeze + React
  - `fcdeb01` - Instalación React con Inertia + PostulanteController
  - `2278b68` - Implementación CU1 (Autenticación manual)
  - `2fe61d3` - CU2, CU4, CU6 (Usuarios, Roles, Carreras, Materias)
  - `acc8d7a` - Implementación Docentes Postulantes
  - `3912df7` - CU9 Postulaciones + Validaciones

---

## 📦 Dependencias Clave

### PHP (Composer)
- `laravel/framework ^12.0`
- `inertiajs/inertia-laravel ^2.0`
- `stripe/stripe-php ^20.2`
- `laravel/sanctum ^4.0`
- `tightenco/ziggy ^2.0`
- `cloudinary-labs/cloudinary-laravel ^3.0`

### JavaScript (Node)
- `react ^18.2.0`, `react-dom ^18.2.0`
- `@inertiajs/react ^2.0.0`
- `@stripe/stripe-js ^9.7.0`
- `tailwindcss ^3.2.1`
- `framer-motion ^12.40.0`
- `@headlessui/react ^2.0.0`
- `axios ^1.11.0`
- `vite ^7.0.7`

---

## 📁 Estructura de Base de Datos (Tablas Principales)

| Tabla | Propósito |
|---|---|
| `usuario` | Usuarios del sistema (autenticación) |
| `rol` | Roles (Administrador, Docente, Postulante, etc.) |
| `funcion` | Permisos individuales |
| `modulo` | Módulos del sistema |
| `rol_funcion` | Pivote: asignación de permisos a roles |
| `carrera` | Carreras universitarias |
| `materia` | Materias académicas |
| `postulante` | Postulantes al CUP |
| `postulacion` | Postulaciones (2 opciones de carrera) |
| `pago` | Pagos con Stripe |
| `bitacora` | Auditoría del sistema |
| `postulacion_docente` | Postulaciones de docentes |
| `inscripcion_cup` | Inscripciones al CUP |
| `nota` | Notas de evaluaciones |
| `gestion_cup` | Gestiones académicas |
| `director_carrera` | Directores de carrera |

---

## 🔄 Flujo Completo del Sistema

```
POSTULANTE                          ADMINISTRADOR
    |                                    |
    ├─ Preinscripción (público)          ├─ Login (CU1)
    │  └─ Sube documentos                ├─ Dashboard
    └─ Pago (Stripe CU10)                ├─ Revisa postulaciones (CU9)
         └─ Stripe Checkout              │  ├─ Postulantes
                                          │  ├─ Docentes
                                          │  └─ Aprueba/Rechaza/Observa
                                          ├─ Gestiona Usuarios (CU2)
                                          ├─ Gestiona Roles y Permisos (CU2)
                                          ├─ Gestiona Carreras (CU4)
                                          ├─ Gestiona Materias (CU6)
                                          ├─ Ve Pagos
                                          └─ Ve Bitácora
```

---

## 🛠 Convenciones de Código

1. **Controladores:** Usan `Inertia::render()` para vistas SPA. Namespace refleja módulo (ej: `Materias\MateriaController`)
2. **Requests:** Form requests con validaciónes separadas (`Store*Request`, `Update*Request`)
3. **Modelos:** `$table` explícito, `$fillable` o `$guarded`, `$timestamps = false` cuando no aplica
4. **Bitácora:** Siempre registrar en operaciones CRUD y cambios de estado
5. **Frontend:** Componentes modulares con `_components/`, hooks en `_hooks/`, constantes en `_constants/`
6. **Sidebar:** No hardcodear en JSX - usar `sidebarConfig.js` centralizado
7. **Permisos:** Siempre verificar con helpers `tienePermiso()` o componente `<Permiso>`
8. **Migraciones:** Nombres descriptivos con fecha/timestamp
9. **Seeders:** Separados por dominio (RolFuncionSeeder, DatabaseSeeder)
10. **Seguridad:** Montos siempre desde backend, validación de propiedad en pagos

---

## 🧪 Testing

- Framework: PHPUnit (Laravel)
- Comando: `composer test` o `php artisan test`
- Tests en: `tests/` directory
- Pruebas de funcionalidad con datos semilla del DatabaseSeeder

---

## 📝 Notas para Desarrollo Futuro

- **CU11 (Webhook Stripe):** Implementar confirmación real de pagos vía webhook
- **CU3, CU5, CU7, CU8:** Pendientes de implementación
- **Confirmación de pago:** Actualmente solo se marca como Pendiente, falta webhook para Confirmado
- **Faltan más roles en seeder:** Solo Administrador (1) y Postulante (5) tienen seed inicial

### Features Extras

#### 🚀 Explorador Visual del CUP
- **Ruta:** `/admin/explorador-cup`
- **Controlador:** `ExploradorCupController.php`
- **Vista:** `Admin/ExploradorCup/Index.jsx`
- **Widgets:**
  - **Embudo de Admisión:** Barra horizontal con 5 etapas con tooltip y porcentajes
  - **Mapa de Calor:** Matriz Materia × Grupo con celdas coloreadas por promedio
  - **Rendimiento por Materia:** ScatterChart con burbujas (tamaño = estudiantes)
  - **Timeline de Actividad:** Feed animado de últimas acciones
- **Características:** 7 KPIs, selector de gestión, reordenamiento con flechas, colapsables

#### 🔔 Centro de Notificaciones
- **Tabla:** `notificacion` (icono, título, mensaje, tipo, leída, created_at)
- **Controlador:** `NotificacionController.php`
- **Componente:** `PanelNotificaciones.jsx` en Navbar
- **Características:** Badge con contador, dropdown, polling 30s, marcar leídas

#### 🖥️ Sala de Situación en Tiempo Real
- **Ruta:** `/admin/sala-situacion`
- **Controlador:** `Admin\SalaSituacionController.php`
- **Vista:** `Admin/SalaSituacion/Index.jsx`
- **Componentes:** `KpiGlow` (contadores animados), `FeedTicker` (ticker horizontal infinito), `BarrasCiudades` (barras por ciudad), `GraficoHora` (barras por hora), `TimelineFlash` (feed vertical con glow)
- **Características:** Auto-refresh 15seg, dark mode glassmorphism, contadores con spring physics

#### 📋 Kanban Board para Revisión de Documentos
- **Ruta:** `/admin/postulaciones-postulantes/kanban`
- **Controlador:** `Admin\PostulacionKanbanController.php`
- **Vista:** `Admin/PostulacionesPostulantes/Kanban.jsx`
- **Componentes:** `KanbanBoard` (DndContext), `KanbanColumn` (droppable), `KanbanCard` (sortable)
- **Características:** Drag & drop entre 5 columnas, optimistic update, animaciones, contadores por columna

#### 🛤️ Trayectorias del Postulante (Timeline Visual)
- **Ruta pública:** `/trayectoria/{token}` (vista pública sin auth)
- **Ruta admin:** `/admin/trayectorias` (buscador + timeline)
- **Controlador:** `TrayectoriaController.php`
- **Vista pública:** `Trayectoria/Publica.jsx`
- **Vista admin:** `Admin/Trayectorias/Index.jsx`
- **Componente:** `TimelineNodo` (nodo animado con check de completado)
- **Características:** 7 etapas del ciclo de vida, barra de progreso, animación secuencial al scrollear