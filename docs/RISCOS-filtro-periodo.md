# Riscos: Filtro de Período no Dashboard

Análise detalhada de riscos técnicos, de negócio e operacionais para a feature de filtro de período no piggbank.

---

## 1. Riscos Técnicos

### R-TEC-001: Inconsistência entre filtro e dados exibidos

**Descrição:** Os cards de métricas exibem valores baseados no filtro aplicado, mas a tabela de transações mostra algo diferente, criando confusão.

**Causa raiz:** Se `getMetrics` e `getTransactions` não usarem exatamente o mesmo `dateRange`, resultarão em dados divergentes.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Card mostra "Faturamento: R$ 10.000" mas tabela exibe transações somando R$ 9.500
- Card mostra "4 transações" mas tabela exibe 5 linhas

**Mitigação:**
- [ ] Usar `DashboardFilters` como parâmetro único para ambas as funções
- [ ] Testes de integração que verificam soma de transações = valor de faturamento
- [ ] Code review obrigatório em `src/lib/api.ts`

**Owner:** [Dev responsável]

---

### R-TEC-002: Intervalo invertido causa erro silencioso

**Descrição:** Se `startDate > endDate`, o sistema não retorna erro claro e exibe métricas zeradas ou inesperadas.

**Causa raiz:** Falta de validação antes de aplicar filtro ou validação incompleta.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Usuário digita "31/05" em "até" e "01/05" em "de"
- Sistema não valida e retorna 0 transações sem informar o motivo
- Usuário acha que não tem dados naquele período

**Mitigação:**
- [ ] Implementar `isValidDateRange()` em `src/lib/date.ts` e chamar antes de `getMetrics`/`getTransactions`
- [ ] Mostrar erro visual claro: "Data de início deve ser anterior à data de fim"
- [ ] Desabilitar botão "Aplicar" enquanto intervalo for inválido
- [ ] Teste unitário: intervalo invertido deve disparar erro

**Owner:** [Dev responsável]

---

### R-TEC-003: Timezone causa datas diferentes em diferentes contextos

**Descrição:** Transações armazenadas em UTC, mas exibidas em timezone local. Filtro aplicado em timezone local pode retornar dados inesperados.

**Causa raiz:** Conversão de timezone não ser consistente entre frontend (exibição) e backend (filtragem).

**Probabilidade:** Alta | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Usuário em São Paulo seleciona "01/05 até 31/05"
- Transações às 23:00 em São Paulo (02:00 UTC do dia seguinte) não aparecem
- Métrica do dia está com 1 dia de atraso

**Mitigação:**
- [ ] Sempre usar UTC internamente; conversão só na UI
- [ ] Documentar em `src/lib/date.ts` que `startOfDay` e `endOfDay` trabalham em UTC
- [ ] Testes que verificam inclusão/exclusão de transações nas bordas de dia em UTC
- [ ] Se houver backend real, sincronizar timezone entre frontend e API

**Owner:** [Dev responsável]

---

### R-TEC-004: Performance degrada com intervalos muito grandes

**Descrição:** Ao selecionar intervalo de 12 meses, cálculo de métricas é lento ou trava a página.

**Causa raiz:** `computeMetrics` itera sobre todas as transações sem otimização; sem índices em backend real.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Usuário seleciona 12 meses com 10.000 transações
- Dashboard fica congelado por 5+ segundos
- Modal de seleção de período fica responsivo, mas dashboard não atualiza

**Mitigação:**
- [ ] Implementar limite máximo de intervalo (`MAX_DATE_RANGE_MONTHS = 12`) com validação na UI
- [ ] Adicionar loading/skeleton enquanto dados são processados
- [ ] Testar performance com 10.000 transações mock
- [ ] Considerar Web Workers ou Server-Side Processing em versão futura
- [ ] Monitorar tempo de resposta em produção

**Owner:** [Dev responsável]

---

### R-TEC-005: Datas inválidas ou malformadas causam crashes

