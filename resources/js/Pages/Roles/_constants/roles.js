/**
 * Constantes para la gestión de roles.
 * 
 * ENTIDAD_INFO asocia cada entidad (identificador de permiso como 'usuarios', 'roles')
 * con su nombre visual, icono y color. Esta información debe coincidir con los items
 * definidos en SidebarConfig (resources/js/Data/sidebarConfig.js).
 * 
 * Si agregas un nuevo botón en la sidebar, debes agregar su entrada aquí también
 * para que aparezca correctamente en la UI de permisos.
 */

export const ENTIDAD_INFO = {
    // ── Módulos principales (padres / módulos) ──
    dashboard:            { nombre: 'Dashboard',               icono: '📊', color: 'emerald' },
    postulantes:          { nombre: 'Postulaciones y Requisitos',icono: '📋', color: 'amber' },
    pagos:                { nombre: 'Pagos y Habilitación',    icono: '💰', color: 'green' },
    grupos_horarios:      { nombre: 'Grupos Horarios y Aulas', icono: '📅', color: 'cyan' },
    docentes:             { nombre: 'Docentes y Carga Horaria',icono: '👨‍🏫', color: 'orange' },
    materias_notas:       { nombre: 'Materias y Notas',        icono: '📚', color: 'rose' },
    cupos_admision:       { nombre: 'Cupos y Admisión',        icono: '🎯', color: 'teal' },
    usuarios_seguridad:   { nombre: 'Usuarios y Seguridad',    icono: '👥', color: 'blue' },
    asistencia:           { nombre: 'Asistencia y Control',    icono: '✅', color: 'green' },
    reportes:             { nombre: 'Reportes',                icono: '📈', color: 'slate' },

    // ── Botones hijos (children del sidebar) ──
    usuarios:                   { nombre: 'Usuarios',                 icono: '👤',    color: 'blue' },
    roles:                      { nombre: 'Roles',                    icono: '🔐',    color: 'purple' },
    carreras:                   { nombre: 'Carreras',                 icono: '🏛️',    color: 'indigo' },
    bitacora:                   { nombre: 'Auditoria y Bitacora',     icono: '📋',    color: 'blue' },
    materias:                   { nombre: 'Materias',                 icono: '📖',    color: 'rose' },
    pagos_listado:              { nombre: 'Pagos',                    icono: '💳',    color: 'green' },
    postulaciones_docentes:     { nombre: 'Postulaciones Docentes',   icono: '📄',    color: 'amber' },
    postulaciones_postulantes:  { nombre: 'Postulaciones Postulantes',icono: '👤',    color: 'amber' },
    aulas:                      { nombre: 'Aulas',                    icono: '🏛️',    color: 'cyan' },
    grupos:                     { nombre: 'Grupos',                   icono: '👥',    color: 'cyan' },
    asignacion_academica:       { nombre: 'Asignación Académica',     icono: '📋',    color: 'cyan' },
    horarios:                   { nombre: 'Horarios',                 icono: '🕐',    color: 'cyan' },
    gestion_docentes:           { nombre: 'Gestión de Docentes',      icono: '👨‍🏫',   color: 'orange' },
    docentes_materias:          { nombre: 'Materias por Docente',     icono: '📚',    color: 'orange' },
    gestion_postulantes:        { nombre: 'Gestión de Postulantes',   icono: '👨‍🎓',   color: 'emerald' },
    evaluaciones:               { nombre: 'Evaluaciones',             icono: '📝',    color: 'violet' },
    resultados_cup:             { nombre: 'Resultados CUP',           icono: '📊',    color: 'indigo' },
    cupos_carrera:              { nombre: 'Gestión de Cupos por Carrera', icono: '🏆', color: 'teal' },
    asignacion_carrera:         { nombre: 'Asignar Estudiantes a Carrera', icono: '🎯', color: 'amber' },
    resultados_admision:        { nombre: 'Resultados de Admisión',   icono: '📋',    color: 'indigo' },
    asistencia_docente:         { nombre: 'Asistencia Docente',       icono: '👨‍🏫',   color: 'green' },
    asistencia_estudiantes:     { nombre: 'Asistencia Estudiantes',   icono: '👤',    color: 'green' },
};

export const COLORES_ENTIDAD = {
    blue:    { bg: 'bg-blue-50',         border: 'border-blue-200',        text: 'text-blue-700',       badge: 'bg-blue-100 text-blue-600',       dot: 'bg-blue-500' },
    purple:  { bg: 'bg-purple-50',       border: 'border-purple-200',      text: 'text-purple-700',     badge: 'bg-purple-100 text-purple-600',   dot: 'bg-purple-500' },
    emerald: { bg: 'bg-emerald-50',      border: 'border-emerald-200',     text: 'text-emerald-700',    badge: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
    amber:   { bg: 'bg-amber-50',        border: 'border-amber-200',       text: 'text-amber-700',      badge: 'bg-amber-100 text-amber-600',     dot: 'bg-amber-500' },
    green:   { bg: 'bg-green-50',        border: 'border-green-200',       text: 'text-green-700',      badge: 'bg-green-100 text-green-600',     dot: 'bg-green-500' },
    cyan:    { bg: 'bg-cyan-50',         border: 'border-cyan-200',        text: 'text-cyan-700',       badge: 'bg-cyan-100 text-cyan-600',       dot: 'bg-cyan-500' },
    orange:  { bg: 'bg-orange-50',       border: 'border-orange-200',      text: 'text-orange-700',     badge: 'bg-orange-100 text-orange-600',   dot: 'bg-orange-500' },
    rose:    { bg: 'bg-rose-50',         border: 'border-rose-200',        text: 'text-rose-700',       badge: 'bg-rose-100 text-rose-600',       dot: 'bg-rose-500' },
    teal:    { bg: 'bg-teal-50',         border: 'border-teal-200',        text: 'text-teal-700',       badge: 'bg-teal-100 text-teal-600',       dot: 'bg-teal-500' },
    slate:   { bg: 'bg-slate-50',        border: 'border-slate-200',       text: 'text-slate-700',      badge: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-500' },
    indigo:  { bg: 'bg-indigo-50',       border: 'border-indigo-200',      text: 'text-indigo-700',     badge: 'bg-indigo-100 text-indigo-600',   dot: 'bg-indigo-500' },
};

export const OPCIONES_PERMISO = {
    leer: {
        id: 'lectura',
        label: 'Solo Lectura',
        descripcion: 'Puede visualizar la información',
        icono: '👁️',
        color: 'blue',
    },
    escribir: {
        id: 'escritura',
        label: 'Solo Escritura',
        descripcion: 'Puede modificar la información',
        icono: '✏️',
        color: 'green',
    },
    lectura_escritura: {
        id: 'lectura_escritura',
        label: 'Lectura y Escritura',
        descripcion: 'Acceso completo a la información',
        icono: '✅',
        color: 'indigo',
    },
    ninguno: {
        id: null,
        label: 'Sin permiso',
        descripcion: 'Sin acceso',
        icono: '🚫',
        color: 'gray',
    },
};