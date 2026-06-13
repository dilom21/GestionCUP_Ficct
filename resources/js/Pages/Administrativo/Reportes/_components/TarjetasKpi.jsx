import { motion } from 'framer-motion';

const items = [
  { key: 'total_postulantes', label: 'Total Postulantes', icono: '👥', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
  { key: 'total_aprobados', label: 'Aprobados', icono: '✅', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
  { key: 'total_reprobados', label: 'Reprobados', icono: '❌', color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
  { key: 'total_materias', label: 'Materias', icono: '📚', color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
  { key: 'total_grupos', label: 'Grupos Activos', icono: '👥', color: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/20' },
  { key: 'total_docentes', label: 'Docentes', icono: '👨‍🏫', color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
];

export default function TarjetasKpi({ kpi, cargando }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map((item, idx) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06 }}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-lg ${item.shadow} flex-shrink-0`}>
              {item.icono}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium truncate">{item.label}</p>
              <p className="text-xl font-bold text-slate-800 tabular-nums">
                {cargando ? (
                  <span className="inline-block w-8 h-5 bg-slate-200 rounded animate-pulse" />
                ) : (
                  kpi?.[item.key] ?? '—'
                )}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