**Descrição:** Se um campo de data recebe valor inválido (ex: "32/13/2026"), o sistema pode crashear ou retornar erro 500.

**Causa raiz:** Falta de validação robusta de entrada; parser de data não lidar com casos extremos.

**Probabilidade:** Baixa | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Usuário cola "abc" em um campo de data
- Usuário digita "00/00/0000"
- Campo recebe `null` ou `undefined`

**Mitigação:**
- [ ] Usar Zod para validar schema de `DashboardFilters` com datas válidas
- [ ] Usar `date-fns` `parse` com flags rigorosas, nunca `new Date()`
- [ ] Try-catch em `getMetrics` e `getTransactions` com fallback
- [ ] Testes de fuzz com inputs aleatórios

**Owner:** [Dev responsável]

---

### R-TEC-006: Sem sincronização entre URL params e estado visual

**Descrição:** Se o filtro é persistido via URL, mas usuário muda manualmente, há mismatch entre URL e UI.

**Causa raiz:** URL como fonte de verdade, mas componente de seleção não sincronizar.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- URL: `?from=2026-05-01&to=2026-05-31`
- Usuário muda para `?from=2026-04-01&to=2026-04-30`
- Mas o componente visual ainda mostra os campos antigos

**Mitigação:**
- [ ] Usar Next.js `useSearchParams` hook para sincronizar estado
- [ ] Server Component com `searchParams` no início para garantir fonte única
- [ ] Testes E2E que verificam URL → UI após navegação
- [ ] Documentar que URL é fonte de verdade, não localStorage

**Owner:** [Dev responsável]

---

### R-TEC-007: Requisições concorrentes causam race condition

**Descrição:** Usuário muda filtro 3 vezes rapidamente; resposta da 2ª requisição chega depois da 3ª, exibindo dados desatualizados.

**Causa raiz:** Sem cancelamento de requisições anteriores ou sem abortController.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Usuário clica: mai → jun → jul
- Resposta de "mai" chega por último
- Dashboard exibe dados de maio, não julho

**Mitigação:**
- [ ] Usar `AbortController` para cancelar requisições antigas
- [ ] Adicionar request ID ou timestamp para ignorar respostas antigas
- [ ] Implementar debounce na mudança de filtro (300-500ms)
- [ ] Testes que simulam latência e múltiplas mudanças de filtro

**Owner:** [Dev responsável]

---

### R-TEC-008: Transações com datas inválidas corrompem métricas

**Descrição:** Se mock data ou backend contém transação com `date: null` ou data inválida, `computeMetrics` pode crashear.

**Causa raiz:** `comparar data inválida com startDate/endDate` dispara exceção.

**Probabilidade:** Baixa | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- `mockTransactions` contém `{ date: null }`
- Filter tenta comparar `null > startDate` → TypeError
- Dashboard não carrega

**Mitigação:**
- [ ] Validar schema de `Transaction` em tempo de carregamento
- [ ] Try-catch em `getMetrics` com log de erro
- [ ] Filtrar transações com data inválida antes de calcular métricas
- [ ] Testes que incluem transações com `date: null`

**Owner:** [Dev responsável]

---

### R-TEC-009: Sem suporte a mobile quebra experiência

**Descrição:** Componente de seleção de data é desktop-only; em mobile fica pequeno, inacessível ou trava.

**Causa raiz:** Usar `input[type="date"]` sem fallback ou não testar em mobile.

**Probabilidade:** Alta | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Mobile: campo de data fica com fonte pequena
- Picker nativo não funciona em browser antigo
- Teclado covers campo de data

**Mitigação:**
- [ ] Usar `input[type="date"]` nativo (suporte > 95% em mobile)
- [ ] Testar em Chrome, Safari mobile, Samsung Internet
- [ ] Implementar fallback text input com validação
- [ ] Testes responsividade em viewport mobile (375px)

**Owner:** [Dev responsável]

---

### R-TEC-010: Sem tratamento de erro de API

**Descrição:** Se backend retorna 500 ao aplicar filtro, página fica em loading infinito.

