const { test, expect } = require('@playwright/test');
const erros = new WeakMap();
test.beforeEach(async ({page}) => {
    const lista=[];erros.set(page,lista);page.on('pageerror',e=>lista.push(e.message));
    page.on('dialog',d=>d.accept());
    await page.goto('/');
    await expect(page.getByText('ENTRAR',{exact:true})).toBeVisible();
});
test.afterEach(async ({page}) => expect(erros.get(page)).toEqual([]));
async function entrar(page,email,senha) {
    await page.getByPlaceholder('seuemail@exemplo.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(senha);
    await page.getByText('ENTRAR',{exact:true}).click();
}

test('cliente compra, reabre o app e consulta pedido persistido', async ({page}) => {
    await entrar(page,'cliente@fortfit.com',process.env.EXPO_PUBLIC_FORTFIT_CLIENT_PASSWORD);
    await expect(page.getByText('Encontre seus itens fitness')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Encontre seus itens fitness')).toBeVisible();
    await page.getByText('Creatina Monohidratada 300g',{exact:true}).click();
    await page.getByText('ADICIONAR AO CARRINHO',{exact:true}).click();
    await page.getByRole('button',{name:'Carrinho',exact:true}).click();
    await expect(page.getByText('Creatina Monohidratada 300g', { exact: true }).filter({ visible: true })).toBeVisible();
    await page.getByText('CONTINUAR PARA PAGAMENTO',{exact:true}).click();
    await page.getByPlaceholder('0000 0000 0000 0000').fill('4111111111111111');
    await page.getByPlaceholder('NOME COMPLETO',{exact:true}).fill('Cliente Teste');
    await page.getByPlaceholder('MM/AA').fill('1230');
    await page.getByPlaceholder('000',{exact:true}).fill('123');
    await page.getByPlaceholder('00000-000').fill('04807040');
    await page.getByPlaceholder('Nome da rua').fill('Rua Teste');
    await page.getByPlaceholder('Bairro',{exact:true}).fill('Centro');
    await page.getByPlaceholder('100',{exact:true}).fill('10');
    await page.getByText('FINALIZAR PAGAMENTO',{exact:true}).click();
    await expect(page.getByText('Compra realizada!',{exact:true})).toBeVisible();
    const numero = await page.getByText(/^FF-/).innerText();
    await page.getByText('VOLTAR PARA A LOJA',{exact:true}).click();
    await page.reload();
    await page.getByRole('button',{name:'Meu perfil',exact:true}).click();
    await page.getByText('Meus pedidos',{exact:true}).click();
    await expect(page.getByText(`Pedido ${numero}`, { exact: true })).toBeVisible();
    await expect(page.getByText('Creatina Monohidratada 300g × 1',{exact:true})).toBeVisible();
});

test('admin consulta dashboard vazio, cria produto e preserva ao reiniciar', async ({page}) => {
    await entrar(page,'admin@fortfit.com',process.env.EXPO_PUBLIC_FORTFIT_ADMIN_PASSWORD);
    await page.getByText('Painel de vendas',{exact:true}).click();
    await expect(page.getByText('Nenhuma venda no período.')).toBeVisible();
    await page.getByText('Novo Produto',{exact:true}).click();
    // Cadastro tem campos ordenados, todos controlados pelo formulário.
    await page.getByPlaceholder('Ex: Whey Protein Concentrado 900g').fill('Produto SQLite Teste');
    await page.getByPlaceholder('0,00',{exact:true}).fill('39,90');
    await page.getByPlaceholder('0',{exact:true}).fill('6');
    await page.getByPlaceholder('Conte os detalhes do produto...').fill('Produto persistido no teste de integração.');
    await page.getByText('Suplementos',{exact:true}).click();
    await page.getByText('CADASTRAR PRODUTO',{exact:true}).click();
    await page.getByText('Meus Produtos',{exact:true}).click();
    await expect(page.getByText('Produto SQLite Teste',{exact:true})).toBeVisible();
    await page.reload();
    await page.getByText('Gerenciar produtos',{exact:true}).click();
    await expect(page.getByText('Produto SQLite Teste',{exact:true})).toBeVisible();
});
