# AI Usage Dashboard — Plano de Implementação para Claude Code

## Objetivo
Dashboard web público para monitorar consumo de tokens e custo de APIs de IA registrados via n8n no Supabase. Acesso direto pela URL, sem login, sem autenticação. Leitura somente — nenhuma escrita nas tabelas de origem.

---

## Decisões de arquitetura (fechadas)

| Decisão | Escolha |
|---|---|
| Repositório | GitHub (público) |
| Deploy | Vercel (conectado ao GitHub, auto-deploy) |
| Auth | Nenhuma — URL aberta |
| Banco | Supabase (já existente) — só leitura |
| Proteção | RLS bloqueia escrita; leitura liberada para anon |
| Dados iniciais | Mês atual ao carregar |
| Filtros | Período (date range) + Workflow |

---

## Stack

- **React + Vite** (TypeScript)
- **@supabase/supabase-js** — queries diretas
- **Recharts** — gráficos
- **Tailwind CSS** — layout e espaçamento
- **date-fns** — manipulação de datas

Sem Next.js, sem SSR, sem biblioteca de estado global, sem camada de auth.

---

## Variáveis de ambiente

**`.env` (local, nunca commitar):**
```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

**`.env.example` (commitar com placeholders):**
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Vercel → Settings → Environment Variables:** configurar os valores reais aqui.
A `service_role` key do n8n nunca aparece no repositório nem no dashboard.

**`.gitignore` obrigatório:**
```
.env
.env.local
.env.*.local
```

---

## Supabase — configuração prévia (rodar antes do Claude Code)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_pricing ENABLE ROW LEVEL SECURITY;

-- Leitura liberada para anon (dashboard público sem auth)
CREATE POLICY "leitura_usage_log"
  ON ai_usage_log FOR SELECT TO anon USING (true);

CREATE POLICY "leitura_pricing"
  ON ai_model_pricing FOR SELECT TO anon USING (true);

-- Bloquear qualquer escrita via anon
CREATE POLICY "bloquear_escrita_usage"
  ON ai_usage_log FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "bloquear_escrita_pricing"
  ON ai_model_pricing FOR INSERT TO anon WITH CHECK (false);
```

> O n8n usa `service_role` key — bypassa RLS por definição. Sem impacto para ele.

---

## Schema de referência (read-only)

```sql
ai_usage_log (
  id              bigint PK,
  workflow_id     text,
  workflow_name   text,
  execution_id    text,
  node_name       text,
  model           text,
  input_tokens    integer,
  output_tokens   integer,
  total_tokens    integer,  -- gerado: input + output
  cost_usd        numeric(12,6),
  success         boolean,
  error_message   text,
  metadata        jsonb,
  created_at      timestamptz
)

ai_model_pricing (
  model                text PK,
  input_price_per_1m   numeric(10,4),
  output_price_per_1m  numeric(10,4),
  updated_at           timestamptz
)
```

---

## Estrutura de arquivos

```
ai-usage-dashboard/
├── CLAUDE.md
├── .env                        ← não commitar
├── .env.example                ← commitar
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx                 ← estado global dos filtros
    ├── lib/
    │   └── supabase.ts         ← client singleton
    ├── hooks/
    │   ├── useFilters.ts       ← estado e helpers de filtro
    │   ├── useMetrics.ts       ← KPIs agregados
    │   ├── useChartData.ts     ← dados para gráficos
    │   └── useUsageLog.ts      ← tabela paginada
    ├── components/
    │   ├── layout/
    │   │   └── Header.tsx
    │   ├── filters/
    │   │   └── FilterBar.tsx   ← date range + workflow
    │   ├── cards/
    │   │   ├── KpiCard.tsx
    │   │   └── KpiGrid.tsx
    │   ├── charts/
    │   │   ├── CostByDayChart.tsx
    │   │   ├── TokensByModelChart.tsx
    │   │   └── SuccessRateChart.tsx
    │   └── table/
    │       └── UsageTable.tsx
    └── types/
        └── index.ts
```

---

## Filtros — comportamento

### Estado inicial ao carregar a página
```typescript
// Primeiro dia do mês atual até hoje
const start = startOfMonth(new Date());  // date-fns
const end   = new Date();
```

### Filtros disponíveis
| Filtro | Tipo | Comportamento |
|---|---|---|
| **Período** | Date range (data inicial + data final) | Aplicado em todos os hooks via `created_at` |
| **Workflow** | Select único ou "Todos" | Lista populada com `DISTINCT workflow_name` da tabela |

Sem filtro de modelo na UI — modelo aparece nos gráficos como dimensão, não como filtro.
Filtros combinados com AND.

### `useFilters.ts`
```typescript
export interface Filters {
  startDate: Date;
  endDate: Date;
  workflow: string | null;  // null = todos
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    workflow: null,
  });

  const setDateRange = (start: Date, end: Date) =>
    setFilters(f => ({ ...f, startDate: start, endDate: end }));

  const setWorkflow = (workflow: string | null) =>
    setFilters(f => ({ ...f, workflow }));

  return { filters, setDateRange, setWorkflow };
}
```

---

## KPI Cards

| Card | Cálculo |
|---|---|
| Custo Total | `SUM(cost_usd)` |
| Total de Chamadas | `COUNT(*)` |
| Taxa de Sucesso | `COUNT(success=true) / COUNT(*)` % |
| Tokens Consumidos | `SUM(total_tokens)` |
| Custo Médio / Chamada | `SUM(cost_usd) / COUNT(*)` |
| Workflows Ativos | `COUNT(DISTINCT workflow_name)` |

