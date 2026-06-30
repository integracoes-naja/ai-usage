import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from '../../hooks/useIsMobile';
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
  const isMobile = useIsMobile();

  return (
    <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-ink">Taxa de Sucesso</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 65 : 90}
            label={({ name, value }) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
              return isMobile ? `${pct}%` : `${name}: ${pct}% (${value})`;
            }}
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
