import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORES_GRAFICO } from '../_constants/reportesConfig';

export default function GraficoBarras({ datos, label, valor }) {
  if (!datos || datos.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(v) => [v, valor || 'Valor']}
            labelFormatter={(l) => label ? `${label}: ${l}` : l}
          />
          <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {datos.map((_, idx) => (
              <Cell key={idx} fill={COLORES_GRAFICO[idx % COLORES_GRAFICO.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
