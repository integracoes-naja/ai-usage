import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Filters } from './useFilters';
import type { CostByDayPoint, SuccessRatePoint, TokensByModelPoint } from '../types';

interface ChartRow {
  created_at: string;
  cost_usd: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  success: boolean;
  workflow_name: string;
}

function buildCostByDay(rows: ChartRow[], splitByWorkflow: boolean): CostByDayPoint[] {
  const byDay = new Map<string, CostByDayPoint>();

  for (const row of rows) {
    const day = format(new Date(row.created_at), 'dd/MM');
    const point = byDay.get(day) ?? { date: day };

    if (splitByWorkflow) {
      point[row.workflow_name] = ((point[row.workflow_name] as number) ?? 0) + row.cost_usd;
    } else {
      point.total = ((point.total as number) ?? 0) + row.cost_usd;
    }

    byDay.set(day, point);
  }

  return Array.from(byDay.values());
}

function buildTokensByModel(rows: ChartRow[]): TokensByModelPoint[] {
  const byModel = new Map<string, TokensByModelPoint>();

  for (const row of rows) {
    const point = byModel.get(row.model) ?? {
      model: row.model,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
    };

    point.input_tokens += row.input_tokens;
    point.output_tokens += row.output_tokens;
    point.total_tokens += row.total_tokens;

    byModel.set(row.model, point);
  }

  return Array.from(byModel.values()).sort((a, b) => b.total_tokens - a.total_tokens);
}

function buildSuccessRate(rows: ChartRow[]): SuccessRatePoint[] {
  const success = rows.filter((r) => r.success).length;
  const failure = rows.length - success;

  return [
    { name: 'Sucesso', value: success },
    { name: 'Falha', value: failure },
  ];
}

export function useChartData(filters: Filters, refreshKey: number) {
  const [costByDay, setCostByDay] = useState<CostByDayPoint[]>([]);
  const [tokensByModel, setTokensByModel] = useState<TokensByModelPoint[]>([]);
  const [successRate, setSuccessRate] = useState<SuccessRatePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchChartData() {
      setLoading(true);

      let query = supabase
        .from('ai_usage_log')
        .select('created_at, cost_usd, model, input_tokens, output_tokens, total_tokens, success, workflow_name')
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString());

      if (filters.workflow) {
        query = query.eq('workflow_name', filters.workflow);
      }

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
        setCostByDay([]);
        setTokensByModel([]);
        setSuccessRate([]);
      } else {
        const rows = (data ?? []) as ChartRow[];
        // Quando nenhum workflow específico está selecionado ("Todos"), separa o
        // custo por dia em uma linha por workflow; com um workflow filtrado, uma
        // linha por workflow seria redundante (só haveria uma série), então agrega.
        setCostByDay(buildCostByDay(rows, !filters.workflow));
        setTokensByModel(buildTokensByModel(rows));
        setSuccessRate(buildSuccessRate(rows));
      }

      setLoading(false);
    }

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [filters.startDate, filters.endDate, filters.workflow, refreshKey]);

  return { costByDay, tokensByModel, successRate, loading };
}
