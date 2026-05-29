# Cenários de Teste: Exportação CSV

## Cenário 1 - Exportação com sucesso
- Dado: Existem transações no dashboard
- Quando: Usuário clicar em "Exportar CSV"
- Então: Um arquivo CSV deve ser baixado

## Cenário 2 - Sem transações
- Dado: Não existem transações
- Quando: Usuário exportar
- Então: CSV vazio ou mensagem de erro

## Cenário 3 - Caracteres especiais
- Dado: Categoria com acentos
- Quando: Exportar CSV
- Então: Arquivo deve manter UTF-8 corretamente