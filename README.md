# FortFit Mobile

Aplicativo acadêmico de loja fitness em React Native e Expo SDK 57. Login de cliente e administrador, catálogo, carrinho, checkout simulado, histórico e painel de vendas usam o mesmo banco SQLite local.

## Executar no celular

Requer Node.js 24 LTS e Expo Go compatível com o SDK 57, ou um development build/emulador compatível.

```sh
npm ci
cp .env.example .env
# Preencha as duas senhas de demonstração no arquivo .env.
npm start
```

Abra o QR code no Expo Go. Para um emulador Android, execute `npm run android`. Não é necessário instalar um servidor SQLite nem Docker: o banco `fortfit.db` é criado no aparelho na primeira abertura.

## Contas de demonstração

| Perfil | E-mail | Configuração local da senha |
|---|---|---|
| Administrador | admin@fortfit.com | EXPO_PUBLIC_FORTFIT_ADMIN_PASSWORD |
| Cliente | cliente@fortfit.com | EXPO_PUBLIC_FORTFIT_CLIENT_PASSWORD |

As senhas são definidas no `.env` local antes da primeira abertura. Use os valores de teste combinados com a equipe. Esse arquivo é ignorado pelo Git. Em um banco já inicializado, alterar o `.env` não redefine senhas existentes: use a recuperação de demonstração ou uma instalação limpa para novos testes. As variáveis `EXPO_PUBLIC_*` fazem parte do bundle do aplicativo, portanto servem apenas para contas locais de demonstração, sem acesso a serviços externos.

Essas contas são dados de demonstração. Novos cadastros recebem sempre o perfil cliente. As senhas são gravadas com hash BCrypt e salt individual.

## Fluxos integrados

- Cadastro, confirmação, login, restauração da sessão e logout.
- Navegação separada por perfil. As operações administrativas também conferem a sessão no repositório SQLite.
- Administração de produtos com validação, gravação aguardada e fotos locais copiadas para a pasta de documentos do app no Android/iOS.
- Catálogo, busca, filtro, detalhes e carrinho persistido por cliente.
- Checkout de crédito/débito simulado. Pedido, itens, baixa de estoque e limpeza do carrinho são gravados na mesma transação. Número do cartão e CVV ficam somente no formulário e não são persistidos.
- Histórico com nome, preço e quantidade vendidos, preservado após alteração ou exclusão do produto.
- Painel do vendedor com períodos Hoje/7 dias/30 dias, faturamento, ticket médio, estoque baixo, mais vendidos e pedidos recentes calculados dos registros locais.
- Exclusão da conta do cliente com confirmação e remoção apenas dos seus dados.
- Recuperação de senha de demonstração: código exibido no próprio aparelho, validade de dez minutos, cinco tentativas e uso único. Não há envio de e-mail.

O banco pertence à instalação do app. Dois aparelhos não compartilham estoque, contas ou pedidos. Cobrança real, envio de e-mail e sincronização entre aparelhos exigem backend e integrações externas.

## Navegador

```sh
npm run web
```

A configuração Metro inclui WASM e os cabeçalhos COOP/COEP necessários ao SQLite Web. Para testar o export:

```sh
npm run export:web
npm run preview:web
```

Abra http://localhost:8081. Para hospedá-lo, o servidor precisa enviar `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: credentialless`. O suporte Web do Expo SQLite é experimental. Não há fallback em localStorage ou AsyncStorage.

## Verificações

```sh
npm run check
npm test
npx expo install --check
npm run export:web
npx expo export --platform android --output-dir dist-android
npx playwright install --with-deps chromium
npx playwright test
```

Os testes de repositório executam SQL real com `node:sqlite`. Os testes de navegador usam o SQLite WASM do aplicativo. Exportar o bundle Android verifica empacotamento e resolução de módulos, mas não substitui executar os fluxos no aparelho.

Veja [integração e roteiro de teste](docs/INTEGRACAO_SQLITE.md).

## Origem da integração

A implementação reaproveita o trabalho de Pedro em [pedrobertanhi/FortFit-Mobile](https://github.com/pedrobertanhi/FortFit-Mobile), referência `ec03aea`, e o dashboard da equipe no [PR #3](https://github.com/FortFit-MobileProject/FortFit/pull/3), referência `dc4fceb`. A base oficial foi preservada em `2f3b3de`. O ZIP fornecido corresponde à versão anterior sem persistência.
