export default function HistorialVoz({ consultas, onRepetir, cargando }) {
  if (!consultas || consultas.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Historial de consultas
      </h4>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {consultas.map((c) => (
          <button
            key={c.id}
            onClick={() => onRepetir(c)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left border border-slate-100"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-700 truncate">{c.consulta_texto}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(c.created_at).toLocaleString('es-BO')} — {c.resultado_resumen}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
