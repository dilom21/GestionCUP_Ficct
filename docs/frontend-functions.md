# FRONTEND - GestionCUP_Ficct

> Documentación completa de todas las páginas React, componentes, layouts, hooks, helpers y configuraciones del frontend Inertia.js.

---

## 1. PÁGINAS (44 archivos .jsx)

### 1.1 Auth (resources/js/Pages/Auth)

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Login.jsx | Login | status, bloqueado_hasta | correo (email), password (toggle show/hide) | Submit login, recordarme checkbox, toggle password, link forgot-password | `post('/login')` via Inertia useForm |
| ForgotPassword.jsx | ForgotPassword | status | correo (email) | Submit forgot password, link back to login | `post('/forgot-password')` via Inertia useForm |
| ResetPassword.jsx | ResetPassword | token | token (hidden), password (strength meter), password_confirmation | Submit reset, toggle show/hide passwords | `post('/reset-password')` via Inertia useForm |

### 1.2 Welcome

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Welcome.jsx | Welcome + Navbar/Hero/Carreras/Requisitos/Costos/Cronograma/FAQ/Footer/ScrollToTop | auth, laravelVersion, phpVersion, gestion | - | Nav scroll, mobile hamburger, "Preinscribirme" link, FAQ accordion, malla modal, scroll-to-top, social links | - |

### 1.3 Dashboard

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| AdminDashboard.jsx | AdminDashboard | - | - | **VACÍO** (solo `<h1>`) | - |
| DocenteDashboard.jsx | DocenteDashboard | - | - | **VACÍO** (solo `<h1>`) | - |
| PostulanteDashboard.jsx | PostulanteDashboard | - | - | **VACÍO** (solo `<h1>`) | - |

### 1.4 Director & Administrativo & Panel

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Director/Dashboard.jsx | DirectorDashboard | auth (usePage) | - | **MÍNIMO** (welcome + nombre + logout) | `post('/logout')` |
| Administrativo/Dashboard.jsx | AdministrativoDashboard | auth (usePage) | - | **VACÍO** (solo logout button) | `post('/logout')` |
| Panel/Dashboard.jsx | PanelDashboard | auth (usePage) | - | **MÍNIMO** (3 info cards) | - |

### 1.5 Usuarios

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Usuarios/Index.jsx | UsuariosIndex + EstadoBadge | usuarios, roles | Modal create/edit: nombre, apellidos, correo, password, password_confirmation, id_rol (select), estado | CRUD completo + botón Importar | `post(route('usuarios.store'))`, `put(route('usuarios.update', id))`, `destroy(route('usuarios.destroy', id))` |
| Usuarios/_components/ModalImportarUsuarios.jsx | ModalImportarUsuarios | open, onClose, importResultado, onDeshacer | File input (drag & drop CSV/XLSX/XLS) | Drag & drop, importar, deshacer | `post(route('usuarios.importar'))`, `router.delete(route('usuarios.importar.deshacer', batch))` |

### 1.6 Roles (6 archivos)

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Roles/Index.jsx | RolesIndex | roles, modulos | - | Search, CRUD modals, permisos view | Delegated to useGestionRoles |
| Roles/_components/RolesPageHeader.jsx | RolesPageHeader | searchTerm, onSearchChange, onCreateRole, totalRoles | - | Header gradient + search + "Nuevo Rol" | - |
| Roles/_components/RolesTable.jsx | RolesTable | roles, searchTerm, onEditRole, onDeleteRole, onViewPermisos | - | Table/cards + action buttons (Editar/Eliminar/Ver permisos) | - |
| Roles/_components/RolModal.jsx | RolModal | showModal, editingRol, ..., modulos, selectedFunciones, ... | nombre (text), descripcion (text), matrix permisos (checkboxes por entidad: Leer/Escribir/Full/Sin permiso) | CRUD role + asignación permisos por acordeón de módulos | - |
| Roles/_components/PermisosModuloAccordion.jsx | PermisosModuloAccordion | modulo, isExpanded, entidades, ... | - | Acordeón con entidades, toggle Leer/Escribir/Full | - |
| Roles/_components/PermisosViewModal.jsx | PermisosViewModal | showPermisosModal, selectedRolForPermisos, modulos, ... | - | Modal solo lectura de permisos | - |

