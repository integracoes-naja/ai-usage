import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Filters } from './useFilters';
import type {
  AvgCostByWorkflowPoint,
  CostByDayPoint,
  CostByWorkflowPoint,
  CostPer1kTokensPoint,
  ErrorMessageRow,
  ErrorsByWorkflowPoint,
  SuccessRatePoint,
  TokensByModelPoint,
} from '../types';

interface ChartRow {
  created_at: string;
  cost_usd: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  success: boolean;
  workflow_name: string;
  error_message: string | null;
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

function buildCostByWorkflow(rows: ChartRow[]): CostByWorkflowPoint[] {
  const byWorkflow = new Map<string, number>();

  for (const row of rows) {
    byWorkflow.set(row.workflow_name, (byWorkflow.get(row.workflow_name) ?? 0) + row.cost_usd);
  }

  return Array.from(byWorkflow.entries())
    .map(([workflow_name, custo_total]) => ({ workflow_name, custo_total }))
    .sort((a, b) => b.custo_total - a.custo_total);
}

function buildAvgCostByWorkflow(rows: ChartRow[]): AvgCostByWorkflowPoint[] {
  const byWorkflow = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const entry = byWorkflow.get(row.workflow_name) ?? { total: 0, count: 0 };
    entry.total += row.cost_usd;
    entry.count += 1;
    byWorkflow.set(row.workflow_name, entry);
  }

  return Array.from(byWorkflow.entries())
    .map(([workflow_name, { total, count }]) => ({
      workflow_name,
      custo_medio_execucao: count > 0 ? total / count : 0,
      total_execucoes: count,
    }))
    .sort((a, b) => b.custo_medio_execucao - a.custo_medio_execucao);
}

function buildCostPer1kTokens(rows: ChartRow[]): CostPer1kTokensPoint[] {
  const byModel = new Map<string, { cost: number; tokens: number }>();

  for (const row of rows) {
    const entry = byModel.get(row.model) ?? { cost: 0, tokens: 0 };
    entry.cost += row.cost_usd;
    entry.tokens += row.total_tokens;
    byModel.set(row.model, entry);
  }

  return Array.from(byModel.entries())
    .map(([model, { cost, tokens }]) => ({
      model,
      custo_por_1k_tokens: tokens > 0 ? (cost / tokens) * 1000 : 0,
    }))
    .sort((a, b) => b.custo_por_1k_tokens - a.custo_por_1k_tokens);
}

function buildErrorsByWorkflow(failedRows: ChartRow[]): ErrorsByWorkflowPoint[] {
  const byWorkflow = new Map<string, number>();

  for (const row of failedRows) {
    byWorkflow.set(row.workflow_name, (byWorkflow.get(row.workflow_name) ?? 0) + 1);
  }

  return Array.from(byWorkflow.entries())
    .map(([workflow_name, total_erros]) => ({ workflow_name, total_erros }))
    .sort((a, b) => b.total_erros - a.total_erros);
}

function buildErrorsByMessage(failedRows: ChartRow[]): ErrorMessageRow[] {
  const byMessage = new Map<string, { workflow_name: string; count: number; lastSeen: string }>();

  for (const row of failedRows) {
    const message = (row.error_message ?? 'Erro sem mensagem').slice(0, 80);
    const key = `${row.workflow_name}::${message}`;
    const entry = byMessage.get(key) ?? { workflow_name: row.workflow_name, count: 0, lastSeen: row.created_at };
    entry.count += 1;
    if (row.created_at > entry.lastSeen) entry.lastSeen = row.created_at;
    byMessage.set(key, entry);
  }

  return Array.from(byMessage.entries())
    .map(([key, { workflow_name, count, lastSeen }]) => ({
      workflow_name,
      error_message: key.slice(workflow_name.length + 2),
      ocorrencias: count,
      ultima_ocorrencia: lastSeen,
    }))
    .sort((a, b) => b.ocorrencias - a.ocorrencias)
    .slice(0, 20);
}

export function useChartData(filters: Filters, refreshKey: number) {
  const [costByDay, setCostByDay] = useState<CostByDayPoint[]>([]);
  const [tokensByModel, setTokensByModel] = useState<TokensByModelPoint[]>([]);
  const [successRate, setSuccessRate] = useState<SuccessRatePoint[]>([]);
  const [costByWorkflow, setCostByWorkflow] = useState<CostByWorkflowPoint[]>([]);
  const [avgCostByWorkflow, setAvgCostByWorkflow] = useState<AvgCostByWorkflowPoint[]>([]);
  const [costPer1kTokens, setCostPer1kTokens] = useState<CostPer1kTokensPoint[]>([]);
  const [errorsByWorkflow, setErrorsByWorkflow] = useState<ErrorsByWorkflowPoint[]>([]);
  const [errorsByMessage, setErrorsByMessage] = useState<ErrorMessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchChartData() {
      setLoading(true);

      let query = supabase
        .from('ai_usage_log')
        .select(
          'created_at, cost_usd, model, input_tokens, output_tokens, total_tokens, success, workflow_name, error_message'
        )
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
        setCostByWorkflow([]);
        setAvgCostByWorkflow([]);
        setCostPer1kTokens([]);
        setErrorsByWorkflow([]);
        setErrorsByMessage([]);
      } else {
        const rows = (data ?? []) as ChartRow[];
        const failedRows = rows.filter((r) => !r.success);
        // Quando nenhum workflow específico está selecionado ("Todos"), separa o
        // custo por dia em uma linha por workflow; com um workflow filtrado, uma
        // linha por workflow seria redundante (só haveria uma série), então agrega.
        setCostByDay(buildCostByDay(rows, !filters.workflow));
        setTokensByModel(buildTokensByModel(rows));
        setSuccessRate(buildSuccessRate(rows));
        setCostByWorkflow(buildCostByWorkflow(rows));
        setAvgCostByWorkflow(buildAvgCostByWorkflow(rows));
        setCostPer1kTokens(buildCostPer1kTokens(rows));
        setErrorsByWorkflow(buildErrorsByWorkflow(failedRows));
        setErrorsByMessage(buildErrorsByMessage(failedRows));
      }

      setLoading(false);
    }

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [filters.startDate, filters.endDate, filters.workflow, refreshKey]);

  return {
    costByDay,
    tokensByModel,
    successRate,
    costByWorkflow,
    avgCostByWorkflow,
    costPer1kTokens,
    errorsByWorkflow,
    errorsByMessage,
    loading,
  };
}
