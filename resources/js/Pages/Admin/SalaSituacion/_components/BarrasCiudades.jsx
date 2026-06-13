import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BarrasCiudades({ ciudades = [], darkMode = true }) {
  const maxVal = Math.max(...ciudades.map((c) => c.total), 1);

  const dm = (d, l) => (darkMode ? d : l);

  if (!ciudades.length) {
    return (
      <div className={`text-sm text-center py-6 ${dm('text-white/40', 'text-slate-400')}`}>Sin datos de ciudades</div>
    );
  }

  return (
    <div className="space-y-3">
      {ciudades.map((c, i) => (
        <div key={c.ciudad} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className={`font-medium ${dm('text-white/80', 'text-slate-700')}`}>{c.ciudad}</span>
            <span className={`font-bold ${dm('text-white/50', 'text-slate-500')}`}>{c.total}</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${dm('bg-white/5', 'bg-slate-100')}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.total / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
