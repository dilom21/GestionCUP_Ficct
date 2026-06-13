import { motion } from 'framer-motion';

export default function GraficoHora({ data = [], darkMode = true }) {
  const horas = Array.from({ length: 24 }, (_, i) => i);
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const getVal = (h) => {
    const found = data.find((d) => d.hora === h);
    return found ? found.total : 0;
  };

  const dm = (d, l) => (darkMode ? d : l);

  if (!data.length) {
    return (
      <div className={`text-sm text-center py-6 ${dm('text-white/40', 'text-slate-400')}`}>Sin actividad hoy</div>
    );
  }

  return (
    <div className="flex items-end gap-1 h-32">
      {horas.map((h) => {
        const val = getVal(h);
        const pct = (val / maxVal) * 100;
        return (
          <div key={h} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.5, delay: h * 0.008 }}
              className="w-full rounded-t-md cursor-pointer transition-all duration-300 group-hover:opacity-80"
              style={{
                background: `linear-gradient(180deg, #3B82F6, #1E62A0)`,
                opacity: val > 0 ? 0.6 + pct / 200 : (darkMode ? 0.15 : 0.08),
              }}
            />
            {val > 0 && (
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${dm('bg-white/10 backdrop-blur-md', 'bg-slate-700')}`}>
                {val}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
