# Spec Doc: Filtro de Período no Dashboard

## Overview

**Feature:** adicionar um filtro global de período no dashboard que permite ao usuário escolher data de início e data fim para filtrar todas as métricas e transações.
**Status:** Draft
**Owner:** [dev responsável]
**Created:** 2026-05-09
**Updated:** 2026-05-09

**Link PRD:** ../PRD-filtro-periodo.md
**Link Figma:** [a definir]

## Goals

- [ ] Permitir seleção de intervalo customizado com `startDate` e `endDate` no dashboard.
- [ ] Filtrar métricas e lista de transações pelo mesmo intervalo aplicado.
- [ ] Manter comportamento previsível para intervalos inválidos, intervalos sem dados e validação de datas futuras.
- [ ] Garantir persistência do filtro via URL e experiência responsiva em desktop e mobile.

## Scope & Non-Scope

**In Scope:**

- Componente de seleção de período no dashboard.
- Atualizar `src/lib/api.ts` para filtrar `mockTransactions` por `DashboardFilters`.
- Reutilizar e estender `src/lib/date.ts` para validação e formatação de datas.
- Exibir o período aplicado no header do dashboard.
- Empty state para período sem transações.
- Persistência do filtro via URL query params (`from` / `to`).
- Suporte responsivo e acessível com teclado e leitor de tela.

**Out of Scope:**

- Exportação de relatórios filtrados.
- Filtros por categoria ou tipo de transação.
- Presets automáticos como "Últimos 7 dias".
- Comparações de período (YoY, MoM).
- Sincronização de filtro entre dispositivos.
- Integração com backend real no MVP.

## Architecture Decisions

### 1. Query params como fonte de verdade

**Decision:** usar `?from=yyyy-MM-dd&to=yyyy-MM-dd` como fonte de verdade do filtro.

**Alternatives considered:**

1. Estado local no componente — não persiste e não é compartilhável.
2. `localStorage`/`sessionStorage` — perde visibilidade e navegação.
3. ✅ Query params — mantém sincronização com refresh, compartilhamento e back/forward.

**Rationale:**

- `src/app/dashboard/page.tsx` já é um Server Component e pode derivar o filtro de `searchParams`.
- Permite que `DateRangeFilter` seja client component para interatividade, mas o valor oficial permaneça na URL.
- Simplifica links compartilháveis e navegação do usuário.

### 2. Server component + client interaction

**Decision:** manter `src/app/dashboard/page.tsx` como Server Component e criar `DateRangeFilter` como client component.

**Alternatives considered:**

1. Tornar a página inteira client — desperdiça o padrão de Server Components do projeto.
2. Fazer a seleção em um modal server-rendered — não funciona bem para `react-day-picker` interativo.
3. ✅ Client component isolado — mantém o maior escopo em servidor e adiciona apenas a UI necessária.

**Rationale:**

- Projetos Next.js com App Router favorecem Server Components por padrão.
- O filtro precisa de interatividade (`Popover`, `Calendar`, validação em tempo real).
- O componente cliente recebe `initialRange` do servidor e atualiza o URL usando `router.replace`.

### 3. Filtrar dados em `src/lib/api.ts`

**Decision:** aplicar `dateRange` em `getTransactions()` antes de chamar `computeMetrics()`.

**Alternatives considered:**

1. Filtrar somente na tabela — resulta em cards inconsistentes.
2. Calcular métricas no componente — desloca lógica de dados para a UI.
3. ✅ Filtrar no `api.ts` — mantém a camada de dados centralizada.

**Rationale:**

- `getTransactions()` atualmente ignora filtros; corrigir isso resolve a inconsistência mais importante.
- `getMetrics()` já depende de `getTransactions(filters)` e herda o subconjunto correto.
- Torna os testes mais diretos e a camada de dados mais previsível.

### 4. Data utilities centralizadas em `src/lib/date.ts`

**Decision:** manter todas as regras de período em `src/lib/date.ts` e expor validação, normalização e formatação.

**Alternatives considered:**

1. Usar helpers espalhados no dashboard — quebra o padrão de utilitários centralizados.
2. Reutilizar apenas `formatDisplayDate` — ainda deixa lógica de intervalos dispersa.
3. ✅ Centralizar em `src/lib/date.ts` — usa as funções já existentes e mantém o domínio de datas único.

