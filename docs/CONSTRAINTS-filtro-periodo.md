# Constraints: Filtro de Período no Dashboard

Lista de constraints, decisões de design e definições de negócio que precisam ser finalizadas antes de iniciar o Spec Doc técnico.

---

## 1. Constraints de Comportamento do Filtro

### C-COMP-001: Intervalo invertido (startDate > endDate)

**Definição necessária:** Como o sistema deve reagir?

**Opções:**
1. ❌ Rejeitar com erro: "Data de início deve ser anterior à data de fim"
2. ✅ Inverter automaticamente: `startDate` e `endDate` trocam de lugar
3. ⚠️ Permitir (interpretação: do fim para o início)

**Recomendação:** ❌ Opção 1 — mais clara para o usuário; evita confusão.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Se rejeitar: validação no frontend, erro visual, desabilitação de botão "Aplicar"
- Se inverter: lógica silenciosa, menos confuso, mas pode surpreender
- Se permitir: risco de dados errados

**Owner:** [Product Manager]

**Prazo:** [Data]

---

### C-COMP-002: Data inicial igual à data final (startDate == endDate)

**Definição necessária:** Um intervalo de um dia é permitido?

**Opções:**
1. ✅ Permitir: intervalo de 24h (startOfDay(date) até endOfDay(date))
2. ❌ Rejeitar: "Intervalo mínimo é 1 dia completo"
3. ⚠️ Permitir mas mostrar aviso

**Recomendação:** ✅ Opção 1 — útil para usuário analisar um dia específico; comum em dashboards.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Métrica de 1 dia será exibida normalentemente (dia inteiro em UTC)
- Transações naquele dia aparecerão
- Empty state se nenhuma transação naquele dia

**Owner:** [Product Manager, Designer]

**Prazo:** [Data]

---

### C-COMP-003: Aplicação do filtro — imediato vs confirmação

**Definição necessária:** Quando o filtro é aplicado ao dashboard?

**Opções:**
1. ✅ Aplicação imediata: após cada mudança nos campos (com debounce 300-500ms)
2. ❌ Confirmação explícita: botão "Aplicar" obrigatório
3. ⚠️ Prévia + confirmação: exibe preview enquanto digita, aplica ao confirmar

**Recomendação:** ✅ Opção 1 — melhor UX; feedback imediato; padrão em dashboards modernos.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Implementar debounce 300-500ms para evitar requestsjá em cascata
- Loading skeleton enquanto dados são recalculados
- Botão "Aplicar" pode ser removido (ou manter para confirmação final)

**Owner:** [Designer, Dev]

**Prazo:** [Data]

---

### C-COMP-004: Limpeza do filtro — reset vs padrão

**Definição necessária:** O que acontece ao limpar o filtro?

**Opções:**
1. ✅ Volta para padrão: "Últimos 30 dias" (getDefaultDateRange)
2. ❌ Deixa campos vazios: nenhum período selecionado
3. ⚠️ Retorna período anterior

**Recomendação:** ✅ Opção 1 — clara e previsível; sempre há um período aplicado.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Botão "Limpar" ou "Reset" leva a getDefaultDateRange()
- Dashboard nunca fica sem período
- Evita estado de "nenhum período aplicado"

**Owner:** [Designer]

**Prazo:** [Data]

---

## 2. Constraints de Validação de Datas

### C-VAL-001: Aceitar datas futuras

**Definição necessária:** O sistema deve permitir seleção de datas futuras?

**Opções:**
1. ✅ Permitir: sem restrição de data futura
2. ❌ Bloquear: máximo até hoje (endOfDay(now()))
3. ⚠️ Avisar: permitir mas com ícone de aviso

**Recomendação:** ❌ Opção 2 — faz sentido financeiro (sem transações futuras ainda); evita confusão.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Validação: `endDate <= endOfDay(now())`
- Desabilitar datas futuras no date picker nativo (se possível)
- Mensagem: "Não é possível selecionar datas futuras"

**Owner:** [Product Manager]

**Prazo:** [Data]

---

