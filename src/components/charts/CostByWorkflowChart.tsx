import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';
import type { CostByWorkflowPoint } from '../../types';

interface CostByWorkflowChartProps {
  data: CostByWorkflowPoint[];
}

function formatUsd(value: number) {
  return `$ ${value.toFixed(6)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10M4 12h16M4 18h7" />
  </svg>
);

export function CostByWorkflowChart({ data }: CostByWorkflowChartProps) {
  const chartHeight = Math.max(120, data.length * 40);

  return (
    <ChartCard
      title="Custo por Workflow"
      icon={icon}
      accent="orange"
      info={{
        whatItShows: 'Custo total (USD) de cada workflow no período selecionado.',
        howToInterpret:
          'Workflow no topo é o que mais pesa na fatura — priorize ali antes de otimizar workflows de baixo custo.',
      }}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={Math.max(280, chartHeight)}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" horizontal={false} />
          <XAxis
            type="number"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="workflow_name"
            stroke="#9ca3af"
            fontSize={12}
            width={140}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
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
          <Bar dataKey="custo_total" name="Custo total" fill="#f58220" radius={[0, 3, 3, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
