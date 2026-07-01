import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';
import type { CostByDayPoint } from '../../types';

interface CostByDayChartProps {
  data: CostByDayPoint[];
}

const SERIES_COLORS = ['#f58220', '#2563eb', '#16a34a', '#9333ea', '#dc2626', '#0891b2'];

function formatUsd(value: number) {
  return `$ ${value.toFixed(4)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-7 4 4 8-9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
  </svg>
);

export function CostByDayChart({ data }: CostByDayChartProps) {
  const seriesKeys = Array.from(
    new Set(data.flatMap((point) => Object.keys(point).filter((key) => key !== 'date')))
  );

  return (
    <ChartCard
      title="Custo por Dia"
      icon={icon}
      accent="orange"
      info={{
        whatItShows: 'Soma de custo estimado (USD) de todas as chamadas de IA, agrupado por dia.',
        howToInterpret:
          'Picos indicam dias de alto volume ou execuções com prompts maiores que o normal — investigar se não corresponde a aumento real de uso.',
      }}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => `$${v}`}
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
          {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {seriesKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={2}
              fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={0.15}
              stackId={seriesKeys.length > 1 ? undefined : '1'}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
