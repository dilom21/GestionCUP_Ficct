import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REPORTES, ESTADOS_POSTULACION, TURNOS } from '../_constants/reportesConfig';

const FILTRO_ICONS = {
  id_gestion:    { icon: '📅', label: 'Gestión' },
  id_carrera:    { icon: '🎓', label: 'Carrera' },
  id_materia:    { icon: '📖', label: 'Materia' },
  id_grupo:      { icon: '👥', label: 'Grupo' },
  id_docente:    { icon: '👨‍🏫', label: 'Docente' },
  id_aula:       { icon: '🏛️', label: 'Aula' },
  turno:         { icon: '🕐', label: 'Turno' },
  estado:        { icon: '📌', label: 'Estado' },
};

function ChipGroup({ label, icon, children, activo, onToggle, color = 'blue' }) {
  return (
    <div className="flex-shrink-0">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 whitespace-nowrap ${
          activo
            ? `bg-${color}-50 border-${color}-400 text-${color}-700 shadow-sm`
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
        }`}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

export default function PanelFiltros({
  filtros, onChange, onGenerar, gestiones, carreras, materias, grupos, docentes, aulas, cargando, reporteActivo
}) {
  const [expandido, setExpandido] = useState({});

  const reporte = REPORTES.find((r) => r.id === reporteActivo);

  const toggleSection = (key) => {
    setExpandido((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const limpiarFiltros = () => {
    Object.keys(filtros).forEach((k) => onChange(k, ''));
  };

  const filtrosActivos = Object.keys(filtros).filter((k) => filtros[k]);

  const FILTROS_CONFIG = useMemo(() => [
    { key: 'id_gestion', icon: '📅', label: 'Gestión', items: gestiones, valueKey: 'id', displayKey: 'nombre_gestion', default: true },
    { key: 'id_carrera', icon: '🎓', label: 'Carrera', items: carreras, valueKey: 'id_carrera', displayKey: (c) => `${c.nombre} (${c.sigla})`, default: true },
    { key: 'id_materia', icon: '📖', label: 'Materia', items: materias, valueKey: 'id_materia', displayKey: 'nombre', default: false },
    { key: 'id_grupo',   icon: '👥', label: 'Grupo',   items: grupos, valueKey: 'id', displayKey: (g) => `${g.sigla} — ${g.turno}`, default: false },
    { key: 'id_docente', icon: '👨‍🏫', label: 'Docente', items: docentes, valueKey: 'id', displayKey: (d) => d.nombre_completo || `CI: ${d.ci}`, default: false },
    { key: 'id_aula',    icon: '🏛️', label: 'Aula',    items: aulas, valueKey: 'id', displayKey: (a) => `${a.codigo} — ${a.nombre}`, default: false },
    { key: 'turno',      icon: '🕐', label: 'Turno',    items: TURNOS.filter(t => t.value), valueKey: 'value', displayKey: 'label', default: false },
    { key: 'estado',     icon: '📌', label: 'Estado',   items: ESTADOS_POSTULACION.filter(e => e.value), valueKey: 'value', displayKey: 'label', default: false },
  ], [gestiones, carreras, materias, grupos, docentes, aulas]);

  return (
    <div className="mb-6 space-y-3">
      {/* Quick filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {FILTROS_CONFIG.map((cfg) => {
          const activo = expandido[cfg.key];
          const seleccionado = filtros[cfg.key];
          const itemSel = seleccionado ? cfg.items?.find((it) => String(it[cfg.valueKey]) === String(seleccionado)) : null;

          return (
            <div key={cfg.key} className="flex-shrink-0">
              <button
                onClick={() => toggleSection(cfg.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 whitespace-nowrap ${
                  activo || seleccionado
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm'
                }`}
              >
                <span className="text-base leading-none">{cfg.icon}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
                {seleccionado && itemSel && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {typeof cfg.displayKey === 'function' ? cfg.displayKey(itemSel) : itemSel[cfg.displayKey]}
                  </span>
                )}
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          );
        })}

        {filtrosActivos.length > 0 && (
          <button
            onClick={limpiarFiltros}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Expanded filter panels */}
      <AnimatePresence>
        {FILTROS_CONFIG.map((cfg) => {
          if (!expandido[cfg.key]) return null;

          return (
            <motion.div
              key={cfg.key}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cfg.icon}</span>
                    <h4 className="text-sm font-bold text-slate-700">{cfg.label}</h4>
                    <span className="text-xs text-slate-400">({cfg.items?.length || 0})</span>
                  </div>
                  {filtros[cfg.key] && (
                    <button
                      onClick={() => { onChange(cfg.key, ''); }}
                      className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Quitar filtro
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onChange(cfg.key, '')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 ${
                      !filtros[cfg.key]
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Todos
                  </button>
                  {cfg.items?.map((item) => {
                    const val = item[cfg.valueKey];
                    const label = typeof cfg.displayKey === 'function' ? cfg.displayKey(item) : item[cfg.displayKey];
                    const activo = String(filtros[cfg.key]) === String(val);

                    return (
                      <button
                        key={val}
                        onClick={() => onChange(cfg.key, val)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 ${
                          activo
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-105'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Generate button bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {reporte && (
            <span className="flex items-center gap-1.5">
              <span>{reporte.icono}</span>
              <span className="font-semibold text-slate-500">{reporte.label}</span>
              {filtrosActivos.length > 0 && (
                <span className="text-slate-400">· {filtrosActivos.length} filtro{filtrosActivos.length !== 1 ? 's' : ''}</span>
              )}
            </span>
          )}
        </div>

        <button
          onClick={onGenerar}
          disabled={!reporteActivo || cargando}
          className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none"
        >
          {cargando ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generar Reporte
            </>
          )}
        </button>
      </div>
    </div>
  );
}
