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

export function UsageTable({ rows, count, page, setPage, pageSize, loading }: UsageTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
      <div className="overflow-x-auto">
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
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => {
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
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            row.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {row.success ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td colSpan={9} className="px-4 py-3 font-mono text-xs text-muted">
                          {row.error_message && (
                            <div className="mb-2">
                              <span className="text-red-600">error_message: </span>
                              {row.error_message}
                            </div>
                          )}
                          {row.metadata && (
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(row.metadata, null, 2)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-muted">
        <span>
          Página {page + 1} de {totalPages} · {numberFormatter.format(count)} registros
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1 text-ink transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1 text-ink transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-ink"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
