export interface AiUsageLog {
  id: number;
  workflow_id: string;
  workflow_name: string;
  execution_id: string;
  node_name: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  success: boolean;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AiModelPricing {
  model: string;
  input_price_per_1m: number;
  output_price_per_1m: number;
  updated_at: string;
}

export interface Metrics {
  totalCost: number;
  totalCalls: number;
  successRate: number;
  totalTokens: number;
  avgCostPerCall: number;
  activeWorkflows: number;
}

export interface CostByDayPoint {
  date: string;
  [workflow: string]: number | string;
}

export interface TokensByModelPoint {
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface SuccessRatePoint {
  name: string;
  value: number;
}

export interface CostByWorkflowPoint {
  workflow_name: string;
  custo_total: number;
}

export interface AvgCostByWorkflowPoint {
  workflow_name: string;
  custo_medio_execucao: number;
  total_execucoes: number;
}

export interface CostPer1kTokensPoint {
  model: string;
  custo_por_1k_tokens: number;
}

export interface ErrorsByWorkflowPoint {
  workflow_name: string;
  total_erros: number;
}

export interface ErrorMessageRow {
  workflow_name: string;
  error_message: string;
  ocorrencias: number;
  ultima_ocorrencia: string;
}

export interface RunRate {
  custoAcumulado: number;
  projecao: number;
  custoMesAnterior: number;
  variacaoPct: number | null;
}

export interface WorkflowComparisonRow {
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
  tendencia7dPct: number | null;
}
