# Desafio: Evolução do Piggbank - TDD com Gemini CLI

## 📝 Descrição da Atividade

**Atenção: Este trabalho pode ser realizado individualmente ou em dupla!**

O **piggbank** continua evoluindo, e agora precisamos adicionar uma nova funcionalidade: a **Exportação de Transações em CSV**. Nesta atividade, você irá atuar como desenvolvedor full-stack responsável pelo ciclo de vida da feature, utilizando **Test-Driven Development (TDD)**. Você criará cenários de testes em um arquivo Markdown, e uma IA (via **Gemini CLI**) irá implementar os testes automatizados e o código necessário para fazê-los passar.

O objetivo é garantir que a nova funcionalidade respeite o **Design System** existente, siga os padrões de código do projeto e seja desenvolvida de forma disciplinada com TDD. Para realizar o trabalho corretamente, pesquise sobre TDD e o uso do Gemini CLI.

## 💡 A Funcionalidade: Exportação de Transações em CSV

**O Cenário (User Story):**

> _"Como proprietário de uma PME, quero poder exportar minhas transações em um arquivo CSV para análise externa, backup ou integração com outras ferramentas."_

### Requisitos para o Desenvolvimento:

1. **O Gatilho (Trigger):** Um botão "Exportar CSV" no dashboard (próximo à tabela de transações).
2. **A Funcionalidade:** Ao clicar, gera um arquivo CSV contendo todas as transações exibidas (considerando filtros aplicados, se houver).
3. **Formato do CSV:**
   - Colunas: Data (formato YYYY-MM-DD), Tipo (Entrada/Saída), Valor (número), Categoria (string).
   - Codificação UTF-8, separador vírgula.
4. **Ação:** Inicia download automático do arquivo nomeado como "transacoes-piggbank-YYYYMMDD.csv".
5. **Validações:** Se não há transações, gera CSV com cabeçalhos vazios ou mostra mensagem de erro.
6. **Integração:** Não afeta métricas ou estado do app; apenas exporta dados atuais.

> **Atenção técnica:** Esta feature reforça conceitos de TDD:
>
> - **TDD Cycle:** Red (escrever teste que falha) → Green (implementar código mínimo para passar) → Refactor (melhorar código sem quebrar testes).
> - **Gemini CLI:** Use o CLI para gerar código baseado nos cenários de testes que você descrever.
> - **Design System:** Reaproveite componentes existentes (ex: `Button`).

## 🔍 Tópicos para Pesquisa

Para realizar o trabalho com sucesso, pesquise previamente sobre:

- **TDD (Test-Driven Development):** Ciclo Red-Green-Refactor, benefícios e como aplicar em projetos reais.
- **Gemini CLI:** Como instalar e usar o CLI do Gemini para geração de código e testes.

## 🎯 Objetivos

Ao final desta atividade, você será capaz de:

- **TDD na Prática:** Escrever cenários de testes antes do código e iterar até passar.
- **Integração com IA:** Usar Gemini CLI para acelerar o desenvolvimento sem comprometer a qualidade.
- **Qualidade de Código:** Garantir cobertura de testes ≥80% e respeito aos padrões do projeto.
- **Análise Crítica:** Avaliar o output da IA e refatorar quando necessário.

## ⚠️ Regras e Restrições

- **TDD Obrigatório:** Todo código deve ser desenvolvido seguindo TDD. Crie o arquivo de testes MD primeiro.
- **Uso da IA:** Use exclusivamente o **Gemini CLI** para gerar código e testes. Não use Copilot ou outras IAs.
- **Feature Branch:** Trabalhe em uma branch isolada (ex: `feature/editar-transacao-nome-aluno`). Commits na `main` são proibidos.
- **Code Review:** Se em dupla, faça peer review mútuo via PR.
- **Padrões do Projeto:** Siga as regras em CLAUDE.md e copilot-instructions.md (mesmo usando Gemini).

---

## 🚀 Passo a Passo da Atividade

### 1. Preparação do Ambiente

Clone o repositório, instale dependências e crie sua branch de trabalho:

```bash
git clone git@github.com:xpeer-io/quest1-piggbank.git
cd quest1-piggbank
npm install
git checkout -b feature/exportar-transacoes-nome-aluno
```

### 2. Planejamento com TDD

Antes de codar, crie um arquivo `docs/specs/exportar-transacoes-test-scenarios.md` com os cenários de testes. Descreva:

- Cenários positivos (exportação bem-sucedida com dados).
- Cenários negativos (sem transações, erro de geração).
- Cenários de edge cases (transações com caracteres especiais, datas).

Exemplo de estrutura:

```markdown
# Cenários de Teste: Exportação de Transações em CSV

## Cenário 1: Exportação Bem-Sucedida
- Dado: Transações existentes no dashboard.
- Quando: Usuário clica em "Exportar CSV".
- Então: Arquivo CSV é gerado e download é iniciado com nome correto.

## Cenário 2: Sem Transações
- Dado: Nenhuma transação exibida.
- Quando: Tenta exportar.
- Então: CSV com cabeçalhos vazios é gerado ou mensagem de erro.
```

### 3. Implementação com Gemini CLI

Use o Gemini CLI para gerar os testes e o código:

- Instale o Gemini CLI (pesquise a documentação oficial).
- Execute comandos como `gemini generate tests --from docs/specs/exportar-transacoes-test-scenarios.md` para criar testes.
- Depois, `gemini generate code --tests src/components/dashboard/ExportarTransacoes.test.tsx` para implementar o código que passa nos testes.
- Itere: Rode `npm test` para verificar falhas, refine os cenários e gere novamente.

### 4. Desenvolvimento Iterativo

- **Red:** Escreva/gerencie cenários que falham.
- **Green:** Use Gemini para gerar código mínimo que passa.
- **Refactor:** Melhore o código (ex: componentização), mantendo testes verdes.
- Teste build (`npm run build`) e cobertura (`npm test -- --coverage`) em cada iteração.

### 5. Pull Request (PR) e Code Review

Após terminar:

1. Commit e push: `git add . && git commit -m "feat: adiciona exportacao de transacoes em csv com TDD" && git push -u origin feature/exportar-transacoes-nome-aluno`.
2. Abra um PR no repositório original (`xpeer-io/quest1-piggbank`).
3. Se em dupla, solicite peer review.
4. No review, verifique: Cobertura de testes, respeito ao Design System, ausência de hardcoding.

### 6. Análise Técnica e Qualidade

Relate no PR ou arquivo de entrega:

1. **Build:** Aplicação fez build com sucesso?
2. **Testes:** Gemini criou testes automaticamente? Passaram?
3. **Cobertura:** Métrica final de cobertura.
4. **TDD Efetivo:** Como o ciclo Red-Green-Refactor ajudou?
5. **Lições com Gemini:** A IA respeitou os padrões? Você precisou refatorar?

## 📦 Entrega

- Envie o link do PR aprovado (com review se em dupla) e o arquivo `editar-transacao-test-scenarios.md` via Blackboard.
- Prazo: Até a data estipulada.

---

Comandos Úteis:
- `npm test`: Roda testes.
- `npm test -- --coverage`: Verifica cobertura.
- `npm run build`: Build de produção.