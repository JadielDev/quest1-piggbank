# Spec Doc: Filtro de período no dashboard

## Overview

**Feature:** adicionar um filtro de período no dashboard do piggbank para permitir que o usuário selecione um intervalo de datas e visualize métricas e transações apenas para esse período.
**Status:** Draft
**Owner:** [dev responsável]
**Created:** 2026-05-16
**Updated:** 2026-05-16

**Link PRD:** ../PRD-filtro-periodo.md
**Link Figma:** [link do design]

## Goals

- [ ] Permitir seleção de intervalo customizado (`from` / `to`) no dashboard.
- [ ] Filtrar todas as métricas e a tabela de transações pelo mesmo período.
- [ ] Reutilizar utilitários de data e componentes UI existentes.
- [ ] Garantir comportamento previsível para intervalos inválidos, sem dados ou datas futuras.

## Scope & Non-Scope

**In Scope:**

- Componente de seleção de período no dashboard.
- Atualizar `src/lib/api.ts` para filtrar `mockTransactions` usando `DashboardFilters`.
- Reutilizar `src/lib/date.ts` para validação, formatação e parse de datas.
- Exibir o período aplicado no cabeçalho.
- Empty state para período sem transações.
- Persistência do filtro via query params `from` / `to`.
- Usar componentes UI existentes em `src/components/ui/`.
- Garantir a página principal do dashboard como Server Component e o filtro como client component.

**Out of Scope:**

- Exportação de relatórios filtrados.
- Filtros por categoria ou tipo de transação.
- Presets automáticos como "Últimos 7 dias".
- Comparações de período (YoY, MoM).
- Sincronização de filtro entre dispositivos.
- Backend real ou mudanças em schema de dados.

## Architecture Decisions

### 1. Query params como fonte de verdade

**Decision:** usar `?from=yyyy-MM-dd&to=yyyy-MM-dd` para persistir o período selecionado.

**Alternatives considered:**

1. Estado local no componente — não persiste e não é compartilhável.
2. `localStorage`/`sessionStorage` — perde visibilidade em navegações e compartilhamento.
3. ✅ Query params — mantém sincronização com refresh, compartilhamento e back/forward.

**Rationale:**

- `src/app/dashboard/page.tsx` já recebe `searchParams` e deriva o intervalo do servidor.
- Facilita o comportamento esperado para F5/back/forward.
- Ajuda na integração com testes e com deep links.

### 2. Server Component + client interaction

**Decision:** manter `src/app/dashboard/page.tsx` como Server Component e criar `DateRangeFilter` como client component.

**Alternatives considered:**

1. Tornar a página inteira client — foge ao padrão do projeto e traz mais bundle.
2. Usar só inputs de texto no servidor — perde interatividade e validação imediata.
3. ✅ Client component isolado — mantém a maior parte do dashboard no servidor e traz apenas a UI necessária.

**Rationale:**

- `DateRangeFilter` precisa de `useSearchParams`, `useRouter` e interatividade do `Calendar`.
- A página já recupera os dados via `getTransactions(filters)` no servidor.
- O filtro atualiza apenas a query string, mantendo o fluxo de renderização do Next.js.

### 3. Filtrar dados em `src/lib/api.ts`

**Decision:** aplicar `dateRange` em `getTransactions()` antes de chamar `computeMetrics()`.

**Alternatives considered:**

1. Filtrar apenas na tabela — causa inconsistência entre cards e lista.
2. Calcular métricas direto no componente — dispersa lógica de domínio para UI.
3. ✅ Filtrar no `api.ts` — centraliza o contrato de dados e evita divergência.

**Rationale:**

- `getTransactions()` já é o ponto único para leitura de mock data.
- `getMetrics()` usa `getTransactions(filters)` para derivar métricas.
- Facilita testes unitários e garante consistência entre dados e UI.

### 4. Reutilizar `src/lib/date.ts`

**Decision:** manter regra de datas e validação em `src/lib/date.ts`.

**Alternatives considered:**

1. Helpers espalhados no dashboard — aumenta risco de inconsistência.
2. Usar apenas `formatDisplayDate` — deixa lógica de intervalo dispersa.
3. ✅ Centralizar em `src/lib/date.ts` — mantém domínio de datas único.

**Rationale:**

- `src/lib/date.ts` já fornece parse, validação e formatação de datas.
- O filtro precisa das mesmas regras de `isValidDateRange`, `exceedsMaxRange` e `isDateInFuture`.
- Segue o padrão do projeto: datas via `date-fns` e utilitário central.

### API Contract

```
Frontend route:
GET /dashboard?from=yyyy-MM-dd&to=yyyy-MM-dd

Query params:
- from: string — data no formato yyyy-MM-dd
- to: string — data no formato yyyy-MM-dd

Internal contract:
- getTransactions(filters: DashboardFilters): Promise<Transaction[]>
- getMetrics(filters: DashboardFilters): Promise<MetricSummary[]>

Errors:
- 400: intervalo inválido ou formato incorreto
- 422: intervalo maior que 12 meses
- 500: erro interno
```

### Database Schema

