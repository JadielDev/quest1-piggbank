# Edge Cases: Filtro de Período no Dashboard

Documento de análise de casos extremos e perguntas de borda para a feature de filtro de período. Organizado por categoria.

---

## 1. Comportamento do Filtro

### Intervalo de datas invertido
- **P1:** O que acontece se `startDate > endDate`? O sistema deve rejeitar, inverter automaticamente ou exibir erro?
- **P2:** Se o usuário digita "15/05" em "data de início" e "10/05" em "data de fim", qual é o comportamento esperado?
- **P3:** Existe um estado intermediário onde o usuário está preenchendo os campos? Deve validar antes de confirmar ou enquanto digita?

### Intervalo com data inicial igual à data final
- **P4:** Se `startDate == endDate`, o sistema deve incluir apenas aquele dia (24h) ou rejeitar como "intervalo inválido"?
- **P5:** Como isso afeta métricas? Se houver transações só no final do dia, elas aparecem ou desaparecem?

### Intervalo vazio ou parcialmente preenchido
- **P6:** Qual é o comportamento se o usuário preenche apenas `startDate` e tenta confirmar?
- **P7:** Se o usuário preenche apenas `endDate`, o sistema deve preenchê-lo automaticamente com o `startDate` ou mostrar erro?
- **P8:** Existe um estado onde o filtro está "parcialmente aplicado"? Exemplo: começou a digitar mas não confirmou?

### Aplicação do filtro
- **P9:** O filtro deve aplicar imediatamente ao confirmar, após delay debounce, ou apenas ao clicar em botão "Aplicar"?
- **P10:** Se há um botão "Limpar" ou "Reset", ele volta para os últimos 30 dias ou deixa campos vazios?
- **P11:** O dashboard mostra um skeleton/loading enquanto recarrega os dados após aplicar novo filtro?

---

## 2. Validação de Datas

### Datas futuras
- **P12:** O sistema deve permitir seleção de datas futuras? Se sim, como calcular métricas de transações que ainda não ocorreram?
- **P13:** Se houver transações agendadas ou previsões, devem ser incluídas ao filtrar por data futura?
- **P14:** Deve haver validação visual que avise ao usuário que está selecionando datas futuras?

### Datas inválidas ou mal formatadas
- **P15:** Qual é o comportamento se o usuário digita "32/13/2026"? Rejeita imediatamente ou mostra erro após blur?
- **P16:** Se o usuário colar um texto inválido em um campo de data, como o sistema reage?
- **P17:** Existe suporte para diferentes formatos (dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd) ou só um é aceito?

### Limite máximo de intervalo
- **P18:** O intervalo máximo permitido é 12 meses? O que acontece se o usuário tenta selecionar 13 meses?
- **P19:** Qual é a mensagem exibida quando o intervalo excede o limite? "Máximo 12 meses" é suficiente?
- **P20:** Existe um limite mínimo (exemplo: não permitir filtro de 1 hora)? Por quê?

### Datas muito antigas
- **P21:** O que acontece se o usuário seleciona uma data anterior à primeira transação registrada no sistema?
- **P22:** O sistema deve informar ao usuário qual é o intervalo válido de datas disponíveis?

---

## 3. Experiência do Usuário

### Visual e contextual
- **P23:** O intervalo aplicado é exibido claramente no header do dashboard ou em algum outro lugar destacado?
- **P24:** Existe uma badge ou chip mostrando "De 01/05 a 31/05"? Como é o design?
- **P25:** Se o usuário não toca no filtro, qual é o estado padrão exibido? "Últimos 30 dias" ou as datas específicas?

### Feedback e mensagens
- **P26:** Qual é a mensagem exibida quando o intervalo selecionado não retorna nenhuma transação?
- **P27:** As métricas exibem 0 ou uma mensagem "Sem dados"? Como os cards de faturamento/despesas/lucro se comportam?
- **P28:** Se houver erro de validação, a mensagem aparece inline no campo, em um toast, ou em um alert?

### Estados de interação
- **P29:** Existe um estado "hover" ou "focus" claro no componente de seleção de período?
- **P30:** Se o usuário clica no período exibido, ele abre um modal, popover ou expande inline?
- **P31:** Existe undo/redo se o usuário aplica um filtro errado?

### Transição e animação
- **P32:** Quando o filtro é aplicado e os dados mudam, há animação de transição ou troca brusca?
- **P33:** Os cards de métrica deslizam, fadeiam ou têm skeleton durante carregamento?

---

## 4. Timezone

### Bordas de dia
- **P34:** Se uma transação ocorre às 23:59:59 em UTC, como é interpretada em São Paulo? (UTC-3)
- **P35:** Se o usuário seleciona "01/05 até 31/05" em São Paulo, qual é o intervalo exato em UTC?
- **P36:** As datas são sempre armazenadas em UTC internamente e convertidas para timezone local apenas na UI?

