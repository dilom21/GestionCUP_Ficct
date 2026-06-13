import { useRef, useState } from 'react';

export default function WidgetWrapper({ titulo, icono, color, children, loading = false, ancho = 'full' }) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${ancho === 'half' ? 'col-span-1' : 'col-span-full'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}>
            <span className="text-lg">{icono}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800">{titulo}</h3>
        </div>
        <button
          onClick={() => setColapsado(!colapsado)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${colapsado ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      <div className={`transition-all duration-300 ${colapsado ? 'max-h-0 overflow-hidden py-0' : 'p-5'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-slate-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Cargando...</span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
