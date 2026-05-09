# PRD: Filtro de Período no Dashboard — Consolidado da Discovery

**Versão:** 1.0 — Consolidação de Discovery Completa
**Data:** 2026-05-09
**Status:** Discovery Completa — Pronto para Spec Doc
**Owner:** [a definir em kickoff]

---

## Introdução

Este documento consolida a **Fase 1 (Discovery)** da feature de filtro de período no dashboard financeiro piggbank.

A discovery produziu **4 artefatos detalhados**:
1. **[EDGE-CASES-filtro-periodo.md](EDGE-CASES-filtro-periodo.md)** — 104 perguntas de borda organizadas por categoria
2. **[RISCOS-filtro-periodo.md](RISCOS-filtro-periodo.md)** — 23 riscos (técnico, negócio, operacional) com mitigações
3. **[CONSTRAINTS-filtro-periodo.md](CONSTRAINTS-filtro-periodo.md)** — 26 constraints que precisam definição antes do Spec Doc
4. **Este documento (PRD)** — Resumo executivo + roadmap para Spec Doc

---

## 1. Overview

### Problema

Hoje o dashboard piggbank exibe apenas os **últimos 30 dias** de dados. PMEs precisam analisar períodos customizados (comparar meses, ver sazonalidade), mas estão restritas à visualização fixa.

### Feature Goal

Adicionar um **filtro interativo de período** (data início + data fim) que permita ao usuário:
- Selecionar **qualquer intervalo de datas** (com limites de validação)
- Ver **métricas recalculadas** para o período (faturamento, despesas, lucro, transações)
- Ver **lista de transações filtrada** dinamicamente
- **Validar entrada** para evitar dados incorretos ou performance degradada
- **Persistir o filtro** via URL para compartilhamento e navegação

### Goals Mensuráveis

- [ ] **Usabilidade:** 80% dos usuários conseguem selecionar período em < 30 segundos
- [ ] **Performance:** Recalcular métricas em < 500ms para intervalos até 12 meses
- [ ] **Confiabilidade:** 0 bugs críticos (inconsistência) em produção
- [ ] **Adoção:** 30% dos DAU usando filtro customizado na primeira semana
- [ ] **Acessibilidade:** WCAG 2.1 AA em desktop + mobile

---

## 2. Scope & Non-Scope

### In Scope (MVP)

- ✅ Componente de seleção de período (data início + data fim)
- ✅ Filtragem de `TransactionsTable` por intervalo de datas
- ✅ Reutilização de utilitários em `src/lib/date.ts`
- ✅ Cálculo de métricas via `src/lib/metrics.ts` (dados filtrados)
- ✅ Empty state para período sem transações
- ✅ Persistência via URL params (`?from=yyyy-MM-dd&to=yyyy-MM-dd`)
- ✅ Suporte desktop + mobile responsive
- ✅ Acessibilidade WCAG 2.1 AA (teclado + leitura de tela)
- ✅ Feature flag para rollout seguro

### Out of Scope (Fase 2+)

- ❌ Exportação de relatórios filtrados (Q3)
- ❌ Dashboard multi-usuário ou preferências por perfil
- ❌ Backend real (ainda mock em MVP)
- ❌ Filtros adicionais (por categoria, por tipo)
- ❌ Presets de período (mês atual, últimos 7 dias)
- ❌ Comparação de períodos (YoY, MoM)
- ❌ Agendamento de relatórios
- ❌ Sincronização entre dispositivos

---

## 3. Impactos da Feature

A feature afeta **4 pilares principais**:

1. **Dados (`src/lib/api.ts`)** — filtrar `getTransactions()`, recalcular `getMetrics()`
2. **Validação (`src/lib/date.ts`)** — regras de intervalo invertido, limite máximo
3. **Componentes de UI** — novo `DateRangeFilter`, estender `TransactionsTable` e dashboard header
4. **Estado/Navegação** — persistência via URL params, debounce 300-500ms

---

## 4. Perguntas de Borda (104 Edge Cases)

**Ver documento completo: [EDGE-CASES-filtro-periodo.md](EDGE-CASES-filtro-periodo.md)**

