import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CostByDayPoint } from '../../types';

interface CostByDayChartProps {
  data: CostByDayPoint[];
}

const SERIES_COLORS = ['#f58220', '#2563eb', '#16a34a', '#9333ea', '#dc2626', '#0891b2'];

function formatUsd(value: number) {
  return `$ ${value.toFixed(4)}`;
}

export function CostByDayChart({ data }: CostByDayChartProps) {
  const seriesKeys = Array.from(
    new Set(data.flatMap((point) => Object.keys(point).filter((key) => key !== 'date')))
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-ink">Custo por Dia</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
            labelStyle={{ color: '#111827' }}
            formatter={(value) => formatUsd(Number(value))}
          />
          {seriesKeys.length > 1 && <Legend />}
          {seriesKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={0.15}
              stackId={seriesKeys.length > 1 ? undefined : '1'}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