**Causa raiz:** Sem error boundary ou tratamento de erro em `getMetrics`.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Servidor retorna 500
- Dashboard fica com skeleton forever
- Usuário sem feedback de erro

**Mitigação:**
- [ ] Error boundary em torno do dashboard
- [ ] Toast com mensagem de erro se requisição falhar
- [ ] Retry automático (2-3 tentativas) ou botão "Tentar novamente"
- [ ] Fallback para últimos 30 dias se filtro falhar

**Owner:** [Dev responsável]

---

## 2. Riscos de Negócio

### R-NEG-001: Usuário seleciona período errado, toma decisão baseada em dados incorretos

**Descrição:** Intervalo é aplicado mas é invisível ou confuso; usuário pensa que vê todos os dados e toma decisão errada.

**Causa raiz:** Intervalo aplicado não é exibido de forma clara no dashboard.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Usuário seleciona maio de 2025 (ano errado) e não percebe
- Vê "Faturamento: R$ 50k" mas era janeiro
- Faz planejamento baseado em dados de ano passado

**Mitigação:**
- [ ] Exibir intervalo em badge clara no header: "📅 01/05 — 31/05/2026"
- [ ] Usar cores e ícones para destacar filtro ativo
- [ ] Onboarding/tooltip explicando significado do filtro
- [ ] Validação: avisar se usuário seleciona data > 1 ano atrás

**Owner:** [Product Manager]

---

### R-NEG-002: Falta de presets de período comum gera frustração

**Descrição:** Usuário quer ver "este mês", "últimos 7 dias", "ano anterior" mas precisa digitar datas manualmente.

**Causa raiz:** MVP não inclui presets; interface de seleção é verbosa.

**Probabilidade:** Alta | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Usuário quer "últimos 7 dias" mas precisa calcular data
- Abandona filtro e usa padrão de 30 dias
- Funcionalidade pouco usada por fricção

**Mitigação:**
- [ ] Incluir presets: "Últimos 7 dias", "Este mês", "Mês anterior"
- [ ] Considerar para fase 2, não MVP
- [ ] Coletar feedback de usuários sobre presets faltando
- [ ] UX: Botões de shortcut próximo ao seletor de data

**Owner:** [Product Manager]

---

### R-NEG-003: Período sem dados gera confusão sobre saúde financeira

**Descrição:** Usuário seleciona período sem transações; vê "R$ 0" em tudo; interpreta como "empresa faliu" quando na verdade não havia atividade.

**Causa raiz:** Métrica zerada sem contexto.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- PME com sazonalidade seleciona mês de baixa atividade
- Vê "Faturamento: R$ 0"
- Pânico; assume que não há dados

**Mitigação:**
- [ ] Mostrar empty state claro: "Nenhuma transação encontrada neste período"
- [ ] Cards de métrica exibem "-" ou "0" com nota de contexto
- [ ] Sugerir: "Selecione um período que inclua transações"
- [ ] Tooltip ou banner explicando ausência de dados

**Owner:** [Product Manager, Designer]

---

### R-NEG-004: Feature não resolve problema real do usuário

**Descrição:** Análise inicial assume que usuários querem filtrar período, mas na verdade querem filtrar por categoria ou visualizar comparação ano a ano.

**Causa raiz:** Falta de validação com usuários antes de design.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Feature é implementada mas só 10% dos usuários usam
- Usuários pedem "comparar maio 2025 vs maio 2026"
- Feature é vista como low-value

**Mitigação:**
- [ ] Entrevista com 5-10 usuários antes do MVP
- [ ] Validar em design com mockup interativo
- [ ] Manter feedback de usuários post-launch
- [ ] Métricas de adoção no primeiro mês

**Owner:** [Product Manager, Designer]

---

### R-NEG-005: Sem comunicação clara causa subutilização

**Descrição:** Usuários não percebem que a feature de filtro está disponível.

**Causa raiz:** Lançamento sem anúncio, tutorial ou destaque visual.

