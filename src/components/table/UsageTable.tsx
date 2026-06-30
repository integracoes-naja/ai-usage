import { Fragment, useState } from 'react';
import { format } from 'date-fns';
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
      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
        success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {success ? 'Sucesso' : 'Falha'}
    </span>
  );
}

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
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        Página {page + 1} de {totalPages} · {numberFormatter.format(count)} registros
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-ink transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink sm:flex-none"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-ink transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink sm:flex-none"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export function UsageTable({ rows, count, page, setPage, pageSize, loading }: UsageTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-card p-6 text-center text-muted shadow-sm">
        Carregando…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-card p-6 text-center text-muted shadow-sm">
        Nenhum registro encontrado
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
      {/* Tabela: telas md+ */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Workflow</th>
              <th className="px-4 py-3 font-medium">Node</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 text-right font-medium">Input</th>
              <th className="px-4 py-3 text-right font-medium">Output</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Custo</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpandable = !!row.error_message || !!row.metadata;
              const isExpanded = expandedId === row.id;

              return (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-gray-100 ${isExpandable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => isExpandable && setExpandedId(isExpanded ? null : row.id)}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-muted">
                      {format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-2 text-ink">{row.workflow_name}</td>
                    <td className="px-4 py-2 text-ink">{row.node_name}</td>
                    <td className="px-4 py-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                        {row.model}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted">
                      {numberFormatter.format(row.input_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted">
                      {numberFormatter.format(row.output_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted">
                      {numberFormatter.format(row.total_tokens)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-ink">
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
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{row.workflow_name}</p>
                  <p className="truncate text-xs text-muted">{row.node_name}</p>
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
    </div>
  );
}