**Rationale:**

- `src/lib/date.ts` já exporta `DATE_DISPLAY_FORMAT`, `DATE_URL_FORMAT`, `getDefaultDateRange`, `isValidDateRange`, `exceedsMaxRange`, `isDateInFuture`.
- O filtro precisa de parse de query params e de uma função `isInDateRange()` para filtrar transações.
- Alinha com o padrão do projeto: manipulação de datas via `date-fns` e utilitários centralizados.

### 5. Reutilização de UI existente

**Decision:** construir o filtro em cima de `src/components/ui/calendar.tsx`, `button.tsx` e `popover.tsx`.

**Alternatives considered:**

1. Implementar novo date picker do zero — aumenta tempo e risco.
2. Usar um campo de texto simples — pior experiência e mais validação manual.
3. ✅ Reutilizar o calendário existente — mantém consistência visual e reduz o escopo.

**Rationale:**

- O calendar component já existe e é compatível com `react-day-picker`.
- A interface do app usa shadcn/ui e componentes base já prontos.
- Reduz a necessidade de criar novos padrões de design.

## API Contract

```
Internal contract:
- getTransactions(filters: DashboardFilters): Promise<Transaction[]>
- getMetrics(filters: DashboardFilters): Promise<MetricSummary[]>

Frontend route:
GET /dashboard?from=yyyy-MM-dd&to=yyyy-MM-dd

Query params:
- from: string — data no formato yyyy-MM-dd
- to: string — data no formato yyyy-MM-dd

Response (200):
{
  "metrics": [
    { "label": "Faturamento", "value": 0, "currency": true },
    { "label": "Despesas", "value": 0, "currency": true },
    { "label": "Lucro Líquido", "value": 0, "currency": true },
    { "label": "Transações", "value": 0, "currency": false }
  ],
  "transactions": [
    { "id": "", "description": "", "amount": 0, "type": "income", "date": "2026-05-01T00:00:00.000Z", "category": "" }
  ],
  "appliedFilter": {
    "from": "2026-05-01",
    "to": "2026-05-31"
  }
}

Errors:
- 400: intervalo inválido, formato incorreto ou datas futuras
- 422: intervalo maior que 12 meses
- 500: erro interno
```

## Database Schema

```sql
-- Não aplicável no momento: os dados são mockados em src/data/mock.ts.
-- Em backend real, filtrar por campo date indexado e usar parâmetros `from` / `to`.
```

## UI/UX

**Telas afetadas:**

- Dashboard principal (`src/app/dashboard/page.tsx`)

**Componentes novos:**

- `DateRangeFilter` — client component para seleção de intervalo e validação.
- `DateRangeBadge` — exibe o período atual no cabeçalho (pode ser integrado ao `DateRangeFilter`).

**Componentes reutilizados:**

- `src/components/ui/calendar.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/popover.tsx`
- `src/components/dashboard/TransactionsTable.tsx`
- `src/components/dashboard/MetricsCard.tsx`

**Client/Server boundary:**

- `src/app/dashboard/page.tsx` permanece Server Component.
- `DateRangeFilter` é o único novo client component.
- O filtro deve atualizar a URL usando `router.replace` com `searchParams` e disparar recarga do page.

**Estados:**

- Loading: skeleton ou loading indicator durante atualização de filtro.
- Empty: mensagem atual de `TransactionsTable` quando não há transações.
- Error: validação inline para intervalo inválido, datas futuras ou intervalo > 12 meses.
- Success: cards e tabela atualizados com dados filtrados.

## Test Strategy

**Unitários:**

- [ ] `src/lib/date.ts` — validar parse de query params, intervalos válidos, invalid range, datas futuras, intervalo de 12 meses e `startDate == endDate`.
- [ ] `src/lib/api.ts` — garantir que `mockTransactions` é filtrado por `dateRange`.
- [ ] `src/lib/metrics.ts` — calcular métricas a partir de transações filtradas e retornar zeros quando vazio.
- [ ] `src/components/dashboard/DateRangeFilter.tsx` — exibir datas iniciais, validar o range e atualizar a URL.