```sql
-- Não aplicável no momento: dados são mockados em src/data/mock.ts.
-- Em backend real, aplicar filtro por campo date indexado e usar parâmetros `from` / `to`.
```

## UI/UX

**Telas afetadas:**

- Dashboard principal (`src/app/dashboard/page.tsx`)

**Componentes novos:**

- `DateRangeFilter` — client component para seleção de período e validação.
- `DateRangeBadge` — exibe o período atual no cabeçalho.

**Componentes reutilizados:**

- `src/components/ui/calendar.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/popover.tsx`
- `src/components/dashboard/TransactionsTable.tsx`
- `src/components/dashboard/MetricsCard.tsx`

**Client/Server boundary:**

- `src/app/dashboard/page.tsx` permanece como Server Component.
- `DateRangeFilter` é o único novo client component.
- O filtro atualiza a URL com `router.replace` e os dados são recarregados pelo servidor.

**Estados:**

- Loading: indicar que o dashboard está atualizando o período.
- Empty: exibir mensagem de "Nenhuma transação encontrada para o período selecionado.".
- Error: validação inline para intervalo inválido, datas futuras ou período maior que 12 meses.
- Success: exibir cards e tabela filtrados.

## Test Strategy

**Unitários:**

- [ ] `src/lib/date.ts` — parse de query params, `isValidDateRange`, `exceedsMaxRange` e `isDateInFuture`.
- [ ] `src/lib/api.ts` — `getTransactions` e `getMetrics` com filtro de `dateRange`.
- [ ] `src/lib/metrics.ts` — cálculo de faturamento, despesas, lucro e contador de transações.
- [ ] `src/components/dashboard/DateRangeFilter.tsx` — renderização do intervalo e validação de UI.

**Integração:**

- [ ] `src/app/dashboard/page.tsx` carrega dados com `dateRange` derivado de `searchParams`.
- [ ] `DateRangeFilter` atualiza a URL e o dashboard reflete o novo período.
- [ ] empty state aparece em períodos sem transações.
- [ ] query params inválidos não quebram a página.

**E2E:**

- [ ] usuário aplica filtro válido e vê cards + tabela atualizados.
- [ ] filtro via URL é persistido após reload.
- [ ] erro de intervalo inválido é mostrado e impede atualização.

**Edge cases:**

- [ ] intervalo invertido exibe mensagem de erro.
- [ ] `startDate == endDate` é aceito como um único dia.
- [ ] intervalo maior que 12 meses é bloqueado.
- [ ] datas futuras não são aceitas.

## Delivery Checklist

**Código:**

- [ ] `src/lib/date.ts` — implementar parse/format/validação.
- [ ] `src/lib/api.ts` — filtrar `mockTransactions` por `filters.dateRange`.
- [ ] `src/components/dashboard/DateRangeFilter.tsx` — seleção, validação e atualização de query params.
- [ ] `src/app/dashboard/page.tsx` — derivar `dateRange` e passar para `DashboardClient`.
- [ ] `src/components/dashboard/DashboardClient.tsx` — renderizar métricas e tabela com `initialTransactions`.

**Validações (sensors):**

- [ ] Linter passa sem erros.
- [ ] Build/compilação sem erros.
- [ ] Scan de segurança/LGPD sem achados críticos.
- [ ] Testes existentes continuam passando.

**Testes novos (escritos pelo QA):**

- [ ] filtro de período atualiza métricas e tabela.
- [ ] intervalo inválido mostra mensagem de erro.
- [ ] estado sem dados é exibido corretamente.

## Rollout Plan

- [ ] Feature flag criada e desabilitada.
- [ ] Deploy em staging + teste manual.
- [ ] Rollout gradual: 5% → 25% → 50% → 100%.
- [ ] Monitoramento ativo durante rollout.
- [ ] Critério de rollback definido.

## Risks & Mitigations

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| inconsistência entre métricas e tabela | Alta | Alto | usar o mesmo `DashboardFilters` em `getTransactions` e `getMetrics` |
| intervalo invertido | Média | Médio | validar `isValidDateRange` e mostrar erro inline |
| timezone e bordas de dia | Média | Médio | usar UTC internamente e `startOfDay` / `endOfDay` |
| performance com intervalo longo | Média | Alto | limitar intervalo a 12 meses e mostrar mensagem clara |
| input de data malformado | Baixa | Médio | usar validação rigorosa em `parseUrlDate` |

## Dependencies

- [ ] design do filtro de período e estados de erro finalizados.
- [ ] validação das regras de intervalo com PM/Designer.
- [ ] `src/components/ui/calendar.tsx`, `button.tsx`, `popover.tsx` disponíveis.
- [ ] `src/lib/api.ts` e `src/lib/date.ts` prontos para reutilização.

## Checklist de aprovação

- [ ] Goals claros e mensuráveis.
- [ ] Scope definido (in/out).
- [ ] Architecture decisions documentadas com trade-offs.
- [ ] API contract definido.
- [ ] Test strategy cobre caminho feliz + edge cases.
- [ ] Rollout plan com feature flag.
- [ ] Riscos identificados com mitigação.
