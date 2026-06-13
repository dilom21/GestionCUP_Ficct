import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ESTADO_STYLES = {
  Pendiente: { dot: 'bg-blue-500', border: 'border-l-blue-400', badge: 'bg-blue-100 text-blue-700' },
  Observado: { dot: 'bg-amber-500', border: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-700' },
  Pago: { dot: 'bg-emerald-500', border: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  Aprobado: { dot: 'bg-green-600', border: 'border-l-green-500', badge: 'bg-green-100 text-green-700' },
  Rechazado: { dot: 'bg-red-500', border: 'border-l-red-400', badge: 'bg-red-100 text-red-700' },
};

export default function KanbanCard({ item, estado }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { estado },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const s = ESTADO_STYLES[estado] || ESTADO_STYLES.Pendiente;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.border} p-4 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-slate-800 truncate flex-1">{item.postulante}</p>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${s.dot}`} />
      </div>
      <div className="space-y-1 text-xs text-slate-500">
        {item.ci && <p className="font-medium text-slate-400">CI: {item.ci}</p>}
        {item.carrera && (
          <p className="truncate">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
              {item.carrera}
            </span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-[11px]">📄</span>
            <span className="font-medium">{item.documentos}</span>
          </span>
          <span className="text-slate-200">|</span>
          <span className="text-[11px]">{item.fecha}</span>
        </div>
      </div>
    </div>
  );
}
