import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#EF4444'];

export default function EmbudoAdmision({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-10 text-slate-400 text-sm">Sin datos disponibles</div>
  );

  const total = data[0]?.valor || 1;

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" barSize={36} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="etapa" width={130} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              const pct = ((d.valor / total) * 100).toFixed(1);
              return (
                <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-slate-600">{d.etapa}</p>
                  <p className="text-lg font-bold" style={{ color: d.color }}>{d.valor}</p>
                  <p className="text-xs text-slate-400">{pct}% del total</p>
                </div>
              );
            }}
          />
          <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList dataKey="valor" position="right" className="text-xs font-bold" fill="#475569" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="font-medium">{d.etapa}:</span>
            <span className="font-bold">{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
