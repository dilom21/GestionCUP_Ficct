import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import axios from 'axios';
import WidgetWrapper from './_components/WidgetWrapper';
import EmbudoAdmision from './_components/EmbudoAdmision';
import MapaCalor from './_components/MapaCalor';
import RendimientoBurbujas from './_components/RendimientoBurbujas';
import TimelineActividad from './_components/TimelineActividad';

const KPI_STYLES = [
  { label: 'Postulantes', icon: '📋', bg: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
  { label: 'Aprobados', icon: '✅', bg: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
  { label: 'Reprobados', icon: '❌', bg: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
  { label: 'Pagos', icon: '💰', bg: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
  { label: 'Docentes', icon: '👨‍🏫', bg: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
  { label: 'Materias', icon: '📖', bg: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/20' },
  { label: 'Grupos', icon: '👥', bg: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/20' },
];

const WIDGET_ORDER = ['embudo', 'burbujas', 'calor', 'timeline'];

export default function ExploradorCupIndex({ gestiones }) {
  const [idGestion, setIdGestion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [orden, setOrden] = useState(WIDGET_ORDER);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async (gestion) => {
    setCargando(true);
    setError(null);
    try {
      const res = await axios.post(route('admin.explorador-cup.datos'), { id_gestion: gestion || '' });
      setDatos(res.data);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.statusText || 'Error al cargar los datos';
      setError(msg + (e?.response?.status ? ` (${e.response.status})` : ''));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos(idGestion);
  }, [idGestion]);

  const resumen = datos?.resumen;

  const moverWidget = (dir, idx) => {
    const nuevo = [...orden];
    const target = idx + dir;
    if (target < 0 || target >= nuevo.length) return;
    [nuevo[idx], nuevo[target]] = [nuevo[target], nuevo[idx]];
    setOrden(nuevo);
  };

  const WIDGETS = {
    embudo: {
      titulo: 'Embudo de Admisión', icono: '🔻', color: 'from-blue-500 to-indigo-600',
      comp: <EmbudoAdmision data={datos?.funnel} />,
      half: false,
    },
    burbujas: {
      titulo: 'Rendimiento por Materia', icono: '🔵', color: 'from-rose-500 to-pink-600',
      comp: <RendimientoBurbujas data={datos?.burbujas} />,
      half: false,
    },
    calor: {
      titulo: 'Mapa de Calor × Grupos', icono: '🌡️', color: 'from-emerald-500 to-teal-600',
      comp: <MapaCalor data={datos?.calor} />,
      half: true,
    },
    timeline: {
      titulo: 'Actividad Reciente', icono: '⏳', color: 'from-amber-500 to-orange-600',
      comp: <TimelineActividad data={datos?.timeline} />,
      half: true,
    },
  };

  return (
    <AdminLayout>
      <Head title="Explorador CUP" />

      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2046] via-[#1a3a6b] to-[#1E62A0] p-6 sm:p-8 mb-6"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <span>🚀</span>Explorador Visual del CUP
                </h1>
                <p className="text-blue-200/80 mt-1 text-sm">
                  Visualizá el estado completo del Curso Preuniversitario en un solo panel
                </p>
              </div>
              <select
                value={idGestion}
                onChange={(e) => setIdGestion(e.target.value)}
                className="w-full sm:w-56 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
              >
                <option value="" className="text-slate-700">Todas las gestiones</option>
                {gestiones?.map((g) => (
                  <option key={g.id} value={g.id} className="text-slate-700">{g.nombre_gestion}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        {resumen && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
            {KPI_STYLES.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-gradient-to-br ${kpi.bg} rounded-xl p-3 text-center shadow-lg ${kpi.shadow}`}
              >
                <div className="text-xl mb-0.5">{kpi.icon}</div>
                <p className="text-lg font-black text-white">{resumen[kpi.label.toLowerCase()] || 0}</p>
                <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">{kpi.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Widget Grid */}
        <div className="space-y-4">
          {orden.map((id, idx) => {
            const w = WIDGETS[id];
            if (!w) return null;
            const isHalf = w.half;

            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <WidgetWrapper titulo={w.titulo} icono={w.icono} color={w.color} loading={cargando} ancho={isHalf ? 'half' : 'full'}>
                  {/* Reorder buttons */}
                  <div className="flex items-center justify-end gap-1 mb-3">
                    {idx > 0 && (
                      <button onClick={() => moverWidget(-1, idx)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Mover arriba">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                    )}
                    {idx < orden.length - 1 && (
                      <button onClick={() => moverWidget(1, idx)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Mover abajo">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    )}
                  </div>
                  {w.comp}
                </WidgetWrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {!cargando && !datos && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Seleccioná una gestión</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Elegí una gestión académica para visualizar los datos del CUP en los diferentes widgets.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