### 1.7 CRUD Básicos

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Carreras/Index.jsx | CarrerasIndex | carreras | sigla (text, max 3, uppercase), nombre | Search, CRUD modals, eliminar con confirmación | `post/carreras.store`, `put/carreras.update`, `destroy/carreras.destroy` |
| Materias/Index.jsx | MateriasIndex | materias | nombre | Search, CRUD modals, desactivar/reactivar | `post/materias.store`, `put/materias.update`, `destroy/materias.destroy` |

### 1.8 Admin (páginas principales)

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Admin/Dashboard.jsx | AdminDashboard | - | - | **VACÍO** (solo `<h1>`) | - |
| Admin/Bitacora/Index.jsx | BitacoraIndex | registros, usuarios, filtros | accion (text), id_usuario (select), fecha_desde (date), fecha_hasta (date) | Filtrar, limpiar | `router.get('/admin/bitacora', filtros)` |
| Admin/PostulacionesDocentes/Index.jsx | PostulacionesDocentesIndex | postulaciones, filtros | busqueda (text), estado (select) | Filtrar, limpiar, ver detalle | `router.get('/admin/postulaciones-docentes', {...})` |
| Admin/PostulacionesDocentes/Show.jsx | PostulacionDocenteShow | postulacion | Requisitos (select estado + text observacion), cambiar estado (select + correo_acceso + password_acceso conditional + textarea) | Guardar revisión, cambiar estado, ver/descargar docs | `router.post('.../guardar-revision')`, `router.post('.../cambiar-estado')` |
| Admin/PostulacionesPostulantes/Index.jsx | PostulacionesPostulantesIndex | postulaciones, filtros | busqueda (text), estado (select) | Filtrar, limpiar, ver detalle | `router.get('...')` |
| Admin/PostulacionesPostulantes/Show.jsx | PostulacionPostulanteShow | postulacion | Igual que docentes (requisitos + estado) | Guardar revisión, cambiar estado, ver docs | `router.post('.../guardar-revision')`, `router.post('.../cambiar-estado')` |
| Admin/PostulacionesPostulantes/Kanban.jsx | Kanban | - | - | Recargar (delegado a KanbanBoard) | - |

### 1.9 Admin (Kanban - 3 subcomponentes)

| Archivo | Componente | Props | Descripción | HTTP Requests |
|---------|-----------|-------|-------------|---------------|
| Admin/PostulacionesPostulantes/_components/KanbanBoard.jsx | KanbanBoard | - | DndContext + 5 droppable columns + cards sortables | `axios.post('admin.kanban.tablero')`, `axios.post('admin.kanban.mover', { estado })` |
| Admin/PostulacionesPostulantes/_components/KanbanColumn.jsx | KanbanColumn | estado, items | Droppable column with SortableContext + header (icono, color) | - |
| Admin/PostulacionesPostulantes/_components/KanbanCard.jsx | KanbanCard | item, estado | Sortable card (postulante, CI, carrera, docs, fecha) | - |

### 1.10 Admin (Trayectorias + Asistencia)