**Probabilidade:** Alta | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Feature é lançada mas sem changelog
- Usuários continuam vendo "últimos 30 dias"
- Feature fica invisível por semanas

**Mitigação:**
- [ ] Changelog em-app com destaque
- [ ] Email aos usuários anunciando feature
- [ ] Tutorial ou first-time UX (popover) explicando filtro
- [ ] Destaque visual na primeira semana pós-launch

**Owner:** [Product Manager, Marketer]

---

## 3. Riscos Operacionais

### R-OPS-001: Sem definição clara de requirements gera retrabalho

**Descrição:** Desenvolvimento começa sem respostas claras sobre edge cases (intervalo invertido, datas futuras, etc.); resulta em 2-3 iterações de mudança.

**Causa raiz:** PRD incompleto; descobertas durante implementação.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Dev implementa `startDate == endDate` como erro
- Designer quer permitir
- 2 dias de retrabalho
- Timeline estica

**Mitigação:**
- [ ] Preencher documento `EDGE-CASES-filtro-periodo.md` antes de design
- [ ] Aprovar respostas em reunião com Product + Design + Dev
- [ ] Documentar decisions no Spec Doc (não no PRD)
- [ ] Review gates antes de implementação

**Owner:** [Product Manager]

---

### R-OPS-002: Testes insuficientes deixam bugs em produção

**Descrição:** Feature lançada sem cobertura de testes; bugs aparecem em produção após 1-2 semanas.

**Causa raiz:** Sprint curto, prioridade em speed vs quality.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Intervalo invertido não é testado
- Usuário em produção dispara bug
- Rollback emergencial

**Mitigação:**
- [ ] Coverage mínimo 80% em `src/lib/date.ts`, `src/lib/api.ts`, componentes de filtro
- [ ] Testes de E2E cobrindo: válido, inválido, sem dados
- [ ] Teste em staging por 1 semana antes de produção
- [ ] QA checklist: validação de borda

**Owner:** [QA, Dev]

---

### R-OPS-003: Sem feature flag gera impacto imediato se bug

**Descrição:** Feature é deployada diretamente; se houver bug crítico, afeta 100% dos usuários imediatamente.

**Causa raiz:** Sem feature flag ou rollout gradual.

**Probabilidade:** Média | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- Bug critico: filtro corrompe métricas
- Todos os usuários veem dados errados
- Precisa de rollback urgente

**Mitigação:**
- [ ] Implementar feature flag (ex: `featureFlagFilterPeriod = false` por padrão)
- [ ] Habilitar para 5% de usuários, depois 25%, 100%
- [ ] Monitoramento de erros em tempo real
- [ ] Rollback plan se taxa de erro > 1%

**Owner:** [DevOps, Dev]

---

### R-OPS-004: Falta de monitoramento após launch

**Descrição:** Feature é lançada sem alertas; bug passa desapercebido por dias.

**Causa raiz:** Sem métricas de sucesso ou alertas configurados.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Taxa de erro em `getMetrics` sobe a 5% mas ninguém percebe
- 100 usuários experimentam bug
- Descoberto por acaso 3 dias depois

**Mitigação:**
- [ ] Alertar se taxa de erro de filtro > 0.5%
- [ ] Dashboard de métricas: % de usuários usando filtro
- [ ] Erro logs centralizados (Sentry/LogRocket)
- [ ] Review de logs na primeira semana pós-launch

**Owner:** [DevOps]

---

### R-OPS-005: Documentação insuficiente para futura manutenção

**Descrição:** Dev que implementou sai da empresa; código de filtro não tem documentação; próxima mudança é lenta.

**Causa raiz:** Foco em delivery, não em documentação.

**Probabilidade:** Baixa | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Dev sai em 6 meses
- Próxima dev precisa adicionar filtro por categoria
- Não sabe como o código atual funciona
- Reescreve tudo do zero

**Mitigação:**
- [ ] Documentar decisões em `ARCHITECTURE.md` ou ADR (Architecture Decision Record)
- [ ] Comentários no código para lógica não-óbvia (ex: timezone)
- [ ] Runbook de como adicionar novo filtro
- [ ] Code review com focus em compreensibilidade

