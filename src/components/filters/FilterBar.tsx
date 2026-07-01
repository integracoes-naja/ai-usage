import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Filters } from '../../hooks/useFilters';

interface FilterBarProps {
  filters: Filters;
  setDateRange: (start: Date, end: Date) => void;
  setWorkflow: (workflow: string | null) => void;
}

export function FilterBar({ filters, setDateRange, setWorkflow }: FilterBarProps) {
  const [workflows, setWorkflows] = useState<string[]>([]);

  useEffect(() => {
    async function fetchWorkflows() {
      const { data, error } = await supabase
        .from('ai_usage_log')
        .select('workflow_name')
        .not('workflow_name', 'is', null);

      if (error) {
        console.error('Erro ao buscar workflows:', error);
        return;
      }

      const distinct = Array.from(new Set((data ?? []).map((r) => r.workflow_name))).sort();
      setWorkflows(distinct);
    }

    fetchWorkflows();
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-card p-4 shadow-panel sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
          htmlFor="start-date"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Data inicial
        </label>
        <input
          id="start-date"
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-auto"
          value={format(filters.startDate, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(new Date(e.target.value), filters.endDate)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
          htmlFor="end-date"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Data final
        </label>
        <input
          id="end-date"
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-auto"
          value={format(filters.endDate, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(filters.startDate, new Date(e.target.value))}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 sm:flex-none">
        <label
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
          htmlFor="workflow"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
          </svg>
          Workflow
        </label>
        <select
          id="workflow"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-ink transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-auto"
          value={filters.workflow ?? ''}
          onChange={(e) => setWorkflow(e.target.value || null)}
        >
          <option value="">Todos</option>
          {workflows.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {filters.workflow && (
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Filtro ativo
        </span>
      )}
    </div>
  );
}
