import { useState } from 'react';

function getColor(valor) {
  if (valor === 0) return 'bg-slate-50';
  if (valor < 50) return 'bg-red-200 text-red-800';
  if (valor < 65) return 'bg-orange-200 text-orange-800';
  if (valor < 75) return 'bg-yellow-200 text-yellow-800';
  if (valor < 85) return 'bg-lime-200 text-lime-800';
  return 'bg-emerald-300 text-emerald-900';
}

export default function MapaCalor({ data }) {
  const [enfocado, setEnfocado] = useState(null);

  if (!data || data.length === 0) return (
    <div className="text-center py-10 text-slate-400 text-sm">
      Seleccioná una gestión con datos de notas
    </div>
  );

  const xLabels = [...new Set(data.flatMap(s => s.data.map(d => d.x)))];
  const yLabels = data.map(s => s.name);
  const maxVal = Math.max(...data.flatMap(s => s.data.map(d => d.valor)), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="flex items-center gap-6 mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promedio por Materia × Grupo</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
            <span>0</span>
            <span className="w-3 h-3 rounded bg-red-200" />
            <span>&lt;50</span>
            <span className="w-3 h-3 rounded bg-orange-200" />
            <span>50-64</span>
            <span className="w-3 h-3 rounded bg-yellow-200" />
            <span>65-74</span>
            <span className="w-3 h-3 rounded bg-lime-200" />
            <span>75-84</span>
            <span className="w-3 h-3 rounded bg-emerald-300" />
            <span>85+</span>
          </div>
        </div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `140px repeat(${xLabels.length}, 1fr)` }}>
          <div className="text-[10px] font-semibold text-slate-400 px-2 py-1.5">Materia \ Grupo</div>
          {xLabels.map(x => (
            <div key={x} className="text-[10px] font-bold text-slate-600 text-center px-1 py-1.5 truncate">{x}</div>
          ))}
          {yLabels.map((y, yi) => (
            <>
              <div className="text-[11px] font-medium text-slate-600 px-2 py-1.5 truncate">{y}</div>
              {xLabels.map((x, xi) => {
                const cell = data[yi]?.data?.find(d => d.x === x);
                const val = cell?.valor ?? 0;
                return (
                  <div
                    key={`${yi}-${xi}`}
                    onMouseEnter={() => setEnfocado({ materia: y, grupo: x, valor: val })}
                    onMouseLeave={() => setEnfocado(null)}
                    className={`${getColor(val)} rounded-lg text-center py-3 text-xs font-bold transition-all duration-150 cursor-default ${enfocado?.materia === y && enfocado?.grupo === x ? 'scale-110 shadow-lg ring-2 ring-white z-10' : ''}`}
                  >
                    {val > 0 ? val.toFixed(1) : '—'}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        {enfocado && (
          <div className="mt-3 text-xs text-slate-500 text-center bg-slate-50 rounded-lg py-2 px-4 border border-slate-100">
            <span className="font-bold text-slate-700">{enfocado.materia}</span> en grupo <span className="font-bold text-slate-700">{enfocado.grupo}</span> — Promedio: <span className="font-bold text-indigo-600">{enfocado.valor.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
