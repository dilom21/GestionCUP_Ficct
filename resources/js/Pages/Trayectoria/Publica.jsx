import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import TimelineNodo from './_components/TimelineNodo';

export default function TrayectoriaPublica({ postulante, nodos }) {
  const completados = nodos.filter((n) => n.completado).length;

  return (
    <>
      <Head title="Mi Trayectoria - CUP FICCT" />

      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0B2046] to-[#1a1a2e] py-8 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Curso Preuniversitario FICCT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              🛤️ Mi Trayectoria
            </h1>
            {postulante && (
              <p className="text-white/60 text-sm">
                {postulante.nombre} {postulante.apellidos}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/40">
              <span className="text-emerald-400 font-bold">{completados}</span>
              <span>/</span>
              <span>{nodos.length}</span>
              <span className="text-white/30">etapas completadas</span>
            </div>
            {/* Barra de progreso */}
            <div className="mt-3 h-1.5 rounded-full bg-white/5 max-w-xs mx-auto overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completados / nodos.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="space-y-0">
            {nodos.map((nodo, i) => (
              <TimelineNodo
                key={nodo.etapa}
                nodo={nodo}
                index={i}
                esUltimo={i === nodos.length - 1}
              />
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center text-xs text-white/20"
          >
            <p>Facultad de Ciencias de la Computación y Telecomunicaciones</p>
            <p className="mt-1">Universidad Autónoma Gabriel René Moreno</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
