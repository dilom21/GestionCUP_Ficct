import { motion } from 'framer-motion';

export default function TimelineNodo({ nodo, index, esUltimo, light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="relative flex gap-5"
    >
      {/* Línea conectora */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg transition-all duration-500 ${
            nodo.completado
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30 scale-100'
              : light
                ? 'bg-slate-100 border border-slate-200 scale-95'
                : 'bg-white/10 border border-white/10 scale-95'
          }`}
        >
          <span className={nodo.completado ? '' : (light ? 'opacity-30' : 'opacity-40')}>{nodo.icono}</span>
        </div>
        {!esUltimo && (
          <div
            className={`w-0.5 h-16 sm:h-20 transition-all duration-700 ${
              nodo.completado
                ? 'bg-gradient-to-b from-emerald-400/60 to-emerald-400/10'
                : light
                  ? 'bg-slate-200'
                  : 'bg-white/10'
            }`}
          />
        )}
      </div>

      {/* Contenido */}
      <div className={`flex-1 pb-8 ${esUltimo ? 'pb-0' : ''}`}>
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            nodo.completado
              ? light
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-emerald-500/5 border-emerald-500/20'
              : light
                ? 'bg-slate-50 border-slate-100'
                : 'bg-white/5 border-white/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-sm ${
              nodo.completado
                ? light ? 'text-emerald-700' : 'text-emerald-300'
                : light ? 'text-slate-400' : 'text-white/50'
            }`}>
              {nodo.etapa}
            </h3>
            {nodo.completado && (
              <svg className={`w-4 h-4 ${light ? 'text-emerald-500' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <p className={`text-xs ${light ? 'text-slate-500' : 'text-white/40'}`}>{nodo.detalle}</p>
          {nodo.fecha && (
            <p className={`text-[10px] mt-1.5 ${light ? 'text-slate-300' : 'text-white/20'}`}>
              {new Date(nodo.fecha).toLocaleDateString('es-BO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