**Integração:**

- [ ] `src/app/dashboard/page.tsx` carrega dados com o mesmo `dateRange` para cards e tabela.
- [ ] Filtro via URL persiste após reload.
- [ ] Empty state aparece em períodos sem transações.
- [ ] Invalid query params não quebram a página; fallback para `getDefaultDateRange()`.

**E2E:**

- [ ] Usuário escolhe intervalo válido e vê métricas + transações atualizadas.
- [ ] Filtro persiste após refresh da página.
- [ ] Seleção inválida mostra erro e não altera dados.
- [ ] Período de um dia (`startDate == endDate`) funciona como intervalo inclusivo.

**Edge cases:**

- [ ] `startDate > endDate`
- [ ] `startDate == endDate`
- [ ] intervalo maior que 12 meses
- [ ] datas futuras não permitidas
- [ ] período sem transações
- [ ] URL mal formada ou com parâmetros ausentes

## Delivery Checklist

**Código:**

- [ ] `src/app/dashboard/page.tsx` — resolve query params, aplica fallback para `getDefaultDateRange()`, e carrega `getMetrics` e `getTransactions` com o mesmo `DashboardFilters`.
- [ ] `src/lib/api.ts` — filtra `mockTransactions` por `dateRange` e passa transações corretas para `computeMetrics()`.
- [ ] `src/lib/date.ts` — expõe validação e formatação de data, incluindo parse de URL e `isInDateRange()`.
- [ ] `src/components/dashboard/DateRangeFilter.tsx` — UI baseada em `Calendar`, `Popover` e `Button`, com validação inline.
- [ ] `src/components/dashboard/TransactionsTable.tsx` — usa empty state existente e não precisa de mudanças estruturais significativas.
- [ ] `src/components/dashboard/MetricsCard.tsx` — exibe valores zerados corretamente quando não há transações.

**Validações (sensors):**

- [ ] Linter passa sem erros.
- [ ] Build/compilação sem erros.
- [ ] Testes existentes continuam passando.
- [ ] Testes novos verdes.

**Testes novos (escritos pelo QA):**

- [ ] Intervalo válido exibe métricas e transações corretas.
- [ ] Intervalo inválido mostra erro sem aplicar filtro.
- [ ] Intervalo sem transações mostra empty state.

## Rollout Plan

- [ ] Feature flag criada e desabilitada.
- [ ] Deploy em staging e validação manual do filtro.
- [ ] Rollout gradual em produção.
- [ ] Monitoramento ativo durante rollout.
- [ ] Critério de rollback definido.

## Risks & Mitigations

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Inconsistência entre métricas e tabela | Média | Alto | usar o mesmo `dateRange` para `getMetrics` e `getTransactions` |
| Filtro inválido ou intervalo invertido | Média | Médio | validar no domínio e não aplicar antes de corrigir |
| Performance em intervalos longos | Média | Alto | limitar a 12 meses e aplicar debounce no UI |
| Datas futuras sem tratamento | Baixa | Médio | bloquear datas futuras no picker e exibir mensagem |
| URL mal formada | Baixa | Médio | fallback para `getDefaultDateRange()` e manter a página íntegra |

## Dependencies

- `src/lib/date.ts` — regras de data, validação e formatos.
- `src/lib/api.ts` — fonte única de dados filtrados.
- `src/lib/metrics.ts` — cálculo de métricas a partir de transações.
- `src/components/ui/calendar.tsx` — date picker reutilizado.
- `src/components/ui/button.tsx` — botões padrão do design system.
- `src/components/ui/popover.tsx` — container de calendário.
- `src/data/mock.ts` — fonte de dados atual.
- `src/types/index.ts` — `DateRange`, `DashboardFilters`, `Transaction`, `MetricSummary`.

## Checklist de aprovação

- [ ] Goals claros e mensuráveis.
- [ ] Scope definido (in/out).
- [ ] Architecture decisions documentadas com trade-offs.
- [ ] API contract definido.
- [ ] Test strategy cobre caminho feliz + edge cases.
- [ ] Rollout plan com feature flag.
- [ ] Riscos identificados com mitigação.
''', encoding='utf-8')"