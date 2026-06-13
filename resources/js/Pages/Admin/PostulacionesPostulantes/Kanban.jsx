import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import KanbanBoard from './_components/KanbanBoard';

export default function Kanban() {
  return (
    <AdminLayout>
      <Head title="Kanban - Postulaciones" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Arrastrá y soltá</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <span>📋</span>Kanban de Postulaciones
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Arrastrá las tarjetas entre columnas para cambiar el estado
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar
            </button>
          </div>
        </motion.div>

        <KanbanBoard />
      </div>
    </AdminLayout>
  );
}
