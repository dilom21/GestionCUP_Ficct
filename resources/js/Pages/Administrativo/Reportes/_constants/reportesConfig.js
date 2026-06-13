export const REPORTES = [
  {
    id: 'lista_general',
    label: 'Lista General',
    descripcion: 'Todos los postulantes registrados',
    icono: '📋',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'aprobados',
    label: 'Aprobados',
    descripcion: 'Postulantes que aprobaron el CUP',
    icono: '✅',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'reprobados',
    label: 'Reprobados',
    descripcion: 'Postulantes que no aprobaron',
    icono: '❌',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
  },
  {
    id: 'promedios',
    label: 'Promedios',
    descripcion: 'Promedios generales, por estudiante y materia',
    icono: '📊',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    id: 'grupos_habilitados',
    label: 'Grupos Habilitados',
    descripcion: 'Cantidad de grupos por gestión',
    icono: '👥',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'estadisticas_materia',
    label: 'Estadísticas x Materia',
    descripcion: 'Rendimiento académico por materia',
    icono: '📚',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
  },
  {
    id: 'docentes_grupos',
    label: 'Docentes por Grupos',
    descripcion: 'Asignación de docentes a grupos',
    icono: '👨‍🏫',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    id: 'top_grupos',
    label: 'Top Grupos',
    descripcion: 'Grupos con más aprobados',
    icono: '🏆',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
  },
];

export const ESTADOS_POSTULACION = [
  { value: '', label: 'Todos' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Observado', label: 'Observado' },
  { value: 'Rechazado', label: 'Rechazado' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Aprobado', label: 'Aprobado' },
];

export const TURNOS = [
  { value: '', label: 'Todos' },
  { value: 'Mañana', label: 'Mañana' },
  { value: 'Tarde', label: 'Tarde' },
  { value: 'Noche', label: 'Noche' },
];

export const TIPOS_GRAFICO = [
  { value: 'bar', label: 'Barras', icono: '📊' },
  { value: 'pie', label: 'Circular', icono: '🥧' },
  { value: 'line', label: 'Líneas', icono: '📈' },
  { value: 'area', label: 'Área', icono: '🔵' },
];

export const COLORES_GRAFICO = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

export const COLORES_BADGE = {
  Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  Observado: 'bg-orange-100 text-orange-700 border-orange-200',
  Rechazado: 'bg-red-100 text-red-700 border-red-200',
  Pago: 'bg-blue-100 text-blue-700 border-blue-200',
  Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Confirmado: 'bg-green-100 text-green-700 border-green-200',
  Activo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactivo: 'bg-slate-100 text-slate-500 border-slate-200',
  Aprobado_resultado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Reprobado: 'bg-red-100 text-red-700 border-red-200',
};