| Archivo | Componente | Props Inertia | Formularios | Acciones | HTTP Requests |
|---------|-----------|---------------|-------------|----------|---------------|
| Admin/Trayectorias/Index.jsx | TrayectoriasAdmin | - | busqueda (text, debounce 300ms) | Buscar, seleccionar resultado, ver timeline | `axios.post('admin.trayectorias.buscar')` |
| Admin/Asistencia/Index.jsx | AdminAsistencia | tab, asistencias, filtros, grupos, materias, docentes | Filtros: periodo, grupo, materia, docente, estado + date range | Tabs (docente/estudiante), filtrar, paginar | `router.get('admin.asistencia.index', params)` |
| Admin/Docentes/Index.jsx | DocentesIndex | docentes, filtros, usuarios | Create: id_usuario, ci, profesion, grado_academico, experiencia_anios, maestria, diplomado, maximo_grupos. Edit: + telefono | CRUD + toggle estado | `post/put /admin/docentes`, `post .../cambiar-estado` |
| Admin/Evaluaciones/Index.jsx | EvaluacionesIndex | evaluaciones, materias, gestiones, filtros | Create: id_materia, id_gestion_cup, nombre, porcentaje, puntaje_maximo, fecha_evaluacion | CRUD + toggle estado con confirmación | `post/put /admin/evaluaciones`, `post .../cambiar-estado` |
| Admin/ResultadosCup/Index.jsx | ResultadosCupIndex | inscripciones | - | Ver notas, calcular individual/todos | `router.post('.../calcular')`, `router.post('.../calcular-todos')` |
| Admin/CuposCarrera/Index.jsx | CuposCarreraIndex | cupos, gestiones, carreras, filtros | Create: id_gestion_cup, id_carrera, cantidad_cupos. Edit: cantidad_cupos | CRUD + toggle estado | `post/put /admin/cupos-carrera`, `post .../cambiar-estado` |
| Admin/AsignacionCarrera/Index.jsx | AsignacionCarreraIndex | gestiones, gestionId, aprobados, resumenCupos, carreras | - | Select gestión, tabs (general/ranking), asignar individual/bulk | `router.get('...', {id_gestion_cup})`, `post .../ejecutar`, `post .../{id}/asignar` |
| Admin/ResultadosAdmision/Index.jsx | ResultadosAdmisionIndex | admisiones, gestiones, carreras, filtros | filtros: busqueda, gestion, carrera, estado | Filtrar, limpiar, ver detalle | `router.get('/admin/resultados-admision', {...})` |
| Admin/PostulantesGestion/Index.jsx | PostulantesGestionIndex | postulantes | Edit: telefono, direccion, ciudad, colegio_procedencia | CRUD + toggle estado | `put /admin/postulantes-gestion/{id}`, `post .../cambiar-estado` |

### 1.11 Admin (Explorador CUP + Sala Situación)

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Admin/ExploradorCup/Index.jsx | ExploradorCupIndex | gestiones | Select gestión | Selector gestión, reordenar widgets, 4 widgets interactivos | `axios.post('admin.explorador-cup.datos', {id_gestion})` |
| Admin/SalaSituacion/Index.jsx | SalaSituacionIndex | - | - | Auto-refresh 15s, toggle dark/light, 8 KPIs animados, 3 charts | `axios.post('admin.sala-situacion.estadisticas')` cada 15s |

### 1.12 Preinscripcion

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Preinscripcion/Create.jsx | PreinscripcionCreate | carreras, requisitos, paymentData, paymentSuccess | Wizard 4 pasos: Datos (nombre, apellidos, correo, teléfono, CI, fecha_nac, sexo, dirección, colegio, ciudad, turno, 2 carreras) + Documentos (drag & drop) | Submit, drag & drop docs, remove files | `post('/preinscripcion', FormData)` |
| Preinscripcion/Pago.jsx | Pago | postulacion, token, tokenValid | - | Embebe PasarelaPago si token válido | - |
| Preinscripcion/Show.jsx | PreinscripcionShow | postulacion | - | "Volver al inicio" | - |

### 1.13 PostulacionDocente

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| PostulacionDocente/Create.jsx | Create | requisitos, materias | Personal (nombre, apellido, correo, teléfono, CI) + Profesional (profesión, grado académico, experiencia, disponibilidad, materias checkbox) + Documentos drag & drop | Submit, drag & drop docs, FAQ accordion | `post('/postulacion-docente', FormData)` |

### 1.14 Financiero

