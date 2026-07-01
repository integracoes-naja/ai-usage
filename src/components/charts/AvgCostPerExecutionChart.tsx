import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { ChartCard } from './ChartCard';
import type { AvgCostByWorkflowPoint } from '../../types';

interface AvgCostPerExecutionChartProps {
  data: AvgCostByWorkflowPoint[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatUsd(value: number) {
  return `$ ${value.toFixed(6)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload as AvgCostByWorkflowPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-card p-3 text-sm shadow-panel-hover">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      <p className="text-muted">Custo médio: {formatUsd(point.custo_medio_execucao)}</p>
      <p className="text-muted">Execuções: {numberFormatter.format(point.total_execucoes)}</p>
    </div>
  );
}

export function AvgCostPerExecutionChart({ data }: AvgCostPerExecutionChartProps) {
  return (
    <ChartCard
      title="Custo Médio por Execução"
      icon={icon}
      accent="orange"
      info={{
        whatItShows: 'Custo médio de uma única execução, por workflow.',
        howToInterpret:
          'Valor alto mesmo com poucas execuções indica prompt ineficiente ou modelo superdimensionado para a tarefa — não é sobre volume, é sobre desperdício por chamada.',
      }}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis
            dataKey="workflow_name"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => `$${Number(v).toFixed(4)}`}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} />} cursor={{ fill: 'rgba(17,24,39,0.03)' }} />
          <Bar dataKey="custo_medio_execucao" name="Custo médio" fill="#f58220" radius={[3, 3, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
