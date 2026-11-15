# Integração SQLite

## O que estava faltando na main da equipe

A main `2f3b3de` mantinha produtos e carrinho somente no estado React, sem cadastro/login persistido nem gravação de pedidos. A navegação inicial apontava temporariamente para `ListaProdutos`, que não correspondia às rotas consolidadas. O repositório pessoal de Pedro já tinha parte da persistência, mas o lockfile não incluía expo-sqlite.

Foram integrados os cadastros, autenticação, gerenciamento, perfil, confirmação e histórico do trabalho de Pedro. O dashboard do PR #3 foi aproveitado com os dados simulados substituídos por consultas ao banco. Este PR consolida essa tela e sua navegação; o PR #3 original deve ser revisto como substituído antes de um merge separado, para evitar reintroduzir a navegação e os números simulados.

## Banco e migração

- `src/database/database.js` abre `fortfit.db` e inicializa uma única instância do repositório.
- `repositorio.js` centraliza consultas parametrizadas, validações de sessão e uma fila de operações que evita intercalar consultas externas nas transações assíncronas.
- WAL, foreign keys e `PRAGMA user_version = 1` são configurados na inicialização.
- Tabelas de usuários, sessão, produtos, carrinho por usuário, pedidos, itens e recuperação de senha.
- Os dados iniciais são inseridos somente na migração inicial. Reiniciar não repõe produtos excluídos nem recria contas excluídas após essa migração.
- Bancos anteriores do Pedro sem `user_version` são migrados preservando produtos, usuários, pedidos e sessão. Senhas antigas são convertidas para BCrypt.
- O carrinho global antigo é atribuído ao usuário da sessão existente. Sem sessão válida, ele é descartado, pois não é possível determinar a qual cliente pertence. Pedidos antigos sem usuário permanecem sem atribuição; não são mostrados como compras de outro cliente.
- Uma versão de banco superior à suportada gera erro de inicialização com opção de tentar novamente.

O checkout rejeita carrinho vazio, estoque insuficiente e total diferente do apresentado. Usa um identificador por tentativa de checkout para evitar pedido/baixa duplicados. Uma falha em qualquer item reverte todas as gravações da compra.

## Roteiro no celular

1. Faça uma instalação limpa com `npm ci` e abra pelo Expo Go/emulador compatível.
2. Entre como administrador. Cadastre produto com foto, preço e estoque. Feche e reabra o app, confira a sessão e o produto. Edite e exclua o produto.
3. Saia e entre como cliente. Adicione dois produtos, altere quantidades e reabra o app. Confira o carrinho persistido.
4. Crie outro cliente e confira que ele inicia sem carrinho e sem os pedidos da primeira conta. Volte à primeira conta e confira seus itens.
5. Finalize uma compra com dados fictícios de cartão. Confira confirmação, histórico e redução do estoque. Voltar/repetir toque não deve duplicar a compra.
6. Entre como administrador e confira que o painel mostra os pedidos e totais dessa instalação, sem números fixos. Confira Hoje/7 dias/30 dias.
7. Saia e execute a recuperação de demonstração. Código incorreto não avança; código correto permite alterar uma vez. A senha antiga deixa de funcionar.
8. Exclua uma conta de cliente e confira que outra conta, seu carrinho e seus pedidos permanecem intactos.
9. Tente login incorreto e cadastro de e-mail duplicado. Confirme que o cadastro público não cria administrador.

## Evidências e limites

O PR registra os resultados executados e o GitHub Actions repete análise de sintaxe, testes SQLite, compatibilidade Expo, export Web/Android e fluxos de navegador. Relatórios de falhas de navegador são publicados como artefato do workflow. Não considerar o export Android como evidência de teste em aparelho.

Pagamento e recuperação são simulações acadêmicas locais. Não há transação financeira ou e-mail real. A proteção por perfil é local ao aplicativo e não é uma autorização de servidor. As fotos nativas são arquivos nos documentos do app e o SQLite armazena suas URIs; limpar os dados/desinstalar remove banco e fotos.

## Conferência desta preparação

- Instalação limpa com `npm ci` concluída.
- Dez testes de integração com SQLite real aprovados, sem falhas.
- Análise de sintaxe dos 27 arquivos JavaScript/JSX aprovada.
- Compatibilidade dos pacotes Expo conferida.
- Empacotamento final Web, Android e iOS concluído com `npx expo export --platform all --output-dir dist-final`.
- Testes de interface automatizados incluídos no workflow, ainda pendentes de execução. O Chromium local foi bloqueado pelo ambiente; não há aprovação de teste em aparelho registrada.

Nenhuma senha de demonstração foi incluída nos arquivos versionados. O `.env` precisa ser configurado localmente conforme o README.