| Archivo | Componente | Props Inertia / Props | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|----------------------|-------------|-----------------|---------------|
| Financiero/PasarelaPago.jsx | PasarelaPago | status, id_postulacion, mensaje, session_id, autoStart, token | - | Pagar con Stripe, reintentar, volver (6 estados: initial/loading/redirect/success/cancelled/error) | `axios.post(route('pago.crear-sesion'), {id_postulacion, token})` |
| Financiero/Pagos.jsx | PagosIndex | pagos | search (text) | Buscar por transacción/postulante/estado | - (client-side filter) |

### 1.15 Trayectoria

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Trayectoria/Publica.jsx | TrayectoriaPublica | postulante, nodos | - | Scroll-triggered animation (intersection observer) | - |
| Trayectoria/_components/TimelineNodo.jsx | TimelineNodo | nodo, index, esUltimo, light | - | Render nodo animado con icono + check | - |

### 1.16 Docente

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Docente/Dashboard.jsx | DocenteDashboard | auth (usePage) | - | **VACÍO** (solo logout) | `post('/logout')` |
| Docente/Asistencia/Index.jsx | DocenteAsistencia | asignaciones, asistencias_hoy | QR modal (con timer), PIN modal (6 dígitos grande), Lista estudiantes (Presente/Ausente/Tardanza) | Entrada/salida, generar QR, generar PIN, marcar estudiantes | `axios.post` a 7 endpoints de asistencia docente |

### 1.17 Postulante

| Archivo | Componente | Props Inertia | Formularios | Acciones usuario | HTTP Requests |
|---------|-----------|---------------|-------------|-----------------|---------------|
| Postulante/Asistencia/Index.jsx | PostulanteAsistencia | inscripciones | PIN keypad (6 dígitos, auto-submit) | QR scanner (cámara html5-qrcode), PIN keypad | `axios.post(route('postulante.asistencia.escanear'))`, `axios.post(route('postulante.asistencia.validar-pin'))` |

### 1.18 Administrativo

| Archivo | Componente | Props Inertia | Formularios | Acciones | HTTP Requests |
|---------|-----------|---------------|-------------|----------|---------------|
| Administrativo/Dashboard.jsx | AdministrativoDashboard | auth | - | **VACÍO** (solo logout) | - |
| Administrativo/Aulas/Index.jsx | AulasIndex | aulas, filtros | codigo, nombre, capacidad_maxima, ubicacion, estado | Search, CRUD modals | CRUD routes aulas |
| Administrativo/Grupos/Index.jsx | GruposIndex | grupos, gestiones, filtros | id_gestion_cup, sigla, cupo_maximo, turno, modalidad, estado | Search, CRUD, generar grupos | CRUD + POST /grupos/generar |
| Administrativo/Horarios/Index.jsx | HorariosIndex | horarios, asignaciones, aulas, filtros | id_asignacion_academica, id_aula, dia_semana, horario_inicio, horario_fin | CRUD + filtrar por día | CRUD routes horarios |
| Administrativo/AsignacionAcademica/Index.jsx | AsignacionAcademicaIndex | asignaciones, materias, grupos, docentes, gestiones, filtros | id_materia, id_grupo, id_docente, id_gestion_cup, carga_horaria, estado | CRUD + paginación | CRUD routes asignaciones |
| Administrativo/Docentes/Index.jsx | DocentesIndex | - | - | **VACÍO** (placeholder) | - |
| Administrativo/DocenteMateria/Index.jsx | DocenteMateriaIndex | docentes, materias, filtros | id_docente (hidden), id_materia (select) | Asignar/desasignar materia | CRUD routes docente_materia |
| Administrativo/Reportes/Index.jsx | ReportesIndex | kpi, gestiones, carreras, materias, grupos, docentes, aulas | PanelFiltros (múltiples selects) | 8 tipos reporte, generar, tabla/gráfico/ambos, exportar CSV/PDF/Excel, consulta voz | `axios.post('admin.reportes.generar')`, `axios.post('admin.reportes.exportar.{fmt}')` |