### C-VAL-002: Aceitar datas muito antigas (anterior a primeira transação)

**Definição necessária:** Há limite mínimo de data?

**Opções:**
1. ✅ Permitir qualquer data: mesmo sem transações
2. ❌ Bloquear: mínimo = data primeira transação registrada
3. ⚠️ Avisar: permitir mas indicar "sem dados"

**Recomendação:** ✅ Opção 1 — flexível; empty state comunica falta de dados.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Sem limite mínimo de data
- Se período anterior a primeira transação: empty state "Sem dados"
- Métrica exibem 0
- UX comunicaa ausência claramente

**Owner:** [Product Manager, Designer]

**Prazo:** [Data]

---

### C-VAL-003: Limite máximo de intervalo

**Definição necessária:** Qual é o intervalo máximo permitido?

**Opções:**
1. ✅ 12 meses: MAX_DATE_RANGE_MONTHS = 12
2. ❌ 3 meses: MAX_DATE_RANGE_MONTHS = 3 (mais restritivo)
3. ⚠️ Sem limite: permite qualquer intervalo
4. ⚠️ 24 meses: MAX_DATE_RANGE_MONTHS = 24 (menos restritivo)

**Recomendação:** ✅ Opção 1 — 12 meses é padrão em dashboards; balanço entre flexibilidade e performance.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Validação: `differenceInMonths(endDate, startDate) <= 12`
- Mensagem de erro: "Intervalo máximo é 12 meses"
- Código: já existe `MAX_DATE_RANGE_MONTHS` em `src/lib/date.ts`

**Owner:** [Product Manager, Dev]

**Prazo:** [Data]

---

### C-VAL-004: Formato de data aceito na UI

**Definição necessária:** Qual formato é exibido e aceito?

**Opções:**
1. ✅ dd/MM/yyyy (Brasil): "01/05/2026"
2. ❌ MM/dd/yyyy (EUA): "05/01/2026"
3. ⚠️ Detectar locale: usuário define em config
4. ⚠️ Múltiplos formatos: aceitar diferentes

**Recomendação:** ✅ Opção 1 — projeto é Brasil-first; padrão em contexto PT-BR.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Constante: `DATE_DISPLAY_FORMAT = "dd/MM/yyyy"` em `src/lib/date.ts`
- Input: placeholder "DD/MM/YYYY"
- Validação: rejeitar MM/DD/YYYY
- Se i18n futuro: usar `new Intl.DateTimeFormat()`

**Owner:** [Designer, Dev]

**Prazo:** [Data]

---

## 3. Constraints de Timezone

### C-TZ-001: Timezone de trabalho e armazenamento

**Definição necessária:** Como tratar timezones?

**Opções:**
1. ✅ UTC internamente, timezone local na UI
2. ❌ Timezone do navegador para tudo
3. ⚠️ Timezone fixo (ex: sempre São Paulo, UTC-3)
4. ⚠️ Sem considerar timezone (apenas datas)

**Recomendação:** ✅ Opção 1 — padrão de produção; evita bugs de sincronização.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Todas as transações armazenadas em UTC
- `startOfDay` e `endOfDay` trabalham em UTC
- Exibição usa formato local (date-fns)
- Documentar em `src/lib/date.ts`

**Owner:** [Dev, Tech Lead]

**Prazo:** [Data]

---

### C-TZ-002: Bordas de dia (inclusão/exclusão)

**Definição necessária:** Uma transação às 00:00:00 ou 23:59:59 é incluída?

**Opções:**
1. ✅ `startOfDay(from) <= transactionDate <= endOfDay(to)`: dia inteiro incluído
2. ❌ `startOfDay(from) <= transactionDate < startOfDay(to+1)`: inicio até next day
3. ⚠️ `from <= transactionDate <= to`: timestamps exatos

**Recomendação:** ✅ Opção 1 — intuitivo; usuário seleciona "01 a 31" e espera o dia inteiro.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Lógica: `transaction.date >= startOfDay(from) && transaction.date <= endOfDay(to)`
- Função em `src/lib/date.ts`: `isInDateRange(date, range)`
- Testes: validar bordas de dia em UTC

