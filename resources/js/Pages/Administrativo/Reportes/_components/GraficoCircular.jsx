import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { COLORES_GRAFICO } from '../_constants/reportesConfig';

export default function GraficoCircular({ datos, label, valor }) {
  if (!datos || datos.length === 0) return null;

  const total = datos.reduce((sum, d) => sum + (d.valor || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="valor"
            nameKey="label"
            label={({ label: l, valor: v }) => `${l}: ${v}`}
            labelLine={false}
          >
            {datos.map((_, idx) => (
              <Cell key={idx} fill={COLORES_GRAFICO[idx % COLORES_GRAFICO.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(v) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, valor || 'Valor']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: '11px', color: '#64748b' }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
