import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TIPO_STYLES = {
  postulacion: 'border-l-blue-400 bg-blue-50/50',
  pago: 'border-l-emerald-400 bg-emerald-50/50',
  docente: 'border-l-violet-400 bg-violet-50/50',
  alerta: 'border-l-red-400 bg-red-50/50',
  resultado: 'border-l-cyan-400 bg-cyan-50/50',
  info: 'border-l-slate-400 bg-slate-50',
};

export default function PanelNotificaciones() {
  const [abierto, setAbierto] = useState(false);
  const [noLeidas, setNoLeidas] = useState([]);
  const [todas, setTodas] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const panelRef = useRef(null);
  const pollingRef = useRef(null);

  const cargar = async () => {
    try {
      const res = await axios.get(route('admin.notificaciones.index'));
      setNoLeidas(res.data.no_leidas || []);
      setTodas(res.data.todas || []);
      setTotalNoLeidas(res.data.total_no_leidas || 0);
    } catch {}
  };

  useEffect(() => {
    cargar();
    pollingRef.current = setInterval(cargar, 30000);
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    if (abierto) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [abierto]);

  const marcarLeida = async (id) => {
    try {
      await axios.post(route('admin.notificaciones.marcar-leida', id));
      setNoLeidas((prev) => prev.filter((n) => n.id !== id));
      setTodas((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
      setTotalNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const marcarTodas = async () => {
    try {
      await axios.post(route('admin.notificaciones.todas-leidas'));
      setNoLeidas([]);
      setTodas((prev) => prev.map((n) => ({ ...n, leida: true })));
      setTotalNoLeidas(0);
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalNoLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 px-1">
            {totalNoLeidas > 99 ? '99+' : totalNoLeidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔔</span>
                <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
                {totalNoLeidas > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                    {totalNoLeidas} nueva{totalNoLeidas !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {totalNoLeidas > 0 && (
                <button onClick={marcarTodas} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all">
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {noLeidas.length === 0 && todas.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="text-3xl">🔕</span>
                  <p className="text-sm text-slate-400 mt-2 font-medium">No hay notificaciones</p>
                </div>
              ) : (
                <>
                  {noLeidas.length > 0 && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Nuevas</p>
                    </div>
                  )}
                  {noLeidas.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => marcarLeida(n.id)}
                      className={`w-full text-left px-4 py-3 border-l-4 ${TIPO_STYLES[n.tipo] || TIPO_STYLES.info} hover:brightness-95 transition-all`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base flex-shrink-0 mt-0.5">{n.icono || '🔔'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{n.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {n.created_at ? new Date(n.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {todas.filter(n => n.leida).length > 0 && (
                    <>
                      <div className="px-3 pt-4 pb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Anteriores</p>
                      </div>
                      {todas.filter(n => n.leida).slice(0, 5).map((n) => (
                        <div key={n.id} className="px-4 py-2.5 border-l-4 border-slate-200 opacity-60">
                          <div className="flex items-start gap-3">
                            <span className="text-base flex-shrink-0 mt-0.5">{n.icono || '🔔'}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-600 truncate">{n.titulo}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