**Owner:** [Dev]

**Prazo:** [Data]

---

## 4. Constraints de Persistência

### C-PERS-001: Persistência do filtro entre navegações

**Definição necessária:** O filtro é mantido ao navegar?

**Opções:**
1. ✅ Via URL params: `?from=2026-05-01&to=2026-05-31`
2. ❌ Via localStorage: salva locally, recover no reload
3. ⚠️ Via session: só durante a sessão do navegador
4. ⚠️ Sem persistência: volta para padrão

**Recomendação:** ✅ Opção 1 — URL é mais padrão; shareable; funciona com server-side rendering.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Usar `useSearchParams()` em Next.js (ou similar)
- Format: `?from=yyyy-MM-dd&to=yyyy-MM-dd`
- Navigation preserva query params
- Refresh mantém filtro via URL

**Owner:** [Dev]

**Prazo:** [Data]

---

### C-PERS-002: Persistência entre dispositivos

**Definição necessária:** Se mudo filtro no desktop, vejo no mobile?

**Opções:**
1. ✅ Não: filtro é por device (URL params)
2. ❌ Sim: salvo na conta do usuário (requer backend)
3. ⚠️ Opcional: toggle "salvar como preferência"

**Recomendação:** ✅ Opção 1 — MVP simples; cada device independente.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Sem sincronização de conta
- URL params no desktop ≠ URL params no mobile
- Cada device pode ter seu filtro

**Owner:** [Product Manager]

**Prazo:** [Data]

---

## 5. Constraints de Performance

### C-PERF-001: Limite de transações para calcular

**Definição necessária:** Quantas transações o sistema pode processar eficientemente?

**Opções:**
1. ✅ 10.000 transações: aceita qualquer intervalo (com limite de 12 meses)
2. ❌ 1.000 transações: mais restritivo
3. ⚠️ 100.000 transações: muito permissivo
4. ⚠️ Sem limite: processa tudo

**Recomendação:** ✅ Opção 1 — realista para PME; balanceado.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Teste de performance com 10k transações mock
- Se atinge limite: avisar usuário ou limitar intervalo
- Documentar em CONTEXT.md

**Owner:** [Dev, QA]

**Prazo:** [Data]

---

### C-PERF-002: Tempo máximo de resposta

**Definição necessária:** Quanto tempo pode levar para recalcular?

**Opções:**
1. ✅ < 500ms: resposta instantânea percebida
2. ❌ < 1s: aceitável mas com loading visível
3. ⚠️ < 2s: lento mas tolerável
4. ⚠️ Sem limite: leva quanto tiver de levar

**Recomendação:** ✅ Opção 1 — melhor UX; sem skeleton noticeable.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Otimizar cálculo de métricas
- Se exceder: mostrar skeleton/loading
- Monitorar em produção

**Owner:** [Dev]

**Prazo:** [Data]

---

### C-PERF-003: Debounce de aplicação de filtro

**Definição necessária:** Qual delay entre mudança e aplicação?

**Opções:**
1. ✅ 300ms: balance entre responsividade e requisições
2. ❌ 100ms: muito responsivo, muitas requisições
3. ⚠️ 500ms: menos requisições, mas sente lento
4. ⚠️ Sem debounce: aplicar imediatamente

**Recomendação:** ✅ Opção 1 — padrão em design systems modernos.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Implementar com `setTimeout` ou hook de debounce
- Cancelar timeout anterior se usuário muda novo valor
- Reduz carga de servidor em desenvolvimento

**Owner:** [Dev]

**Prazo:** [Data]

---

## 6. Constraints de UX/Comportamento Sem Dados

### C-UX-001: Intervalo sem transações — exibição

**Definição necessária:** Como o dashboard fica quando não há dados?

**Opções:**
1. ✅ Empty state claro: mensagem "Nenhuma transação encontrada" + cards zerados
2. ❌ Cards vazios: sem mensagem, só 0 nos valores
3. ⚠️ Fallback: mostra período anterior com dados
4. ⚠️ Erro: "Nenhum dado disponível"

