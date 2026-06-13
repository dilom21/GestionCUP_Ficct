import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import axios from 'axios';
import KpiGlow from './_components/KpiGlow';
import FeedTicker from './_components/FeedTicker';
import BarrasCiudades from './_components/BarrasCiudades';
import GraficoHora from './_components/GraficoHora';
import TimelineFlash from './_components/TimelineFlash';

const KPI_DEFS = [
  { key: 'postulaciones_hoy', icono: '📋', label: 'Postulaciones Hoy', color: '#3B82F6' },
  { key: 'postulaciones_semana', icono: '📊', label: 'Esta Semana', color: '#8B5CF6' },
  { key: 'pagos_hoy', icono: '💰', label: 'Pagos Hoy', color: '#10B981' },
  { key: 'pendientes_revision', icono: '⏳', label: 'Pendientes Rev.', color: '#F59E0B' },
  { key: 'aprobados', icono: '✅', label: 'Aprobados', color: '#06B6D4' },
  { key: 'total_postulantes', icono: '👥', label: 'Total Postulantes', color: '#EC4899' },
  { key: 'total_docentes', icono: '👨‍🏫', label: 'Docentes', color: '#F97316' },
  { key: 'total_inscriptos', icono: '🎓', label: 'Inscritos', color: '#14B8A6' },
];

export default function SalaSituacionIndex() {
  const [kpis, setKpis] = useState({});
  const [feed, setFeed] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [horas, setHoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const res = await axios.post(route('admin.sala-situacion.estadisticas'));
      setKpis(res.data.kpis || {});
      setFeed(res.data.feed_reciente || []);
      setCiudades(res.data.ciudades || []);
      setHoras(res.data.postulaciones_por_hora || []);
    } catch {}
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 15000);
    return () => clearInterval(interval);
  }, []);

  const dm = (d, l) => (darkMode ? d : l);

  return (
    <AdminLayout>
      <Head title="Sala de Situación" />

      <div className={`max-w-7xl mx-auto -m-6 lg:-m-8 p-6 lg:p-8 min-h-screen transition-colors duration-500 ${dm('bg-gradient-to-br from-[#0a1628] via-[#0B2046] to-[#1a1a2e]', 'bg-gradient-to-br from-slate-50 via-white to-slate-100')}`}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-6 border transition-colors duration-500 ${dm('bg-gradient-to-br from-[#0B2046] via-[#0a1628] to-[#1a1a2e] border-white/10', 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-300/20')}`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${dm('opacity-100 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]', 'opacity-0')}`} />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${dm('bg-emerald-400 shadow-emerald-400/50', 'bg-emerald-500 shadow-emerald-500/50')}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${dm('text-emerald-400/80', 'text-emerald-200')}`}>En vivo</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-3 ${dm('text-white', 'text-white')}`}>
                <span>🖥️</span>Sala de Situación
              </h1>
              <p className={`mt-1 text-sm max-w-xl ${dm('text-white/40', 'text-blue-100/80')}`}>
                Monitoreo en tiempo real del estado del Curso Preuniversitario
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-sm border transition-all duration-300 ${dm('bg-white/10 border-white/20 text-white hover:bg-white/20', 'bg-white/20 border-white/30 text-white hover:bg-white/30')}`}
            >
              {darkMode ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Modo Claro</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>Modo Oscuro</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Ticker */}
        <div className="mb-6">
          <FeedTicker items={feed} darkMode={darkMode} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {KPI_DEFS.map((kpi, i) => (
            <KpiGlow
              key={kpi.key}
              icono={kpi.icono}
              label={kpi.label}
              valor={kpis[kpi.key] || 0}
              color={kpi.color}
              delay={i * 60}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Widgets inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-500 ${dm('border-white/10 bg-white/5', 'border-slate-200 bg-white shadow-sm')}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📈</span>
              <h3 className={`text-sm font-bold ${dm('text-white/80', 'text-slate-700')}`}>Postulaciones por Hora (hoy)</h3>
            </div>
            <GraficoHora data={horas} darkMode={darkMode} />
            <div className={`flex justify-between mt-2 text-[10px] ${dm('text-white/30', 'text-slate-300')}`}>
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-500 ${dm('border-white/10 bg-white/5', 'border-slate-200 bg-white shadow-sm')}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📍</span>
              <h3 className={`text-sm font-bold ${dm('text-white/80', 'text-slate-700')}`}>Postulantes por Ciudad</h3>
            </div>
            <BarrasCiudades ciudades={ciudades} darkMode={darkMode} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-500 lg:col-span-2 ${dm('border-white/10 bg-white/5', 'border-slate-200 bg-white shadow-sm')}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚡</span>
              <h3 className={`text-sm font-bold ${dm('text-white/80', 'text-slate-700')}`}>Actividad Reciente</h3>
              <span className={`text-[10px] ml-auto ${dm('text-white/30', 'text-slate-300')}`}>hoy</span>
            </div>
            <TimelineFlash items={feed} darkMode={darkMode} />
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
