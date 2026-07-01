-- View de suporte ao dashboard "Comparativo entre Fluxos".
-- Rodar manualmente no SQL editor do Supabase antes de usar o frontend.
-- A política de RLS de leitura de ai_usage_log (leitura_usage_log, ver CLAUDE.md)
-- já cobre a view: uma view sem security_invoker herda o RLS das tabelas de origem.

create or replace view v_workflow_comparison as
select
  workflow_id,
  workflow_name,
  count(*) as total_execucoes,
  sum(cost_usd) as custo_total,
  avg(cost_usd) as custo_medio_execucao,
  avg(total_tokens) as tokens_medio,
  sum(cost_usd) / nullif(sum(total_tokens), 0) * 1000 as custo_por_1k_tokens,
  round(100.0 * sum(case when success then 1 else 0 end) / count(*), 1) as taxa_sucesso,
  array_agg(distinct model) as modelos_usados,
  max(created_at) as ultima_execucao
from ai_usage_log
where created_at >= now() - interval '30 days'
group by workflow_id, workflow_name;

-- Checklist de validação (rodar como usuário anon no SQL editor ou via client):
--   select * from v_workflow_comparison; -- deve retornar linhas
--   insert into v_workflow_comparison ...; -- deve falhar (view somada a RLS de bloqueio de escrita)