**Recomendação:** ✅ Opção 1 — clara e educativa; evita confusão.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- TransactionsTable já implementa empty state
- Cards exibem 0, não "-" ou omitem valor
- Banner ou texto explicativo: "Selecione um período que inclua transações"
- Sugerir preset: "Últimos 30 dias"

**Owner:** [Designer, Dev]

**Prazo:** [Data]

---

### C-UX-002: Intervalo parcialmente sem dados

**Definição necessária:** Se há transações só em metade do intervalo, como é visível?

**Opções:**
1. ✅ Apenas o que há: cards mostram 0 para categorias sem dados
2. ❌ Aviso: "Apenas parte do intervalo tem dados"
3. ⚠️ Sugestão: "Narrower period encontrou dados" + atalho

**Recomendação:** ✅ Opção 1 — simples; dados falam por si.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Sem mudança de lógica; apenas exibição
- Cards mostram corretamente apenas o calculado

**Owner:** [Designer]

**Prazo:** [Data]

---

### C-UX-003: Visibilidade do período aplicado

**Definição necessária:** Como o usuário sabe qual intervalo está em uso?

**Opções:**
1. ✅ Badge clara no header: "📅 01/05 — 31/05/2026"
2. ❌ Pequeno texto no footer: muito discreto
3. ⚠️ Destaque nos campos de entrada: mostra após confirmar
4. ⚠️ Sem indicação: filtro é "invisível"

**Recomendação:** ✅ Opção 1 — sempre visível; evita confusão sobre dados.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Component novo ou extensão do header
- Design: usar ícone de calendário + cores
- Texto: formato claro "de XX até XX"

**Owner:** [Designer, Dev]

**Prazo:** [Data]

---

## 7. Constraints de Acessibilidade

### C-ACC-001: Suporte a leitores de tela

**Definição necessária:** WCAG 2.1 AA ou AAA?

**Opções:**
1. ✅ AA (mínimo obrigatório): WCAG 2.1 Level AA
2. ❌ AAA (máximo): mais restritivo, raro
3. ⚠️ Não-obrigatório: best-effort

**Recomendação:** ✅ Opção 1 — padrão de acessibilidade legal em muitos países.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Labels explícitos em inputs de data
- Anúncio de região com intervalo aplicado
- Teste com leitor (NVDA, JAWS, ou similar)

**Owner:** [Dev, QA]

**Prazo:** [Data]

---

### C-ACC-002: Navegação por teclado

**Definição necessária:** É obrigatório?

**Opções:**
1. ✅ Sim: Tab, Enter, Escape funcionam
2. ❌ Não: mouse-only
3. ⚠️ Parcial: algumas funcionalidades

**Recomendação:** ✅ Opção 1 — necessário para WCAG AA.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Tab entre campos de data
- Enter confirma, Escape cancela
- Focus visível em todos os botões
- Teste com teclado

**Owner:** [Dev]

**Prazo:** [Data]

---

## 8. Constraints de Compatibilidade

### C-COMPAT-001: Suporte a browsers

**Definição necessária:** Qual é o mínimo?

**Opções:**
1. ✅ Últimas 2 versões de Chrome, Firefox, Safari, Edge
2. ❌ IE 11 (descontinuado): não suportar
3. ⚠️ Últimas 5 versões: muito permissivo
4. ⚠️ Browser antigos: suportar com polyfills

**Recomendação:** ✅ Opção 1 — alinhado com Next.js 16 defaults.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- `input[type="date"]` suportado em 99% dos browsers modernos
- Sem polyfills necessários para date picker
- Testar em Chrome, Safari, Firefox, Edge

**Owner:** [Dev, QA]

**Prazo:** [Data]

---

### C-COMPAT-002: Suporte a mobile

**Definição necessária:** Responsive design obrigatório?

**Opções:**
1. ✅ Sim: desktop + tablet + mobile (375px+)
2. ❌ Desktop-only
3. ⚠️ Parcial: algumas funcionalidades

