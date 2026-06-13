import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay, closestCorners, rectIntersection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import axios from 'axios';

const ESTADOS = ['Pendiente', 'Observado', 'Pago', 'Aprobado', 'Rechazado'];

export default function KanbanBoard() {
  const [columnas, setColumnas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const cargarTablero = useCallback(async () => {
    try {
      const res = await axios.post(route('admin.kanban.tablero'));
      setColumnas(res.data.columnas || []);
    } catch {}
    setCargando(false);
  }, []);

  useEffect(() => { cargarTablero(); }, []);

  const findColumna = (id) => {
    for (const col of columnas) {
      if (col.items.some((i) => i.id === id)) return col;
    }
    return null;
  };

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragEnd = async (e) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || !active) return;

    const activeCol = findColumna(active.id);
    const overId = over.id;
    const overCol = typeof overId === 'string' && overId.startsWith('columna-')
      ? columnas.find((c) => `columna-${c.estado}` === overId)
      : findColumna(overId);

    if (!activeCol || !overCol) return;

    const nuevoEstado = overCol.estado;
    const estadoActual = activeCol.estado;

    if (estadoActual === 'Aprobado') return;

    const nuevas = columnas.map((col) => ({
      ...col,
      items: col.estado === estadoActual
        ? col.items.filter((i) => i.id !== active.id)
        : col.items,
    }));

    const itemMovido = activeCol.items.find((i) => i.id === active.id);
    if (!itemMovido) return;

    const targetColIndex = nuevas.findIndex((c) => c.estado === nuevoEstado);
    if (targetColIndex === -1) return;

    if (nuevoEstado === estadoActual) {
      const oldIdx = nuevas[targetColIndex].items.findIndex((i) => i.id === active.id);
      const newIdx = nuevas[targetColIndex].items.findIndex((i) => i.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        nuevas[targetColIndex].items = arrayMove(nuevas[targetColIndex].items, oldIdx, newIdx);
      }
    } else {
      nuevas[targetColIndex].items = [...nuevas[targetColIndex].items, itemMovido];
    }

    setColumnas(nuevas.map((col) => ({ ...col, total: col.items.length })));

    try {
      await axios.post(route('admin.kanban.mover', active.id), { estado: nuevoEstado });
    } catch {
      cargarTablero();
    }
  };

  const collisionDetection = (args) => {
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCorners(args);
  };

  if (cargando) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ESTADOS.map((e) => (
          <div key={e} className="rounded-2xl bg-slate-100 animate-pulse min-h-[400px] border border-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 min-h-[600px]">
        {columnas.map((col) => (
          <KanbanColumn key={col.estado} estado={col.estado} items={col.items} />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 scale-105 rotate-2 shadow-2xl">
            {ESTADOS.map((e) => {
              const col = columnas.find((c) => c.estado === e);
              if (!col) return null;
              const item = col.items.find((i) => i.id === activeId);
              if (!item) return null;
              return <KanbanCard key={item.id} item={item} estado={e} />;
            })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
