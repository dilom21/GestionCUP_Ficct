export default function SelectorVista({ vista, onChange }) {
  const opciones = [
    { value: 'tabla', label: 'Tabla', icono: '📋' },
    { value: 'grafico', label: 'Gráfico', icono: '📊' },
    { value: 'ambos', label: 'Ambos', icono: '🔀' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5
            ${vista === op.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <span>{op.icono}</span>
          <span className="hidden sm:inline">{op.label}</span>
        </button>
      ))}
    </div>
  );
}