**Recomendação:** ✅ Opção 1 — mercado mobile-first; esperado.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Date picker usa input nativo em mobile (melhor UX)
- Layout reflow em 375px
- Teste em iOS Safari + Chrome Android

**Owner:** [Designer, Dev]

**Prazo:** [Data]

---

## 9. Constraints de Integração

### C-INT-001: API endpoint de filtro

**Definição necessária:** Como backend recebe filtro?

**Opções:**
1. ✅ Query params: `GET /dashboard?from=2026-05-01&to=2026-05-31`
2. ❌ Body POST: POST com `{ from, to }`
3. ⚠️ Header customizado: menos comum
4. ⚠️ URL path: `/dashboard/2026-05-01/2026-05-31`

**Recomendação:** ✅ Opção 1 — padrão REST; cacheável; shareable URL.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- URL format: `from=yyyy-MM-dd&to=yyyy-MM-dd`
- Backend parseia query params
- Pode ser cacheado (se GET)

**Owner:** [Dev, Backend]

**Prazo:** [Data]

---

### C-INT-002: Formato de retorno da API

**Definição necessária:** O servidor retorna qual formato?

**Opções:**
1. ✅ Dados filtrados + metadados: `{ metrics: [...], transactions: [...], appliedFilter: {...} }`
2. ❌ Dados brutos: sem confirmação de filtro
3. ⚠️ Apenas status: `{ success: true }`

**Recomendação:** ✅ Opção 1 — documentação clara; fácil validação.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Backend retorna filtro aplicado (confirmação)
- Frontend valida: filtro enviado == filtro recebido
- Reduz bugs de mismatch

**Owner:** [Backend]

**Prazo:** [Data]

---

## 10. Constraints de Segurança

### C-SEC-001: Validação de input do lado do cliente

**Definição necessária:** Apenas frontend valida ou também backend?

**Opções:**
1. ✅ Ambos: frontend + backend validam (defense in depth)
2. ❌ Apenas frontend: risco, pois pode ser contornado
3. ⚠️ Apenas backend: lento, sem feedback instant

**Recomendação:** ✅ Opção 1 — padrão de segurança.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Frontend: validar com Zod antes de enviar
- Backend: re-validar mesmo que frontend validou
- Ambos: usar mesma regra (schema)

**Owner:** [Dev, Backend]

**Prazo:** [Data]

---

### C-SEC-002: SQL injection / NOSQL injection (se houver DB real)

**Definição necessária:** Como as datas são escapadas?

**Opções:**
1. ✅ Prepared statements: sempre usar params
2. ❌ String concatenation: NUNCA
3. ⚠️ Sanitização: depende da lib

**Recomendação:** ✅ Opção 1 — padrão obrigatório.

**Decisão:** [ ] Opção escolhida: _______________

**Implicações:**
- Backend nunca concatena strings SQL
- Usar ORM ou prepared statements (ex: Prisma, SQLAlchemy)
- Testar com inputs maliciosos

**Owner:** [Backend]

**Prazo:** [Data]

---

## 11. Matriz de Constraints por Categoria

