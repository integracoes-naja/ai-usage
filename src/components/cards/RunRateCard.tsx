import { ChartCard } from '../charts/ChartCard';
import type { RunRate } from '../../types';

interface RunRateCardProps {
  runRate: RunRate | null;
  loading: boolean;
}

function formatUsd(value: number) {
  return `$ ${value.toFixed(2)}`;
}

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l4-5 3 3 5-7" strokeDasharray="3 2" />
  </svg>
);

export function RunRateCard({ runRate, loading }: RunRateCardProps) {
  const isUp = runRate?.variacaoPct != null && runRate.variacaoPct >= 0;

  return (
    <ChartCard
      title="Run-rate Mensal"
      icon={icon}
      accent="blue"
      info={{
        whatItShows:
          'Custo acumulado no mês atual e projeção linear para o fechamento do mês, com base no ritmo de gasto até hoje.',
        howToInterpret:
          'Projeção é estimativa simples (não sazonal) — útil como alerta antecipado, não como previsão exata. Divergência grande do mês anterior merece investigação antes do fim do mês, não depois.',
      }}
      isEmpty={!loading && !runRate}
    >
      {loading || !runRate ? (
        <div className="flex h-[92px] items-center gap-6">
          <span className="skeleton-shimmer h-10 w-32 animate-shimmer rounded" aria-hidden="true" />
          <span className="skeleton-shimmer h-10 w-32 animate-shimmer rounded" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted">Custo até hoje</p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-ink">
              {formatUsd(runRate.custoAcumulado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Projeção fim do mês</p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-ink">{formatUsd(runRate.projecao)}</p>
          </div>
          {runRate.variacaoPct !== null && (
            <span
              className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-medium sm:self-auto ${
                isUp ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isUp ? '↑' : '↓'} {Math.abs(runRate.variacaoPct).toFixed(1)}% vs mês anterior
            </span>
          )}
        </div>
      )}
    </ChartCard>
  );
}
