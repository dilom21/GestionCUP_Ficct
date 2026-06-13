import { motion } from 'framer-motion';
import { REPORTES } from '../_constants/reportesConfig';

export default function BotonesReportes({ reporteActivo, onSeleccionar, cargando }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Reportes obligatorios
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
        {REPORTES.map((rep, idx) => {
          const activo = reporteActivo === rep.id;
          return (
            <motion.button
              key={rep.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => onSeleccionar(rep.id)}
              disabled={cargando}
              className={`relative overflow-hidden rounded-xl border p-3 sm:p-4 text-left transition-all duration-200 group
                ${activo
                  ? `bg-gradient-to-br ${rep.gradient} text-white border-transparent shadow-lg`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-700'
                }
                disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`text-xl sm:text-2xl ${activo ? '' : 'group-hover:scale-110 transition-transform'}`}>
                  {rep.icono}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs sm:text-sm font-semibold truncate ${activo ? 'text-white' : 'text-slate-700'}`}>
                    {rep.label}
                  </p>
                  <p className={`text-[10px] sm:text-xs truncate ${activo ? 'text-white/70' : 'text-slate-400'}`}>
                    {rep.descripcion}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
