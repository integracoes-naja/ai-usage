import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';
import type { CostPer1kTokensPoint } from '../../types';

interface CostPer1kTokensChartProps {
  data: CostPer1kTokensPoint[];
}

function formatUsd(value: number) {
  return `$ ${value.toFixed(6)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 15h.01M15.5 8.5l-7 7" />
  </svg>
);

export function CostPer1kTokensChart({ data }: CostPer1kTokensChartProps) {
  return (
    <ChartCard
      title="Custo por 1k Tokens"
      icon={icon}
      accent="emerald"
      info={{
        whatItShows: 'Custo efetivo a cada 1.000 tokens consumidos, por modelo.',
        howToInterpret:
          'Compare modelos entre si nessa métrica antes de decidir trocar de modelo em um workflow — volume alto não significa ineficiência se o custo por token for baixo.',
      }}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis dataKey="model" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => `$${Number(v).toFixed(3)}`}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 8px 24px -12px rgba(17,24,39,0.18)',
              fontSize: 13,
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: 4 }}
            formatter={(value) => formatUsd(Number(value))}
          />
          <Bar dataKey="custo_por_1k_tokens" name="Custo / 1k tokens" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
