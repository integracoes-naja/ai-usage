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
