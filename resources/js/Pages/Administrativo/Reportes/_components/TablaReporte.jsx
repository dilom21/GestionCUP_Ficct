import { useState, useMemo } from 'react';
import { useMediaQuery } from '../_hooks/useMediaQuery';
import { COLORES_BADGE } from '../_constants/reportesConfig';

function valorCelda(valor) {
  if (valor === null || valor === undefined) return '—';
  const str = String(valor);
  if (COLORES_BADGE[str]) {
    return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${COLORES_BADGE[str]}`}>{str}</span>;
  }
  if (str === 'Sí') return <span className="text-emerald-600 font-semibold">✓ Sí</span>;
  if (str === 'No') return <span className="text-red-400">✗ No</span>;
  return str;
}

export default function TablaReporte({ columns, data, tipo }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const [pagina, setPagina] = useState(0);
  const porPagina = isMobile ? 5 : isTablet ? 10 : 15;

  const datosPlano = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (tipo === 'promedios' && data.por_estudiante) return data.por_estudiante;
    if (tipo === 'promedios' && data.por_materia) return data.por_materia;
    return [];
  }, [data, tipo]);

  const paginadas = useMemo(() => {
    return datosPlano.slice(pagina * porPagina, (pagina + 1) * porPagina);
  }, [datosPlano, pagina, porPagina]);

  const totalPaginas = Math.ceil(datosPlano.length / porPagina);

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-400 font-medium">Seleccioná un reporte y generalo para ver los resultados</p>
      </div>
    );
  }

  if (tipo === 'promedios') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Promedio General del CUP</p>
          <p className="text-5xl font-extrabold text-blue-600 tabular-nums">{data.promedio_general ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-2">{data.total_resultados ?? 0} estudiantes</p>
        </div>

        {data.por_materia && data.por_materia.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Promedios por Materia</h4>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Materia</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Promedio</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.por_materia.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{m.materia}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{m.promedio}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-400 tabular-nums">{m.total_notas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.por_estudiante && data.por_estudiante.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Promedios por Estudiante</h4>
            <TablaSimple columns={['Nombre', 'CI', 'Promedio', 'Estado']} data={data.por_estudiante} />
          </div>
        )}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div>
        <div className="space-y-2.5">
          {paginadas.map((row, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              {columns.map((col, j) => {
                const val = Array.isArray(row) ? row[j] : Object.values(row)[j];
                if (val === undefined || val === null) return null;
                return (
                  <div key={j} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400">{col}</span>
                    <span className="text-xs font-medium text-slate-700">{valorCelda(val)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {totalPaginas > 1 && <Paginacion pagina={pagina} total={totalPaginas} onChange={setPagina} />}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginadas.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, j) => {
                    const val = Array.isArray(row) ? row[j] : Object.values(row)[j];
                    return (
                      <td key={j} className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {valorCelda(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPaginas > 1 && <Paginacion pagina={pagina} total={totalPaginas} onChange={setPagina} />}
    </div>
  );
}

function TablaSimple({ columns, data }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                {columns.map((col, j) => {
                  const val = Array.isArray(row) ? row[j] : Object.values(row)[j];
                  return <td key={j} className="px-4 py-3 text-sm text-slate-600">{valorCelda(val)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Paginacion({ pagina, total, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(Math.max(0, pagina - 1))} disabled={pagina === 0}
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
        Anterior
      </button>
      <span className="text-xs text-slate-400 tabular-nums">{pagina + 1} / {total}</span>
      <button onClick={() => onChange(Math.min(total - 1, pagina + 1))} disabled={pagina >= total - 1}
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
        Siguiente
      </button>
    </div>
  );
}