12 categorias:
- Comportamento do filtro (11 perguntas)
- Validação de datas (13 perguntas)
- Experiência do usuário (10 perguntas)
- Timezone (7 perguntas)
- Persistência (8 perguntas)
- Performance (7 perguntas)
- Comportamento sem dados (6 perguntas)
- Integração frontend/backend (6 perguntas)
- Mobile (7 perguntas)
- Acessibilidade (8 perguntas)
- Inconsistências de métricas (8 perguntas)
- Casos extremos (5 perguntas)

**⚠️ Crítico:** As 10 perguntas de maior prioridade devem ser respondidas antes do Spec Doc.

---

## 5. Riscos Identificados (23 Riscos)

**Ver documento completo: [RISCOS-filtro-periodo.md](RISCOS-filtro-periodo.md)**

**10 Riscos Técnicos:** Inconsistência de dados, intervalo invertido, timezone, performance, datas inválidas, sync URL, race conditions, transações inválidas, mobile, erro de API

**5 Riscos de Negócio:** Período errado, falta de presets, sem dados confunde, feature não resolve problema, falta de comunicação

**8 Riscos Operacionais:** Sem definição clara, testes insuficientes, sem feature flag, sem monitoramento, documentação fraca, design/dev desalinhados, dependências bloqueadas, sem acceptance criteria

**Top 5 Riscos Críticos a Mitigar:**
1. R-TEC-001 (Inconsistência filtro/dados)
2. R-TEC-004 (Performance degrada)
3. R-NEG-001 (Usuário confuso)
4. R-OPS-002 (Testes insuficientes)
5. R-OPS-003 (Sem feature flag)

---

## 6. Constraints que Precisam Definição (26)

**Ver documento completo: [CONSTRAINTS-filtro-periodo.md](CONSTRAINTS-filtro-periodo.md)**

4 categorias principais a decidir ANTES do Spec Doc:

- **Comportamento (4):** intervalo invertido, data igual, aplicação do filtro, limpeza
- **Validação (4):** datas futuras, datas antigas, limite máximo, formato
- **Timezone (2):** timezone storage/display, bordas de dia
- **[+ 16 mais em: Persistência, Performance, UX, Acessibilidade, Compatibilidade, Integração, Segurança]**

Cada constraint tem 2-4 opções com trade-offs documentados.

---

## 7. Recomendações de Próximos Passos

### Imediato (Esta Semana)

1. **[CRÍTICO] Validar com usuários** — Entrevistar 5-10 PMEs | PM | 3 dias
2. **[CRÍTICO] Definir 26 constraints** — Reunião decisão PM+Designer+Dev | Tech Lead | 2 dias
3. **[CRÍTICO] Mapear dependências** — Quando `src/lib/api.ts` estará pronto? | Dev Lead | 1 dia

### Fases

| Fase | Deliverable | Duração | Owner |
|------|-------------|---------|-------|
| **Spec Doc** | Documento técnico detalhado | 1 semana | Dev + Designer |
| **Design** | Mockups + prototipo interativo | 1.5 semanas | Designer |
| **Implementação** | MVP com feature flag | 3-4 semanas | Dev + QA |
| **Testing** | Testes E2E + staging | 1 semana | QA |
| **Launch** | Rollout gradual + monitoramento | 1 semana | DevOps + Dev |

**Total: ~8-9 semanas do kickoff ao launch.**

---

## 8. Artefatos da Discovery

| Artefato | Status | Responsabilidade |
|----------|--------|------------------|
| [PRD-filtro-periodo.md](PRD-filtro-periodo.md) | ✅ Completo | Resumo executivo (este doc) |
| [EDGE-CASES-filtro-periodo.md](EDGE-CASES-filtro-periodo.md) | ✅ Completo | 104 perguntas de borda |
| [RISCOS-filtro-periodo.md](RISCOS-filtro-periodo.md) | ✅ Completo | 23 riscos + mitigações |
| [CONSTRAINTS-filtro-periodo.md](CONSTRAINTS-filtro-periodo.md) | ✅ Completo | 26 constraints — Aguardando decisões |

---

## 9. Checklist de Saída da Discovery

- [ ] Todo time leu os 4 artefatos
- [ ] Constraints preenchidos com decisões (100% com ✓)
- [ ] Mitigações de Top 5 riscos documentadas
- [ ] Reunião de kickoff agendada e executada
- [ ] Owners de cada constraint identificados
- [ ] Decisões comunicadas para todo time
- [ ] Prazo para início do Spec Doc definido

---

> 🚀 **Discovery completa.** Próximo milestone: **Spec Doc técnico detalhado.**
