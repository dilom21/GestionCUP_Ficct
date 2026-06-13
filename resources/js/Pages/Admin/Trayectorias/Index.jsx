import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import TimelineNodo from '@/Pages/Trayectoria/_components/TimelineNodo';

export default function TrayectoriasAdmin() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [sinResultados, setSinResultados] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (busqueda.length < 3) {
      setResultados([]);
      setSinResultados(false);
      return;
    }
    setCargando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.post(route('admin.trayectorias.buscar'), { busqueda });
        setResultados(res.data.postulaciones || []);
        setSinResultados((res.data.postulaciones || []).length === 0);
      } catch {
        setResultados([]);
        setSinResultados(true);
      }
      setCargando(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  return (
    <AdminLayout>
      <Head title="Trayectorias - Admin" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
              <span>🛤️</span>Trayectorias de Postulantes
            </h1>
            <p className="text-blue-100/80 text-sm mb-5">
              Escribí CI, nombre o apellido para buscar
            </p>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setSeleccionado(null); }}
                placeholder="Buscar por CI, nombre o apellido..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                autoFocus
              />
              {cargando && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {sinResultados && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <span className="text-3xl mb-3 block">🔍</span>
            <p className="text-slate-500 text-sm">No se encontraron postulantes con ese criterio</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {resultados.length > 0 && !seleccionado && (
            <motion.div
              key="lista"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {resultados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSeleccionado(p)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {p.nombres}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        CI: {p.ci} — {p.carrera}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{p.nodos?.filter((n) => n.completado).length}/{p.nodos?.length}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {seleccionado && (
            <motion.div
              key="detalle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  🛤️ {seleccionado.nombres}
                </h2>
                <button
                  onClick={() => setSeleccionado(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-sm hover:bg-slate-200 transition-all"
                >
                  Volver
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="space-y-0 max-w-xl mx-auto">
                  {seleccionado.nodos?.map((nodo, i) => (
                    <TimelineNodo
                      key={nodo.etapa}
                      nodo={nodo}
                      index={i}
                      esUltimo={i === (seleccionado.nodos?.length ?? 1) - 1}
                      light={true}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
