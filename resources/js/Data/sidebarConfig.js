/**
 * Configuración centralizada de los módulos y botones de la barra lateral.
 *
 * Cada módulo define:
 * - label: nombre para mostrar en sidebar y permisos
 * - entidad: identificador único para permisos (ej: 'usuarios', 'dashboard')
 * - color: color del tema para la UI de permisos
 * - icon: emoji representativo para UI de permisos
 * - href: ruta de navegación (para SidebarAdmin)
 * - isDropdown: si contiene sub-items
 * - children: sub-items del menú (botones dentro del módulo)
 *
 * IMPORTANTE:
 * - Los items en `children` aparecerán automáticamente en "Permisos por Módulo"
 *   al crear/editar un rol.
 * - Si agregas un nuevo botón aquí, aparecerá en la sección de permisos.
 * - Mientras los children estén vacíos no se mostrará nada dentro del módulo.
 */

const sidebarModules = [
  {
    label: 'Dashboard',
    entidad: 'dashboard',
    icon: '📊',
    color: 'emerald',
    href: '#',
    isDropdown: false,
    permisoLeer: 'dashboard.leer',
    children: [],
  },
  {
    label: 'Postulaciones y Requisitos',
    entidad: 'postulantes',
    icon: '📋',
    color: 'amber',
    href: '#',
    isDropdown: true,
    permisoLeer: 'postulantes.leer',
    children: [
      {
        label: 'Postulaciones Docentes',
        entidad: 'postulaciones_docentes',
        icon: '📄',
        color: 'amber',
        href: '#',
        permiso: 'postulaciones_docentes.leer',
      },
      {
        label: 'Postulaciones de Postulantes',
        entidad: 'postulaciones_postulantes',
        icon: '👤',
        color: 'amber',
        href: '#',
        permiso: 'postulaciones_postulantes.leer',
      },
    ],
  },
  {
    label: 'Pagos y Habilitación',
    entidad: 'pagos',
    icon: '💰',
    color: 'green',
    href: '#',
    isDropdown: true,
    permisoLeer: 'pagos.leer',
    children: [
      {
        label: 'Pagos',
        entidad: 'pagos_listado',
        icon: '💳',
        color: 'green',
        href: '#',
        permiso: 'pagos.leer',
      },
    ],
  },
  {
    label: 'Grupos Horarios y Aulas',
    entidad: 'grupos_horarios',
    icon: '📅',
    color: 'cyan',
    href: '#',
    isDropdown: true,
    permisoLeer: 'grupos_horarios.leer',
    children: [
      {
        label: 'Aulas',
        entidad: 'aulas',
        icon: '🏛️',
        color: 'cyan',
        href: '#',
        permiso: 'aulas.leer',
      },
      {
        label: 'Grupos',
        entidad: 'grupos',
        icon: '👥',
        color: 'cyan',
        href: '#',
        permiso: 'grupos.leer',
      },
      {
        label: 'Asignación Académica',
        entidad: 'asignacion_academica',
        icon: '📋',
        color: 'cyan',
        href: '#',
        permiso: 'asignacion_academica.leer',
      },
      {
        label: 'Horarios',
        entidad: 'horarios',
        icon: '🕐',
        color: 'cyan',
        href: '#',
        permiso: 'horarios.leer',
      },
    ],
  },
  {
    label: 'Docentes y Carga Horaria',
    entidad: 'docentes',
    icon: '👨‍🏫',
    color: 'orange',
    href: '#',
    isDropdown: true,
    permisoLeer: 'docentes.leer',
    children: [
      {
        label: 'Gestión de Docentes',
        entidad: 'gestion_docentes',
        icon: '👨‍🏫',
        color: 'orange',
        href: '#',
        permiso: 'docentes.leer',
      },
      {
        label: 'Materias por Docente',
        entidad: 'docentes_materias',
        icon: '📚',
        color: 'orange',
        href: '#',
        permiso: 'docentes_materias.leer',
      },
    ],
  },
  {
    label: 'Materias y Notas',
    entidad: 'materias_notas',
    icon: '📚',
    color: 'rose',
    href: '#',
    isDropdown: true,
    permisoLeer: 'materias_notas.leer',
    children: [
      {
        label: 'Materias',
        entidad: 'materias',
        icon: '📖',
        color: 'rose',
        href: '#',
        permiso: 'materias.leer',
      },
    ],
  },
  {
    label: 'Cupos y Admisión',
    entidad: 'cupos_admision',
    icon: '🎯',
    color: 'teal',
    href: '#',
    isDropdown: false,
    permisoLeer: 'cupos_admision.leer',
    children: [],
  },
  {
    label: 'Usuarios y Seguridad',
    entidad: 'usuarios_seguridad',
    icon: '👥',
    color: 'blue',
    href: '#',
    isDropdown: true,
    permisoLeer: 'usuarios.leer',
    children: [
      {
        label: 'Usuarios',
        entidad: 'usuarios',
        icon: '👤',
        color: 'blue',
        href: '#',
        permiso: 'usuarios.leer',
      },
      {
        label: 'Roles',
        entidad: 'roles',
        icon: '🔐',
        color: 'purple',
        href: '#',
        permiso: 'roles.leer',
      },
      {
        label: 'Carreras',
        entidad: 'carreras',
        icon: '🏛️',
        color: 'indigo',
        href: '#',
        permiso: 'carreras.leer',
      },
      {
        label: 'Auditoria y Bitacora',
        entidad: 'bitacora',
        icon: '📋',
        color: 'blue',
        href: '#',
        permiso: 'bitacora.leer',
      },
    ],
  },
  {
    label: 'Asistencia y Control',
    entidad: 'asistencia',
    icon: '✅',
    color: 'green',
    href: '#',
    isDropdown: true,
    permisoLeer: 'asistencia.leer',
    children: [
      {
        label: 'Asistencia Docente',
        entidad: 'asistencia_docente',
        icon: '👨‍🏫',
        color: 'green',
        href: route('admin.asistencia.index', { tab: 'docente' }),
        permiso: 'asistencia_docente.leer',
      },
      {
        label: 'Asistencia Estudiantes',
        entidad: 'asistencia_estudiantes',
        icon: '👤',
        color: 'green',
        href: route('admin.asistencia.index', { tab: 'estudiante' }),
        permiso: 'asistencia_estudiantes.leer',
      },
    ],
  },
  {
    label: 'Reportes',
    entidad: 'reportes',
    icon: '📈',
    color: 'slate',
    href: '#',
    isDropdown: false,
    permisoLeer: 'reportes.leer',
    children: [],
  },
];

/**
 * Obtiene todos los items (botones) del sidebar agrupados por módulo.
 * Útil para la UI de permisos de roles.
 * 
 * IMPORTANTE: SOLO se retornan los items definidos en `children[]` de cada módulo.
 * Si un módulo tiene children vacío, no aparecerá ningún item en permisos.
 */
export function getSidebarItemsByModule() {
  const result = {};
  sidebarModules.forEach((mod) => {
    if (mod.children && mod.children.length > 0) {
      result[mod.label] = mod.children.map((child) => ({
        ...child,
        moduloLabel: mod.label,
      }));
    } else {
      result[mod.label] = [];
    }
  });
  return result;
}

/**
 * Obtiene los items (botones) de un módulo específico por su nombre.
 */
export function getSidebarItemsForModule(moduloLabel) {
  const mod = sidebarModules.find((m) => m.label === moduloLabel);
  if (!mod) return [];

  if (mod.children && mod.children.length > 0) {
    return mod.children.map((child) => ({
      ...child,
      moduloLabel: mod.label,
    }));
  }

  return [];
}

export default sidebarModules;