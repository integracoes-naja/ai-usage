import { Fragment, useState } from 'react';
import { format } from 'date-fns';
import { MetricInfo } from '../common/MetricInfo';
import type { AiUsageLog } from '../../types';

interface UsageTableProps {
  rows: AiUsageLog[];
  count: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  loading: boolean;
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function ExpandedDetail({ row }: { row: AiUsageLog }) {
  return (
    <div className="font-mono text-xs text-muted">
      {row.error_message && (
        <div className="mb-2">
          <span className="text-red-600">error_message: </span>
          {row.error_message}
        </div>
      )}
      {row.metadata && <pre className="whitespace-pre-wrap">{JSON.stringify(row.metadata, null, 2)}</pre>}
    </div>
  );
}

function StatusBadge({ success }: { success: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${success ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {success ? 'Sucesso' : 'Falha'}
    </span>
  );
}

function ExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
        expanded ? 'rotate-90' : ''
      }`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <span className="skeleton-shimmer h-3 w-24 animate-shimmer rounded" />
          <span className="skeleton-shimmer h-3 w-32 animate-shimmer rounded" />
          <span className="skeleton-shimmer ml-auto h-3 w-16 animate-shimmer rounded" />
          <span className="skeleton-shimmer h-5 w-16 animate-shimmer rounded-full" />
        </div>
      ))}
    </div>
  );
}

const tableIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path strokeLinecap="round" d="M3 9h18M8 13h2M8 17h5" />
  </svg>
);

function Pagination({
  page,
  setPage,
  totalPages,
  count,
}: {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-bg/60 px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-xs sm:text-sm">
        Página {page + 1} de {totalPages} · {numberFormatter.format(count)} registros
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-ink transition-colors hover:border-naja-400 hover:text-naja-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink sm:flex-none"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
          Anterior
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-ink transition-colors hover:border-naja-400 hover:text-naja-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink sm:flex-none"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function UsageTable({ rows, count, page, setPage, pageSize, loading }: UsageTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-card shadow-panel">
      <span className="absolute inset-x-0 top-0 h-0.5 bg-naja-500" />
      <div className="flex items-center gap-2.5 border-b border-gray-100 p-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-naja-50 text-naja-600">
          {tableIcon}
        </div>
        <h3 className="text-sm font-semibold text-ink">Tabela de Detalhamento</h3>
        <MetricInfo
          whatItShows="Log bruto de cada chamada individual, com tokens, custo e status."
          howToInterpret="Use para auditoria pontual ou para investigar um erro específico apontado em outro dashboard."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-9 w-9 opacity-40">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path strokeLinecap="round" d="M3 9h18M8 13h2M8 17h5" />
          </svg>
          <p className="text-sm">Nenhum registro encontrado para os filtros selecionados</p>
        </div>
      ) : (
        <>
      {/* Tabela: telas md+ */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-bg/70 text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Workflow</th>
              <th className="px-4 py-3 font-semibold">Node</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 text-right font-semibold">Input</th>
              <th className="px-4 py-3 text-right font-semibold">Output</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Custo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isExpandable = !!row.error_message || !!row.metadata;
              const isExpanded = expandedId === row.id;

              return (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-gray-100 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''} ${
                      isExpandable ? 'cursor-pointer hover:bg-naja-50/40' : ''
                    }`}
                    onClick={() => isExpandable && setExpandedId(isExpanded ? null : row.id)}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        {isExpandable ? (
                          <ExpandChevron expanded={isExpanded} />
                        ) : (
                          <span className="inline-block w-3.5" />
                        )}
                        {format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-ink">{row.workflow_name}</td>
                    <td className="px-4 py-2 text-ink">{row.node_name}</td>
                    <td className="px-4 py-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                        {row.model}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted">
                      {numberFormatter.format(row.input_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted">
                      {numberFormatter.format(row.output_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted">
                      {numberFormatter.format(row.total_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-ink">
                      $ {row.cost_usd.toFixed(6)}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge success={row.success} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={9} className="px-4 py-3">
                        <ExpandedDetail row={row} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards: telas < md */}
      <div className="divide-y divide-gray-100 md:hidden">
        {rows.map((row) => {
          const isExpandable = !!row.error_message || !!row.metadata;
          const isExpanded = expandedId === row.id;

          return (
            <div
              key={row.id}
              className={`p-4 ${isExpandable ? 'cursor-pointer active:bg-gray-50' : ''}`}
              onClick={() => isExpandable && setExpandedId(isExpanded ? null : row.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-1.5">
                  {isExpandable && (
                    <span className="mt-1">
                      <ExpandChevron expanded={isExpanded} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{row.workflow_name}</p>
                    <p className="truncate text-xs text-muted">{row.node_name}</p>
                  </div>
                </div>
                <StatusBadge success={row.success} />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">
                  {format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')}
                </span>
                <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                  {row.model}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Input</p>
                  <p className="font-mono text-xs text-ink">{numberFormatter.format(row.input_tokens)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Output</p>
                  <p className="font-mono text-xs text-ink">{numberFormatter.format(row.output_tokens)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Total</p>
                  <p className="font-mono text-xs text-ink">{numberFormatter.format(row.total_tokens)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted">Custo</span>
                <span className="font-mono text-sm font-semibold text-ink">$ {row.cost_usd.toFixed(6)}</span>
              </div>

              {isExpanded && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <ExpandedDetail row={row} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pagination page={page} setPage={setPage} totalPages={totalPages} count={count} />
        </>
      )}
    </div>
  );
}
