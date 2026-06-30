import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Filters } from './useFilters';
import type { Metrics } from '../types';

function computeMetrics(
  rows: { cost_usd: number; total_tokens: number; success: boolean; workflow_name: string }[]
): Metrics {
  const totalCalls = rows.length;
  const totalCost = rows.reduce((sum, r) => sum + r.cost_usd, 0);
  const totalTokens = rows.reduce((sum, r) => sum + r.total_tokens, 0);
  const successCount = rows.filter((r) => r.success).length;
  const activeWorkflows = new Set(rows.map((r) => r.workflow_name)).size;

  return {
    totalCost,
    totalCalls,
    successRate: totalCalls > 0 ? (successCount / totalCalls) * 100 : 0,
    totalTokens,
    avgCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
    activeWorkflows,
  };
}

export function useMetrics(filters: Filters, refreshKey: number) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      setLoading(true);

      let query = supabase
        .from('ai_usage_log')
        .select('cost_usd, total_tokens, success, workflow_name')
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString());

      if (filters.workflow) {
        query = query.eq('workflow_name', filters.workflow);
      }

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        console.error('Erro ao buscar métricas:', error);
        setMetrics(null);
      } else {
        setMetrics(computeMetrics(data ?? []));
      }

      setLoading(false);
    }

    fetchMetrics();

    return () => {
      cancelled = true;
    };
  }, [filters.startDate, filters.endDate, filters.workflow, refreshKey]);

  return { metrics, loading };
}