**Uma única query** traz `cost_usd, total_tokens, success` — agregação feita no client.
Não disparar uma query por card.

---

## Gráficos

### CostByDayChart — AreaChart (Recharts)
- Eixo X: dia formatado (`dd/MM`)
- Eixo Y: custo em USD (4 casas decimais no tooltip)
- Agrupar por dia client-side com `date-fns`
- Separar por workflow se filtro de workflow estiver ativo (uma linha por workflow)

### TokensByModelChart — BarChart agrupado
- Barras: `input_tokens` vs `output_tokens` por modelo
- Ordenar por `total_tokens DESC`
- Tooltip mostra os dois valores + total

### SuccessRateChart — PieChart
- Sucesso vs Falha
- Label com percentual + contagem absoluta
- Verde para sucesso, vermelho para falha

---

## UsageTable

Colunas:
| Campo | Formatação |
|---|---|
| `created_at` | `dd/MM/yyyy HH:mm` |
| `workflow_name` | texto |
| `node_name` | texto |
| `model` | badge com nome do modelo |
| `input_tokens` | número formatado |
| `output_tokens` | número formatado |
| `total_tokens` | número formatado |
| `cost_usd` | `$ 0.000000` (6 casas) |
| `success` | badge verde/vermelho |

- Paginação server-side: 50 registros por página via `.range()`
- Ordenação padrão: `created_at DESC`
- Linha clicável para expandir `error_message` e `metadata` (só quando existirem)

```typescript
const { data, count } = await supabase
  .from('ai_usage_log')
  .select('*', { count: 'exact' })
  .gte('created_at', filters.startDate.toISOString())
  .lte('created_at', filters.endDate.toISOString())
  .order('created_at', { ascending: false })
  .range(page * 50, (page + 1) * 50 - 1);
```

---

## `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Design / UI

**Tema:** light mode, visual moderno e corporativo (identidade Naja Soluções). Fundo `#f4f5f7`, cards `#ffffff` com borda `#e5e7eb` e leve `shadow-sm`.
**Cores de destaque:** laranja Naja `#f58220` (extraído da logo, escala `naja-*` no Tailwind) e azul (`blue-*` padrão do Tailwind, ex. `blue-600` `#2563eb`) intercalados em ícones de KPI, séries de gráfico e botões/badges. Verde/vermelho permanecem reservados para o semântico sucesso/falha.
**Título e marca:** "Naja Soluções | IA Usage" no Header, com a logo (`public/logo-naja.png`) em um container arredondado `bg-naja-50`.
**Tipografia:** `IBM Plex Mono` para números (Google Fonts), `Sora` para texto geral.
**KPI cards:** número em destaque, rótulo abaixo, ícone contextual (alternando acento laranja/azul).
**Responsividade:** 1280px+. Mobile não é prioridade — uso interno em desktop.
**Polling:** atualização automática a cada 60s. Timestamp "Atualizado às HH:mm:ss" no Header com botão de refresh manual.

---

## Ordem de implementação

1. `npm create vite@latest ai-usage-dashboard -- --template react-ts`
2. Instalar dependências: `@supabase/supabase-js recharts date-fns`
3. Configurar Tailwind CSS
4. Criar `.env`, `.env.example`, `.gitignore`
5. `src/lib/supabase.ts`
6. `src/types/index.ts`
7. `src/hooks/useFilters.ts`
8. `src/hooks/useMetrics.ts`
9. `src/hooks/useChartData.ts`
10. `src/hooks/useUsageLog.ts`
11. `src/components/filters/FilterBar.tsx` — date range + select de workflow
12. `src/components/cards/KpiCard.tsx` + `KpiGrid.tsx`
13. `src/components/charts/` — três gráficos
14. `src/components/table/UsageTable.tsx`
15. `src/components/layout/Header.tsx` — título + timestamp + refresh
16. `src/App.tsx` — monta tudo, passa filtros como props
17. Polling: `setInterval` no `useEffect` do `App.tsx`, `clearInterval` no cleanup
18. Polish: cores, tipografia, formatação de números

---

## O que NÃO fazer

- Não implementar nenhuma camada de autenticação ou login
- Não usar `select *` nas queries de KPI — só as colunas necessárias
- Não criar tabelas, views ou functions no Supabase
- Não commitar `.env` com valores reais
- Não expor `service_role` key em nenhum arquivo do projeto
- Não usar Redux, Zustand ou Context API — props drilling é suficiente
- Não disparar query por KPI card — uma query agrega tudo

---

## Critérios de aceitação

- [ ] Página carrega com dados do mês atual sem nenhuma interação do usuário
- [ ] Filtro de período atualiza todos os KPIs, gráficos e tabela simultaneamente
- [ ] Filtro de workflow atualiza todos os KPIs, gráficos e tabela simultaneamente
- [ ] KPIs batem com `SELECT SUM(cost_usd), COUNT(*) FROM ai_usage_log WHERE created_at BETWEEN x AND y` no Supabase SQL editor
- [ ] `cost_usd` exibido com 6 casas decimais (0.000012 não vira 0.00)
- [ ] Paginação sem duplicatas ou registros pulados
- [ ] Polling de 60s limpa o intervalo no unmount (sem memory leak)
- [ ] `vite build` sem erros de TypeScript
- [ ] `grep -r "service_role" dist/` retorna vazio
