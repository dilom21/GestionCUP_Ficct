import { motion } from 'framer-motion';

const TIMELINE_COLORS = {
  postulacion: { dot: 'bg-blue-500', line: 'bg-blue-200', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  pago: { dot: 'bg-emerald-500', line: 'bg-emerald-200', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  aprobado: { dot: 'bg-cyan-500', line: 'bg-cyan-200', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
  default: { dot: 'bg-slate-400', line: 'bg-slate-200', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600' },
};

export default function TimelineActividad({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-10 text-slate-400 text-sm">Sin actividad reciente</div>
  );

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-emerald-200 to-cyan-200 rounded-full" />
      <div className="space-y-0">
        {data.map((item, i) => {
          const colors = TIMELINE_COLORS[item.tipo] || TIMELINE_COLORS.default;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-start gap-4 pb-4 last:pb-0 relative"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.dot} flex items-center justify-center text-white shadow-sm z-10`}>
                <span className="text-sm">{item.icono || '📌'}</span>
              </div>
              <div className={`flex-1 rounded-xl border ${colors.bg} px-4 py-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-bold ${colors.text}`}>{item.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.descripcion || ''}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.tiempo || ''}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
