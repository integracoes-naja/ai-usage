import { KpiCard } from './KpiCard';
import type { Metrics } from '../../types';

interface KpiGridProps {
  metrics: Metrics | null;
  loading: boolean;
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatUsd(value: number) {
  return `$ ${value.toFixed(6)}`;
}

const icons = {
  cost: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  calls: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v12H7l-3 3z" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  ),
  tokens: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  ),
  avgCost: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7v6h-6" />
    </svg>
  ),
  workflows: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

export function KpiGrid({ metrics, loading }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Custo Total"
        value={metrics ? formatUsd(metrics.totalCost) : '—'}
        icon={icons.cost}
        loading={loading}
        accent="orange"
      />
      <KpiCard
        label="Total de Chamadas"
        value={metrics ? numberFormatter.format(metrics.totalCalls) : '—'}
        icon={icons.calls}
        loading={loading}
        accent="blue"
      />
      <KpiCard
        label="Taxa de Sucesso"
        value={metrics ? `${metrics.successRate.toFixed(1)}%` : '—'}
        icon={icons.success}
        loading={loading}
        accent="orange"
      />
      <KpiCard
        label="Tokens Consumidos"
        value={metrics ? numberFormatter.format(metrics.totalTokens) : '—'}
        icon={icons.tokens}
        loading={loading}
        accent="blue"
      />
      <KpiCard
        label="Custo Médio / Chamada"
        value={metrics ? formatUsd(metrics.avgCostPerCall) : '—'}
        icon={icons.avgCost}
        loading={loading}
        accent="orange"
      />
      <KpiCard
        label="Workflows Ativos"
        value={metrics ? numberFormatter.format(metrics.activeWorkflows) : '—'}
        icon={icons.workflows}
        loading={loading}
        accent="blue"
      />
    </div>
  );
}