**Owner:** [Dev, Tech Lead]

---

### R-OPS-006: Design e dev não alinhados gera retrabalho

**Descrição:** Designer propõe UI que dev não consegue implementar sem muito esforço; resulta em dias de debate.

**Causa raiz:** Design feito sem envolvimento de dev; dev não consultado em viabilidade.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Designer quer date picker customizado com calendar
- Dev propõe usar shadcn/ui ou input nativo
- 3 dias de debate; projeto atrasado

**Mitigação:**
- [ ] Dev presente em kick-off de design
- [ ] Design review técnico antes de finalizar spec
- [ ] Protótipo interativo testado com dev
- [ ] Trade-offs documentados (beleza vs tempo)

**Owner:** [Designer, Dev, Tech Lead]

---

### R-OPS-007: Dependências não sincronizadas atrasam launch

**Descrição:** Feature de filtro depende de mudança em `src/lib/api.ts`; aquela mudança está bloqueada; filtro não pode ser lançado.

**Causa raiz:** Sem mapeamento de dependências.

**Probabilidade:** Baixa | **Impacto:** Alto | **Severidade:** 🔴 Crítica

**Cenários:**
- PRD assume que `getTransactions` filtra por data
- Mas `src/lib/api.ts` atualmente ignora `filters`
- Mudança em api.ts é complexa, atrasa 2 sprints
- Filtro fica bloqueado

**Mitigação:**
- [ ] Mapeamento de dependências no início do projeto
- [ ] Parallelizar quando possível
- [ ] Priorizar dependências
- [ ] Definir deadline para cada dependência

**Owner:** [Tech Lead, PM]

---

### R-OPS-008: Sem testes de aceitação deixa critérios vagos

**Descrição:** Feature é implementada, mas critério de "pronto" não é claro; QA e Dev discutem se está done.

**Causa raiz:** Sem acceptance criteria escritos.

**Probabilidade:** Média | **Impacto:** Médio | **Severidade:** 🟡 Alta

**Cenários:**
- Dev: "Filtro funciona, pode lançar"
- QA: "Não tem teste de acessibilidade, não pode"
- Debate por 2 dias

**Mitigação:**
- [ ] Escrever acceptance criteria no Spec Doc
- [ ] Incluir: funcional + não-funcional (perf, acessibilidade, seg)
- [ ] QA sign-off antes de merge
- [ ] Definition of Done checklist

**Owner:** [PM, Dev, QA]

---

## 4. Matriz de Risco Consolidada

| ID | Descrição | Tipo | Prob. | Impacto | Severidade | Mitigação Nível |
|----|-----------|------|-------|---------|-----------|-----------------|
| R-TEC-001 | Inconsistência filtro/dados | TEC | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-TEC-002 | Intervalo invertido erro silencioso | TEC | 🟡 M | 🟡 M | 🟡 ALTA | Alta |
| R-TEC-003 | Timezone causa datas diferentes | TEC | 🔴 A | 🟡 M | 🟡 ALTA | Alta |
| R-TEC-004 | Performance degrada | TEC | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-TEC-005 | Datas inválidas causam crash | TEC | 🟢 B | 🟡 M | 🟡 ALTA | Média |
| R-TEC-006 | Sem sync URL/estado | TEC | 🟡 M | 🟡 M | 🟡 ALTA | Média |
| R-TEC-007 | Race condition requisições | TEC | 🟡 M | 🟡 M | 🟡 ALTA | Alta |
| R-TEC-008 | Transações com data inválida | TEC | 🟢 B | 🔴 A | 🔴 CRÍTICA | Alta |
| R-TEC-009 | Sem suporte mobile | TEC | 🔴 A | 🟡 M | 🟡 ALTA | Alta |
| R-TEC-010 | Sem tratamento erro API | TEC | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-NEG-001 | Usuário seleciona período errado | NEG | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-NEG-002 | Falta presets de período | NEG | 🔴 A | 🟡 M | 🟡 ALTA | Média |
| R-NEG-003 | Período sem dados gera confusão | NEG | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-NEG-004 | Feature não resolve problema real | NEG | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-NEG-005 | Sem comunicação subutilização | NEG | 🔴 A | 🟡 M | 🟡 ALTA | Média |
| R-OPS-001 | Sem definição clara retrabalho | OPS | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-OPS-002 | Testes insuficientes bugs | OPS | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-OPS-003 | Sem feature flag impacto total | OPS | 🟡 M | 🔴 A | 🔴 CRÍTICA | Alta |
| R-OPS-004 | Sem monitoramento | OPS | 🟡 M | 🟡 M | 🟡 ALTA | Média |
| R-OPS-005 | Documentação insuficiente | OPS | 🟢 B | 🟡 M | 🟡 ALTA | Baixa |
| R-OPS-006 | Design/dev não alinhados | OPS | 🟡 M | 🟡 M | 🟡 ALTA | Média |
| R-OPS-007 | Dependências não sincronizadas | OPS | 🟢 B | 🔴 A | 🔴 CRÍTICA | Alta |
| R-OPS-008 | Sem critério de aceitação | OPS | 🟡 M | 🟡 M | 🟡 ALTA | Média |

