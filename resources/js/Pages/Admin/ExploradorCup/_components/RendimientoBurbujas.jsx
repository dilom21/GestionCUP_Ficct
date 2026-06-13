import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function RendimientoBurbujas({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-10 text-slate-400 text-sm">Sin datos de notas disponibles</div>
  );

  const maxNotas = Math.max(...data.map(d => d.notas), 1);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3">
        <p className="text-sm font-bold text-slate-700">{d.materia}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-xs">
          <span className="text-slate-400">Promedio:</span><span className="font-bold text-indigo-600">{d.promedio}</span>
          <span className="text-slate-400">Notas:</span><span className="font-bold">{d.notas}</span>
          <span className="text-slate-400">Estudiantes:</span><span className="font-bold">{d.estudiantes}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <XAxis type="number" dataKey="notas" name="Cant. Notas" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis type="number" dataKey="promedio" name="Promedio" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <ZAxis type="number" dataKey="estudiantes" range={[80, 500]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} shape="circle">
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
            ))}
          </Scatter>
          <Legend
            formatter={(value) => <span className="text-xs text-slate-500">{value}</span>}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-1">
        <span>🔵 Tamaño = cantidad de estudiantes</span>
        <span>📊 Eje X = total notas</span>
        <span>📈 Eje Y = promedio</span>
      </div>
    </div>
  );
}