### Ambiguidade de horário
- **P37:** Uma transação com timestamp "01/05/2026 00:00:00" pertence ao período "até 01/05"?
- **P38:** Qual é a regra de inclusão: `startOfDay(from) <= transactionDate <= endOfDay(to)`?

### Mudança de horário de verão
- **P39:** Se o usuário seleciona um período que atravessa a mudança de horário (DST), há inconsistências?
- **P40:** Como o sistema lida com a "hora perdida" ou "hora extra" durante transição?

---

## 5. Persistência do Filtro

### Entre navegações
- **P41:** Se o usuário aplica um filtro e navega para outra página do app, o filtro é mantido ao voltar?
- **P42:** O filtro é persistido via URL (query params), localStorage, ou sessionStorage?
- **P43:** Qual é a prioridade se houver conflito? URL params sobrescrevem localStorage?

### Entre sessões
- **P44:** Se o usuário fecha a aba e volta dias depois, o filtro anterior é mantido?
- **P45:** Existe uma opção de "salvar como filtro padrão" para esse usuário?

### Refresh da página
- **P46:** Após F5 ou `location.reload()`, o filtro aplicado é mantido?
- **P47:** Se o filtro não puder ser recuperado, qual é o fallback? Últimos 30 dias?

### Entre dispositivos
- **P48:** Se o usuário aplica um filtro no desktop, ele o vê no mobile?
- **P49:** A persistência é por device, por conta de usuário, ou por browser?

---

## 6. Performance

### Cálculo de métricas
- **P50:** Qual é o tempo esperado para recalcular métricas em um intervalo de 12 meses?
- **P51:** Se há milhares de transações, o cálculo é feito no servidor ou no cliente?
- **P52:** Existe cache de métricas? Se o usuário seleciona o mesmo intervalo duas vezes, é preciso recalcular?

### Requisição de dados
- **P53:** Os dados são buscados com o filtro via um único endpoint ou múltiplos?
- **P54:** Existe paginação para a lista de transações? Se há 10.000 transações em um intervalo, todas são carregadas?
- **P55:** Qual é o comportamento se a requisição demora mais de 5 segundos?

### Limite de requisições
- **P56:** Se o usuário muda o filtro 10 vezes rapidamente (sem confirmar), 10 requisições são disparadas?
- **P57:** Existe debounce ou throttle na aplicação do filtro?

---

## 7. Comportamento Sem Dados

### Intervalo sem transações
- **P58:** Se o intervalo retorna 0 transações, o que mostra na `TransactionsTable`?
- **P59:** Os cards de métrica (Faturamento, Despesas, Lucro, Transações) exibem 0 ou uma mensagem especial?
- **P60:** Existe uma dica visual diferente para "sem dados" vs "carregando"?

### Intervalo parcialmente sem dados
- **P61:** Se há transações no meio do intervalo mas não nas bordas, como isso afeta a exibição?
- **P62:** Os cards mostram corretamente 0 de receita se não houver income no período?

### Intervalo com dados inconsistentes
- **P63:** Se uma transação tem `date: null` ou data inválida, como o sistema lida?
- **P64:** Transações com datas fora do intervalo filtrado ainda aparecem ou são excluídas?

---

## 8. Integração Frontend/Backend

### API Contract
- **P65:** A API retorna filtro aplicado na resposta para confirmação? Exemplo: `appliedFilter: { from, to }`?
- **P66:** Se o cliente envia filtro inválido, o servidor retorna 400 ou corrige silenciosamente?

### Sincronização de estado
- **P67:** Se o servidor retorna dados diferentes do esperado (ex: mais transações que o cálculo local), qual é o comportamento?
- **P68:** Existe validação dupla (client + server) de datas?

### Fallback
- **P69:** Se a API está offline ou lenta, o dashboard tenta cache local ou mostra erro?
- **P70:** Se o filtro não é suportado pelo backend, qual é o fallback?

---

## 9. Mobile

### Interface de seleção
- **P71:** Em mobile, o componente de data é um `input[type="date"]` nativo ou customizado?
- **P72:** O picker de data é acessível com teclado e assistivos de voz?

### Real estate
- **P73:** O header do dashboard tem espaço suficiente para exibir período e componente de filtro em mobile?
- **P74:** O filtro fica sempre visível ou se colapsa em um botão/menu?

### Gestos
- **P75:** Existe suporte para swipe para alterar período (ex: swipe left = mês anterior)?
- **P76:** Se há input de data, o teclado numérico aparece ou o teclado standard?

### Responsividade
- **P77:** Os cards de métrica se reorganizam em 2 colunas ou 1 em mobile?
- **P78:** A tabela de transações é scrollável horizontalmente em mobile?