### 1.19 Reportes Subcomponentes (11 archivos)

| Archivo | Componente | Props | Descripción |
|---------|-----------|-------|-------------|
| Reportes/_components/HeroReportes.jsx | HeroReportes | kpi | Header gradient con título |
| Reportes/_components/TarjetasKpi.jsx | TarjetasKpi | kpi, cargando | 6 tarjetas KPI (total postulantes, aprobados, reprobados, materias, grupos, docentes) |
| Reportes/_components/BotonesReportes.jsx | BotonesReportes | reporteActivo, onSeleccionar, cargando | Grid 8 botones de tipo reporte con icono/color |
| Reportes/_components/PanelFiltros.jsx | PanelFiltros | filtros, onChange, onGenerar, gestiones, carreras, ..., cargando, reporteActivo | Panel de filtros expandible con chips |
| Reportes/_components/SelectorVista.jsx | SelectorVista | vista, onChange | Toggle: Tabla / Gráfico / Ambos |
| Reportes/_components/BotonExportar.jsx | BotonExportar | onExportar, cargando, resultado | Dropdown: CSV / PDF / Excel |
| Reportes/_components/TablaReporte.jsx | TablaReporte | columns, data, tipo | Tabla paginada responsive (cards en mobile) con badges de color |
| Reportes/_components/GraficoBarras.jsx | GraficoBarras | datos, label, valor | Recharts BarChart con celdas coloreadas |
| Reportes/_components/GraficoCircular.jsx | GraficoCircular | datos, label, valor | Recharts PieChart donut |
| Reportes/_components/GraficoLineas.jsx | GraficoLineas | datos, label, valor | Recharts LineChart |
| Reportes/_components/ConsultaVoz/FloatingMic.jsx | FloatingMic | onClick, isListening | Botón flotante micrófono (abajo-derecha) |
| Reportes/_components/ConsultaVoz/ModalVoz.jsx | ModalVoz | open, onClose, onResultado | Modal con mic (speech recognition), transcript, consultar, resultado, historial |
| Reportes/_components/ConsultaVoz/HistorialVoz.jsx | HistorialVoz | consultas, onRepetir, cargando | Lista de consultas previas con timestamp |

---

## 2. COMPONENTES COMPARTIDOS

### 2.1 Navigation (resources/js/Components/navigation)

| Archivo | Componente | Props | Descripción |
|---------|-----------|-------|-------------|
| SidebarAdmin.jsx | SidebarAdmin | sidebarOpen, onClose | Sidebar colapsable (desktop: hover/lock, mobile: overlay) con 12 módulos dinámicos por permisos, avatar, logout |
| Navbar.jsx | Navbar | onToggleSidebar, sidebarOpen | Navbar sticky con hamburguesa, breadcrumb, PanelNotificaciones, avatar |
| PanelNotificaciones.jsx | PanelNotificaciones | - | Dropdown notificaciones con badge, polling 30s, marcar leídas/ todas |

### 2.2 UI (resources/js/Components/ui)

| Archivo | Componente | Props | Descripción |
|---------|-----------|-------|-------------|
| TextInput.jsx | TextInput (forwardRef) | type, className, isFocused | Input estilizado con focus management |
| InputLabel.jsx | InputLabel | value, className | Label estilizado |
| InputError.jsx | InputError | message, className | Mensaje de error condicional |
| PrimaryButton.jsx | PrimaryButton | className, disabled | Botón primario estilizado |
| Table.jsx | Table | columns, data | Tabla HTML simple |

---

## 3. LAYOUTS (3 archivos)

| Archivo | Componente | Props | Secciones | Comportamiento |
|---------|-----------|-------|-----------|----------------|
| AdminLayout.jsx | AdminLayout | children | PermisosProvider → SidebarAdmin + Navbar + `<main>` | Sincroniza permisos de Inertia a sessionStorage |
| DocenteLayout.jsx | DocenteLayout | children | Navbar + `<main>` | Layout básico |
| PostulanteLayout.jsx | PostulanteLayout | children | Navbar + `<main>` | Layout básico |

