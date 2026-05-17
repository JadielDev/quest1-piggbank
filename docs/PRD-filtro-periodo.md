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

## 3. Perguntas de Borda Prioritárias

### Perguntas que ainda precisam definição

- O filtro deve rejeitar ou inverter automaticamente quando `startDate > endDate`?
- Um intervalo com `startDate == endDate` deve ser aceito como um dia completo ou rejeitado?
- Datas futuras são permitidas? Se não, como o picker deve bloquear ou alertar?
- `startDate` preenchido e `endDate` vazio: o que o dashboard deve exibir?
- O filtro deve aplicar imediatamente (com debounce) ou exigir confirmação com botão "Aplicar"?
- O reset deve voltar aos últimos 30 dias ou apenas limpar os campos?
- Se o usuário altera a URL diretamente, o componente deve re-sincronizar imediatamente?
- Como comunicar claramente um período sem transações para evitar que usuário pense em erro?
- O formato aceito no input deve ser apenas `dd/MM/yyyy` ou devemos aceitar múltiplos formatos?
- Em período que cruza DST, como garantir que transações de borda de dia não sejam excluídas?
- A persistência deve ser exclusivamente via URL ou usar fallback em localStorage/sessionStorage?
- Em mobile, o controle de período deve usar input nativo ou um popover customizado?

### Contexto

- Foram identificadas **104 perguntas de borda** no documento de edge cases.
- As principais categorias são: comportamento do filtro, validação de datas, UX, timezone, persistência, performance, sem dados, integração, mobile e acessibilidade.
- O documento completo está em **[docs/EDGE-CASES-filtro-periodo.md](EDGE-CASES-filtro-periodo.md)**.

---

## 4. Riscos Identificados

### Riscos Técnicos

- **R-TEC-001:** inconsistência entre métricas e tabela se o mesmo filtro não for aplicado em todas as camadas.
- **R-TEC-002:** intervalo invertido sem validação clara pode retornar 0 transações e confundir o usuário.
- **R-TEC-003:** timezone e bordas de dia podem excluir transações que pertencem ao período local.
- **R-TEC-004:** performance degradada em intervalos longos sem limite máximo definido.
- **R-TEC-005:** dados inválidos ou input malformado podem causar crashes no cálculo de métricas.

### Riscos de Negócio

- usuário não entende qual período está aplicado ou percebe o filtro como instável
- estado sem dados é interpretado como erro, não como ausência real de transações
- filtro não persistido via URL impede combinação e compartilhamento de análises
- ausência de presets faz a feature parecer incompleta para análise rápida
- comportamento de reset sem padrão claro reduz confiança do usuário

### Riscos Operacionais

- falta de testes em edge cases críticos do filtro de período
- ausência de feature flag para rollout gradual
- desalinhamento entre design e implementação do fluxo de validação
- documentação insuficiente do contrato de query params e formato de data
- falta de responsáveis definidos para decisões de regra

### Top 5 riscos críticos a mitigar

1. inconsistência de filtro entre métricas e tabela
2. performance em intervalos longos
3. confusão do usuário com período aplicado
4. validação de datas malformadas
5. ausência de feature flag

O documento completo de riscos está em **[docs/RISCOS-filtro-periodo.md](RISCOS-filtro-periodo.md)**.

---

## 5. Constraints que Precisam Definição Antes do Spec Doc

### Decisões-chave necessárias

- tratar intervalo invertido: erro ou inversão automática?
- aceitar intervalo de um dia (`startDate == endDate`)?
- aplicar o filtro imediatamente com debounce ou via botão de confirmação?
- reset deve retornar aos últimos 30 dias ou limpar campos?
- permitir datas futuras ou bloquear até hoje?
- definir limite máximo do intervalo (por exemplo, 12 meses)?
- aceitar apenas formato PT-BR ou suportar múltiplos formatos?
- URL como fonte de verdade ou fallback com localStorage?
- usar UTC internamente e exibir localmente para timezone?
- no mobile, usar input nativo ou popover customizado para data?

### Categorias de constraints

- comportamento do filtro
- validação de datas
- timezone e bordas de dia
- persistência e navegação
- performance e limites de intervalo
- experiência sem dados
- mobile e acessibilidade
- integração frontend/backend

O documento completo de constraints está em **[docs/CONSTRAINTS-filtro-periodo.md](CONSTRAINTS-filtro-periodo.md)**.

---

## 6. Recomendações de Próximos Passos

1. definir as 10 constraints críticas com PM, Designer e Dev
2. confirmar regras de validação e formato de data
3. validar persistência via query params
4. criar o Spec Doc técnico com base nessas decisões
5. planejar implementação com feature flag e testes automáticos

---

## 7. Artefatos da Discovery

- `docs/PRD-filtro-periodo.md` — este documento
- `docs/EDGE-CASES-filtro-periodo.md` — 104 perguntas de borda
- `docs/RISCOS-filtro-periodo.md` — 23 riscos com mitigação
- `docs/CONSTRAINTS-filtro-periodo.md` — 26 constraints a definir

---

## 8. Checklist da Discovery

- [ ] todo time leu os 4 artefatos
- [ ] constraints definidas antes do spec
- [ ] mitigações dos top 5 riscos documentadas
- [ ] reunião de kickoff agendada
- [ ] owners identificados
- [ ] prazo para Spec Doc definido

---

> 🚀 Discovery consolidada. Próximo milestone: Spec Doc técnico detalhado.