| Categoria | Constraint | Prioridade | Status | Owner |
|-----------|-----------|-----------|--------|-------|
| Comportamento | C-COMP-001 Intervalo invertido | 🔴 P0 | [ ] | [PM] |
| Comportamento | C-COMP-002 Data igual | 🟡 P1 | [ ] | [PM] |
| Comportamento | C-COMP-003 Aplicação do filtro | 🟡 P1 | [ ] | [Designer] |
| Comportamento | C-COMP-004 Limpeza de filtro | 🟡 P1 | [ ] | [Designer] |
| Validação | C-VAL-001 Datas futuras | 🟡 P1 | [ ] | [PM] |
| Validação | C-VAL-002 Datas antigas | 🟢 P2 | [ ] | [PM] |
| Validação | C-VAL-003 Limite máximo | 🔴 P0 | [ ] | [PM, Dev] |
| Validação | C-VAL-004 Formato de data | 🔴 P0 | [ ] | [Designer, Dev] |
| Timezone | C-TZ-001 Timezone | 🔴 P0 | [ ] | [Dev] |
| Timezone | C-TZ-002 Bordas de dia | 🔴 P0 | [ ] | [Dev] |
| Persistência | C-PERS-001 Entre navegações | 🟡 P1 | [ ] | [Dev] |
| Persistência | C-PERS-002 Entre devices | 🟢 P2 | [ ] | [PM] |
| Performance | C-PERF-001 Limite de transações | 🟡 P1 | [ ] | [Dev] |
| Performance | C-PERF-002 Tempo máximo | 🟡 P1 | [ ] | [Dev] |
| Performance | C-PERF-003 Debounce | 🟡 P1 | [ ] | [Dev] |
| UX | C-UX-001 Sem dados | 🔴 P0 | [ ] | [Designer] |
| UX | C-UX-002 Parcialmente sem dados | 🟢 P2 | [ ] | [Designer] |
| UX | C-UX-003 Visibilidade do período | 🔴 P0 | [ ] | [Designer, Dev] |
| Acessibilidade | C-ACC-001 Leitores de tela | 🟡 P1 | [ ] | [Dev] |
| Acessibilidade | C-ACC-002 Teclado | 🟡 P1 | [ ] | [Dev] |
| Compatibilidade | C-COMPAT-001 Browsers | 🟡 P1 | [ ] | [Dev] |
| Compatibilidade | C-COMPAT-002 Mobile | 🔴 P0 | [ ] | [Designer, Dev] |
| Integração | C-INT-001 API endpoint | 🔴 P0 | [ ] | [Dev, Backend] |
| Integração | C-INT-002 Formato de retorno | 🟡 P1 | [ ] | [Backend] |
| Segurança | C-SEC-001 Validação dupla | 🟡 P1 | [ ] | [Dev] |
| Segurança | C-SEC-002 SQL injection | 🔴 P0 | [ ] | [Backend] |

---

## 12. Checklist: Constraints Prontas para Spec Doc

**Comportamento:** [ ]
- [ ] C-COMP-001 Intervalo invertido
- [ ] C-COMP-002 Data igual
- [ ] C-COMP-003 Aplicação do filtro
- [ ] C-COMP-004 Limpeza de filtro

**Validação:** [ ]
- [ ] C-VAL-001 Datas futuras
- [ ] C-VAL-002 Datas antigas
- [ ] C-VAL-003 Limite máximo
- [ ] C-VAL-004 Formato de data

**Timezone:** [ ]
- [ ] C-TZ-001 Timezone
- [ ] C-TZ-002 Bordas de dia

**Persistência:** [ ]
- [ ] C-PERS-001 Entre navegações
- [ ] C-PERS-002 Entre devices

**Performance:** [ ]
- [ ] C-PERF-001 Limite de transações
- [ ] C-PERF-002 Tempo máximo
- [ ] C-PERF-003 Debounce

**UX:** [ ]
- [ ] C-UX-001 Sem dados
- [ ] C-UX-002 Parcialmente sem dados
- [ ] C-UX-003 Visibilidade do período

**Acessibilidade:** [ ]
- [ ] C-ACC-001 Leitores de tela
- [ ] C-ACC-002 Teclado

**Compatibilidade:** [ ]
- [ ] C-COMPAT-001 Browsers
- [ ] C-COMPAT-002 Mobile

**Integração:** [ ]
- [ ] C-INT-001 API endpoint
- [ ] C-INT-002 Formato de retorno

**Segurança:** [ ]
- [ ] C-SEC-001 Validação dupla
- [ ] C-SEC-002 SQL injection

---

## 13. Próximas Etapas

1. **Revisar constraints** com Product Manager, Designer e Dev Lead
2. **Decidir cada constraint** em reunião conjunta (prazo: semana de discovery)
3. **Documentar decisões** no Spec Doc (não no PRD)
4. **Comunicar decisões** para o time de implementação
5. **Começar Spec Doc** com constraints definidas

---

> Este documento é a base para o Spec Doc. Todas as 26 constraints devem ter decisão marcada e owner identificado antes de iniciar a escrita do Spec Doc técnico.
