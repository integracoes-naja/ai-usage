import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { ChartCard } from './ChartCard';
import type { ErrorMessageRow, ErrorsByWorkflowPoint } from '../../types';

interface ErrorParetoChartProps {
  errorsByWorkflow: ErrorsByWorkflowPoint[];
  errorsByMessage: ErrorMessageRow[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

export function ErrorParetoChart({ errorsByWorkflow, errorsByMessage }: ErrorParetoChartProps) {
  return (
    <ChartCard
      title="Pareto de Erros"
      icon={icon}
      accent="blue"
      info={{
        whatItShows: 'Quantidade de falhas agrupadas por workflow e por tipo de erro.',
        howToInterpret:
          'Concentração em um único erro é sinal de causa raiz única e fácil de corrigir — priorize por volume, não por variedade.',
      }}
      isEmpty={errorsByWorkflow.length === 0}
      emptyMessage="Nenhuma falha registrada para o período selecionado"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={errorsByWorkflow}>
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
            allowDecimals={false}
            tickFormatter={(v) => numberFormatter.format(v)}
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
            formatter={(value) => numberFormatter.format(Number(value))}
          />
          <Bar dataKey="total_erros" name="Falhas" fill="#dc2626" radius={[3, 3, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wide text-muted">
              <th className="py-2 pr-3 font-semibold">Workflow</th>
              <th className="py-2 pr-3 font-semibold">Erro</th>
              <th className="py-2 pr-3 text-right font-semibold">Ocorrências</th>
              <th className="py-2 text-right font-semibold">Última ocorrência</th>
            </tr>
          </thead>
          <tbody>
            {errorsByMessage.map((row) => (
              <tr key={`${row.workflow_name}::${row.error_message}`} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-ink">{row.workflow_name}</td>
                <td className="py-2 pr-3 font-mono text-muted">{row.error_message}</td>
                <td className="py-2 pr-3 text-right font-mono tabular-nums text-ink">
                  {numberFormatter.format(row.ocorrencias)}
                </td>
                <td className="py-2 text-right font-mono text-muted">
                  {format(new Date(row.ultima_ocorrencia), 'dd/MM/yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