---

## 10. Acessibilidade

### Leitura de tela
- **P79:** Um leitor de tela consegue entender que "01/05 até 31/05" é um período aplicado?
- **P80:** O componente de seleção de data é anunciado corretamente como fieldset, group ou region?

### Navegação por teclado
- **P81:** É possível navegar entre `startDate` e `endDate` com Tab e Shift+Tab?
- **P82:** A tecla Enter confirma o filtro? Existe tecla de escape para cancelar?

### Contraste e visual
- **P83:** Os campos de erro têm contraste suficiente (WCAG AA mínimo)?
- **P84:** Existe indicação visual além de cor (ex: ícone de erro) para campos inválidos?

### Labels
- **P85:** Os campos de data têm labels explícitos associados (não apenas placeholder)?
- **P86:** A descrição "Período do filtro" é clara para usuários cegos que usam leitor de tela?

### Mensagens
- **P87:** As mensagens de erro descrevem o problema e como corrigir?
- **P88:** Existe aria-live para anunciar mudanças quando o filtro é aplicado?

---

## 11. Possíveis Inconsistências de Métricas

### Cálculo de lucro
- **P89:** Se há renda em "Faturamento" mas não há despesa, o "Lucro Líquido" é apenas renda ou considera zero despesas?
- **P90:** Se há só despesas no período e zero renda, o lucro é negativo? Como é exibido?

### Transações duplicadas
- **P91:** Se uma transação aparece em duas categorias diferentes, é contada 2x no total de transações?
- **P92:** Existe dedução de transações canceladas ou devoluções do cálculo?

### Arredondamento
- **P93:** Se `faturamento - despesas` resulta em 123.456789 BRL, como é exibido? Arredondado para 2 casas?
- **P94:** Há diferença entre arredondamento visual e valor armazenado?

### Transações no limiar do período
- **P95:** Uma transação às 00:00:01 do primeiro dia está dentro? E às 23:59:59 do último dia?
- **P96:** Existe diferença entre inclusão de transações em `startDate` vs `endDate`?

### Histórico de modificação
- **P97:** Se uma transação foi criada no dia 01/05 mas modificada no dia 15/05, qual é a data considerada no filtro?
- **P98:** Existe log de quando o filtro foi aplicado e por quem (se houver multi-usuário no futuro)?

---

## 12. Casos Extremos Adicionais

### Primeiro acesso
- **P99:** Se é o primeiro acesso do usuário e não há nenhuma transação, qual é o filtro padrão aplicado?
- **P100:** Existe mensagem de onboarding ou tutorial para o filtro de período?

### Transações futuras planejadas
- **P101:** Se o usuário insere uma transação planejada para 30 dias, ela aparece ao filtrar por data futura?
- **P102:** Existe diferença entre transações "realizadas" e "planejadas" no filtro?

### Moeda e localização
- **P103:** Se o usuário muda localização (Brasil → EUA), o filtro mantém formato dd/mm/yyyy ou muda para mm/dd/yyyy?
- **P104:** Se há suporte a múltiplas moedas, o filtro de período afeta qual moeda é exibida?

---

## Matriz de Prioridade

| Pergunta | Prioridade | Bloqueador | Status |
|----------|-----------|-----------|--------|
| P1 - Intervalo invertido | Alta | Sim | Pendente |
| P4 - Data inicial = final | Alta | Sim | Pendente |
| P6 - Campo parcialmente preenchido | Média | Não | Pendente |
| P12 - Datas futuras | Média | Não | Pendente |
| P18 - Limite máximo | Alta | Sim | Pendente |
| P26 - Mensagem sem dados | Alta | Não | Pendente |
| P34 - Timezone e bordas | Alta | Sim | Pendente |
| P41 - Persistência entre navegações | Média | Não | Pendente |
| P50 - Performance de cálculo | Média | Sim | Pendente |
| P79 - Acessibilidade de tela | Média | Não | Pendente |

---

## Recomendações de Definição Prioritária

**Antes da implementação (bloqueadores):**
1. Definir comportamento para intervalo invertido (P1)
2. Definir se `startDate == endDate` é permitido (P4)
3. Definir limite máximo de intervalo (P18)
4. Definir regra de inclusão para bordas de dia (P34)
5. Definir mensagem para período sem dados (P26)

**Antes do design (UX relevante):**
1. Exibição do período aplicado (P23)
2. Comportamento de aplicação imediata vs confirmação (P9)
3. Componente de seleção em mobile (P71)
4. Labels de acessibilidade (P85)

**Antes dos testes (acceptance criteria):**
1. Cálculo correto de métricas em diferentes intervalos (P89-P98)
2. Performance esperada (P50-P54)
3. Persistência e sincronização (P41-P48, P67-P68)