---

## 4. DATA, HELPERS Y CONFIGURACIÓN (5 archivos)

### 4.1 sidebarConfig.js
```javascript
export const sidebarModules = [
  { label: 'Dashboard', icon: 'LayoutDashboard', entidad: 'dashboard', permisoLeer: 'dashboard.leer', isDropdown: false, route: '/admin/dashboard' },
  { label: 'Explorador CUP', icon: 'LineChart', entidad: 'explorador_cup', permisoLeer: 'reportes.leer', isDropdown: false, route: '/admin/explorador-cup' },
  { label: 'Sala de Situacion', icon: 'Activity', entidad: 'sala_situacion', permisoLeer: 'reportes.leer', isDropdown: false, route: '/admin/sala-situacion' },
  { label: 'Postulaciones y Requisitos', icon: 'FileText', entidad: 'postulantes', permisoLeer: 'postulantes.leer', isDropdown: true,
    children: [
      { label: 'Postulaciones Docentes', route: '/admin/postulaciones-docentes', permiso: 'postulaciones_docentes.leer' },
      { label: 'Postulaciones de Postulantes', route: '/admin/postulaciones-postulantes', permiso: 'postulaciones_postulantes.leer' },
      { label: 'Kanban', route: '/admin/postulaciones-postulantes/kanban', permiso: 'postulaciones_postulantes.leer' },
      { label: 'Trayectorias', route: '/admin/trayectorias', permiso: 'postulaciones_postulantes.leer' }
    ]
  },
  { label: 'Pagos y Habilitacion', icon: 'DollarSign', entidad: 'pagos', permisoLeer: 'pagos.leer', isDropdown: true,
    children: [{ label: 'Pagos', route: '/financiero/pagos', permiso: 'pagos_listado.leer' }]
  },
  { label: 'Grupos Horarios y Aulas', icon: 'Calendar', entidad: 'grupos_horarios', permisoLeer: 'grupos_horarios.leer', isDropdown: true,
    children: [
      { label: 'Aulas', route: '/aulas', permiso: 'aulas.leer' },
      { label: 'Grupos', route: '/grupos', permiso: 'grupos.leer' },
      { label: 'Asignacion Academica', route: '/asignaciones-academicas', permiso: 'asignacion_academica.leer' },
      { label: 'Horarios', route: '/horarios', permiso: 'horarios.leer' }
    ]
  },
  { label: 'Docentes y Carga Horaria', icon: 'Users', entidad: 'docentes', permisoLeer: 'docentes.leer', isDropdown: true,
    children: [
      { label: 'Gestion de Docentes', route: '/admin/docentes', permiso: 'gestion_docentes.leer' },
      { label: 'Materias por Docente', route: '/docentes-materias', permiso: 'docentes_materias.leer' },
      { label: 'Gestion de Postulantes', route: '/admin/postulantes-gestion', permiso: 'postulaciones_postulantes.leer' }
    ]
  },
  { label: 'Materias y Notas', icon: 'BookOpen', entidad: 'materias_notas', permisoLeer: 'materias_notas.leer', isDropdown: true,
    children: [
      { label: 'Materias', route: '/materias', permiso: 'materias.leer' },
      { label: 'Evaluaciones', route: '/admin/evaluaciones', permiso: 'evaluaciones.leer' },
      { label: 'Resultados CUP', route: '/admin/resultados-cup', permiso: 'resultados_cup.leer' }
    ]
  },
  { label: 'Cupos y Admision', icon: 'Target', entidad: 'cupos_admision', permisoLeer: 'cupos_admision.leer', isDropdown: true,
    children: [
      { label: 'Gestion de Cupos por Carrera', route: '/admin/cupos-carrera', permiso: 'cupos_carrera.leer' },
      { label: 'Asignar Estudiantes a Carrera', route: '/admin/asignacion-carrera', permiso: 'asignacion_carrera.leer' },
      { label: 'Resultados de Admision', route: '/admin/resultados-admision', permiso: 'resultados_admision.leer' },
      { label: 'Carreras', route: '/carreras', permiso: 'carreras.leer' }
    ]
  },
  { label: 'Usuarios y Seguridad', icon: 'Shield', entidad: 'usuarios_seguridad', permisoLeer: 'usuarios.leer', isDropdown: true,
    children: [
      { label: 'Usuarios', route: '/usuarios', permiso: 'usuarios.leer' },
      { label: 'Roles', route: '/roles', permiso: 'roles.leer' },
      { label: 'Auditoria y Bitacora', route: '/admin/bitacora', permiso: 'bitacora.leer' }
    ]
  },
  { label: 'Asistencia y Control', icon: 'ClipboardCheck', entidad: 'asistencia', permisoLeer: 'asistencia.leer', isDropdown: true,
    children: [
      { label: 'Asistencia', route: '/admin/asistencia', permiso: 'asistencia_docente.leer' }
    ]
  },
  { label: 'Reportes', icon: 'BarChart', entidad: 'reportes', permisoLeer: 'reportes.leer', isDropdown: true,
    children: [{ label: 'Reportes y Graficos', route: '/admin/reportes', permiso: 'reportes.leer' }]
  }
];
```

