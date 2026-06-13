import { useState, useRef, useEffect } from 'react';

export default function BotonExportar({ onExportar, cargando, resultado }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatos = [
    { id: 'csv', label: 'CSV', icono: '📄', desc: 'Compatible con Excel' },
    { id: 'pdf', label: 'PDF', icono: '📑', desc: 'Documento portátil' },
    { id: 'excel', label: 'Excel', icono: '📊', desc: 'Formato .xlsx' },
  ];

  if (!resultado) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={cargando}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Exportar
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
          {formatos.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => { onExportar(fmt.id); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-xl">{fmt.icono}</span>
              <div>
                <p className="text-sm font-medium text-slate-700">{fmt.label}</p>
                <p className="text-[10px] text-slate-400">{fmt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
