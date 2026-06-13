import { motion, AnimatePresence } from 'framer-motion';

const TIPO_STYLES = {
  postulacion: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icono: '📋' },
  pago: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icono: '💰' },
};

export default function TimelineFlash({ items = [], darkMode = true }) {
  const dm = (d, l) => (darkMode ? d : l);

  if (!items.length) {
    return (
      <div className={`text-sm text-center py-6 ${dm('text-white/40', 'text-slate-400')}`}>Sin actividad reciente</div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
      <AnimatePresence initial={false}>
        {items.map((item, i) => {
          const style = TIPO_STYLES[item.tipo] || TIPO_STYLES.postulacion;
          return (
            <motion.div
              key={`${item.tipo}-${i}`}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-colors duration-300 ${dm('border-white/5', 'border-slate-100')}`}
              style={{ background: darkMode ? style.bg : `${style.color}08` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${style.color}20` }}
              >
                {item.icono}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${dm('text-white/80', 'text-slate-700')}`}>{item.texto}</p>
                <p className={`text-[10px] mt-0.5 ${dm('text-white/40', 'text-slate-400')}`}>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleTimeString('es-BO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: style.color }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
