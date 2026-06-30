import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SuccessRatePoint } from '../../types';

interface SuccessRateChartProps {
  data: SuccessRatePoint[];
}

const COLORS: Record<string, string> = {
  Sucesso: '#10b981',
  Falha: '#ef4444',
};

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-ink">Taxa de Sucesso</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) =>
              `${name}: ${total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'}% (${value})`
            }
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
