import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { motion, AnimatePresence } from 'framer-motion';

const HEADERS = {
  Pendiente: { icono: '⏳', color: '#3B82F6', bg: 'from-blue-50 to-blue-50/30', desc: 'Esperando revisión' },
  Observado: { icono: '🔍', color: '#F59E0B', bg: 'from-amber-50 to-amber-50/30', desc: 'Requiere correcciones' },
  Pago: { icono: '💰', color: '#10B981', bg: 'from-emerald-50 to-emerald-50/30', desc: 'Pendiente de pago' },
  Aprobado: { icono: '✅', color: '#059669', bg: 'from-green-50 to-green-50/30', desc: 'Postulación completa' },
  Rechazado: { icono: '❌', color: '#EF4444', bg: 'from-red-50 to-red-50/30', desc: 'No cumple requisitos' },
};

export default function KanbanColumn({ estado, items }) {
  const { setNodeRef, isOver } = useDroppable({ id: `columna-${estado}` });
  const h = HEADERS[estado] || HEADERS.Pendiente;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-gradient-to-b ${h.bg} border border-slate-200 min-h-[500px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-400/30 scale-[1.01] shadow-lg' : ''
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200/60 flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-t-2xl">
        <span className="text-lg">{h.icono}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{estado}</h3>
          <p className="text-[10px] text-slate-400 truncate">{h.desc}</p>
        </div>
        <span
          className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-[11px] font-bold shadow-sm"
          style={{ background: `${h.color}15`, color: h.color }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[550px] scrollbar-thin">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <KanbanCard item={item} estado={estado} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-300 text-xs text-center">
            <span className="text-2xl mb-1 opacity-50">📭</span>
            <p className="font-medium">Arrastrá postulaciones aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}