### 4.2 Helpers/Permisos.js
| Export | Tipo | Descripción |
|--------|------|-------------|
| `tienePermiso(permiso)` | función default | Verifica si usuario tiene permiso específico |
| `tieneAlgunPermiso(permisos[])` | función named | Verifica si tiene ALGUNO de los permisos |
| `tieneTodosPermisos(permisos[])` | función named | Verifica si tiene TODOS los permisos |
| `sincronizarPermisos(permisos[])` | función named | Sincroniza permisos de Inertia → sessionStorage |
| `Permiso({ permiso, children, fallback })` | componente named | Render condicional por permiso |

### 4.3 Contexts/PermisosContext.jsx
| Export | Tipo | Descripción |
|--------|------|-------------|
| `PermisosProvider({ children, permisos })` | componente named | Provider React Context para permisos memoizados |
| `usePermisos()` | hook named | `{ permisos, tienePermiso(modulo, accion), puedeEditar(modulo), esSoloLectura(modulo) }` |

### 4.4 app.jsx + bootstrap.js
- app.jsx: `createInertiaApp` con React, title template, progress bar
- bootstrap.js: Axios defaults (`X-Requested-With` header)

### 4.5 Reportes Hooks/Constants/Utils

| Archivo | Exports | Descripción |
|---------|---------|-------------|
| Reportes/_hooks/useReportes.js | `useReportes()` | `{ cargando, resultado, error, reporteActivo, generar, exportar, ... }` |
| Reportes/_hooks/useMediaQuery.js | `useMediaQuery(query)` | Hook de media query |
| Reportes/_constants/reportesConfig.js | `REPORTES` (8 tipos), `ESTADOS_POSTULACION`, `TURNOS`, `TIPOS_GRAFICO`, `COLORES_GRAFICO`, `COLORES_BADGE` | Constantes de configuración |
| Reportes/_utils/exportar.js | `exportarCsv(data, columns, filename)` | Generador CSV con BOM |

---

## 5. TOTAL FRONTEND: ~94 archivos

| Categoría | Cantidad |
|-----------|----------|
| Páginas (Pages/) | 44 archivos .jsx |
| Subcomponentes (_components/) | 28 archivos .jsx |
| Hooks (_hooks/) | 3 archivos .js |
| Constantes (_constants/) | 2 archivos .js |
| Utils (_utils/) | 1 archivo .js |
| Componentes compartidos (Components/) | 8 archivos .jsx |
| Layouts (Layouts/) | 3 archivos .jsx |
| Data | 1 archivo .js |
| Helpers | 1 archivo .js |
| Contexts | 1 archivo .jsx |
| Root (app, bootstrap) | 2 archivos .js |