---

## 5. Top 5 Riscos a Mitigar Antes do MVP

| # | Risco | Por quê | Ação imediata |
|---|-------|-------|---------------|
| 1 | R-TEC-001 Inconsistência | Usuário vê dados conflitantes | Garantir mesmo `dateRange` para metrics + transactions |
| 2 | R-TEC-004 Performance | Dashboard fica inutilizável | Limitar intervalo a 12 meses + testes de carga |
| 3 | R-NEG-001 Período invisível | Decisão baseada em dados errados | Exibir intervalo em badge clara no header |
| 4 | R-OPS-002 Testes insuficientes | Bugs em produção | Coverage 80% mínimo; teste edge cases |
| 5 | R-OPS-003 Sem feature flag | Rollback impossível | Feature flag obrigatória; rollout gradual |

---

## 6. Atividades de Mitigação Propostas

### Antes do Design (Semana 1)
- [ ] Entrevista com 5-10 usuários sobre necessidade de filtro (R-NEG-004)
- [ ] Validar com dev viabilidade de timeline (R-OPS-007)
- [ ] Listar dependencies: quando `src/lib/api.ts` estará pronto? (R-OPS-007)

### Antes da Implementação (Semana 2-3)
- [ ] Preencher `EDGE-CASES-filtro-periodo.md` completamente (R-OPS-001)
- [ ] Aprovação em reunião: Product + Design + Dev (R-OPS-001)
- [ ] Tech design: como sincronizar URL ↔ estado? (R-TEC-006)
- [ ] Plano de performance: teste com 10k transações (R-TEC-004)

### Durante Implementação (Semana 4-6)
- [ ] Testes unitários: 80% coverage mínimo (R-OPS-002)
- [ ] Testes E2E: válido + inválido + sem dados (R-OPS-002)
- [ ] Feature flag implementada e desabilitada por padrão (R-OPS-003)
- [ ] Rollout plan documentado (R-OPS-003)

### Antes de Launch (Semana 7)
- [ ] QA em staging por 5 dias (R-OPS-002)
- [ ] Acceptance criteria 100% ✓ (R-OPS-008)
- [ ] Alertas em produção configurados (R-OPS-004)
- [ ] Changelog + email + tutorial preparados (R-NEG-005)

---

## 7. Checklist de Aprovação de Risco

- [ ] Todos os riscos CRÍTICOS (🔴) têm mitigação documentada
- [ ] Todos os riscos ALTA (🟡) têm owner identificado
- [ ] Atividades de mitigação têm deadline
- [ ] Rollback plan definido para cada risco TEC
- [ ] Monitoramento/alertas planejados
- [ ] Time alinhado em definições de "sucesso" da feature
