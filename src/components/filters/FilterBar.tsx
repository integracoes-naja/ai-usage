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
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="start-date">
          Data inicial
        </label>
        <input
          id="start-date"
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
          value={format(filters.startDate, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(new Date(e.target.value), filters.endDate)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="end-date">
          Data final
        </label>
        <input
          id="end-date"
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
          value={format(filters.endDate, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(filters.startDate, new Date(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="workflow">
          Workflow
        </label>
        <select
          id="workflow"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
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
    </div>
  );
}
