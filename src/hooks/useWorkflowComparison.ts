import { useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { WorkflowComparisonRow } from '../types';

interface ViewRow {
  workflow_id: string;
  workflow_name: string;
  total_execucoes: number;
  custo_total: number;
  custo_medio_execucao: number;
  tokens_medio: number;
  custo_por_1k_tokens: number;
  taxa_sucesso: number;
  modelos_usados: string[];
  ultima_execucao: string;
}

function sumCostByWorkflow(rows: { workflow_name: string; cost_usd: number }[]) {
  const byWorkflow = new Map<string, number>();
  for (const row of rows) {
    byWorkflow.set(row.workflow_name, (byWorkflow.get(row.workflow_name) ?? 0) + row.cost_usd);
  }
  return byWorkflow;
}

export function useWorkflowComparison(refreshKey: number) {
  const [rows, setRows] = useState<WorkflowComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchComparison() {
      setLoading(true);
      setError(false);

      const now = new Date();
      const last7Start = subDays(now, 7);
      const prev7Start = subDays(now, 14);

      const [viewResult, last7Result, prev7Result] = await Promise.all([
        supabase.from('v_workflow_comparison').select('*'),
        supabase
          .from('ai_usage_log')
          .select('workflow_name, cost_usd')
          .gte('created_at', last7Start.toISOString())
          .lte('created_at', now.toISOString()),
        supabase
          .from('ai_usage_log')
          .select('workflow_name, cost_usd')
          .gte('created_at', prev7Start.toISOString())
          .lt('created_at', last7Start.toISOString()),
      ]);

      if (cancelled) return;

      if (viewResult.error || last7Result.error || prev7Result.error) {
        console.error(
          'Erro ao buscar comparativo entre fluxos:',
          viewResult.error ?? last7Result.error ?? prev7Result.error
        );
        setRows([]);
        setError(true);
        setLoading(false);
        return;
      }

      const last7ByWorkflow = sumCostByWorkflow(last7Result.data ?? []);
      const prev7ByWorkflow = sumCostByWorkflow(prev7Result.data ?? []);

      const comparison: WorkflowComparisonRow[] = ((viewResult.data ?? []) as ViewRow[]).map((row) => {
        const last7 = last7ByWorkflow.get(row.workflow_name) ?? 0;
        const prev7 = prev7ByWorkflow.get(row.workflow_name) ?? 0;
        const tendencia7dPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : null;

        return { ...row, tendencia7dPct };
      });

      comparison.sort((a, b) => b.custo_total - a.custo_total);

      setRows(comparison);
      setLoading(false);
    }

    fetchComparison();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { rows, loading, error };
}
