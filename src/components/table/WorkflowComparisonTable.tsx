import { ChartCard } from '../charts/ChartCard';
import type { WorkflowComparisonRow } from '../../types';

interface WorkflowComparisonTableProps {
  rows: WorkflowComparisonRow[];
  loading: boolean;
  error: boolean;
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatUsd(value: number) {
  return `$ ${value.toFixed(6)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path strokeLinecap="round" d="M3 10h18M9 4v16" />
  </svg>
);

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isUp = pct >= 0;

  return (
    <span
      className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        isUp ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {isUp ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function WorkflowComparisonTable({ rows, loading, error }: WorkflowComparisonTableProps) {
  return (
    <ChartCard
      title="Comparativo entre Fluxos"
      icon={icon}
      accent="blue"
      info={{
        whatItShows: 'Todas as métricas principais lado a lado, por workflow, no mesmo período.',
        howToInterpret:
          'Cruze taxa de sucesso baixa com custo médio alto no mesmo workflow — esse é o padrão que indica candidato prioritário a revisão técnica.',
      }}
      isEmpty={!loading && rows.length === 0}
      emptyMessage={
        error
          ? 'Não foi possível carregar o comparativo — verifique se a view v_workflow_comparison existe no Supabase'
          : 'Sem dados para os últimos 30 dias'
      }
    >
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="skeleton-shimmer block h-5 w-full animate-shimmer rounded" aria-hidden="true" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-semibold">Métrica</th>
                {rows.map((r) => (
                  <th key={r.workflow_id} className="py-2 pr-3 text-right font-semibold">
                    {r.workflow_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Custo total</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="whitespace-nowrap py-2 pr-3 text-right font-mono tabular-nums text-ink">
                    {formatUsd(r.custo_total)}
                    <TrendBadge pct={r.tendencia7dPct} />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Custo médio/execução</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono tabular-nums text-muted">
                    {formatUsd(r.custo_medio_execucao)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Execuções</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono tabular-nums text-muted">
                    {numberFormatter.format(r.total_execucoes)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Taxa de sucesso</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono tabular-nums text-muted">
                    {r.taxa_sucesso.toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Tokens médios/execução</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono tabular-nums text-muted">
                    {numberFormatter.format(Math.round(r.tokens_medio))}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-ink">Custo por 1k tokens</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono tabular-nums text-muted">
                    {formatUsd(r.custo_por_1k_tokens)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-ink">Modelo(s) usado(s)</td>
                {rows.map((r) => (
                  <td key={r.workflow_id} className="py-2 pr-3 text-right font-mono text-muted">
                    {r.modelos_usados.join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
