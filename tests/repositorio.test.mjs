import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarRepositorio } from '../src/database/repositorio.js';
import { criarCodificadorSenhas } from '../src/database/senhas.js';
import { calcularResumoVendas } from '../src/services/resumoVendas.js';

const senhaAdmin = randomBytes(16).toString('hex');
const senhaCliente = randomBytes(16).toString('hex');
const senhaNova = randomBytes(16).toString('hex');
const produto = { id:'p1', nome:'Whey', marca:'FortFit', categoria:'Suplementos', descricao:'Whey de teste', preco:29.9, estoque:5, foto:1 };
function abrir(arquivo=':memory:') {
    const sqlite = new DatabaseSync(arquivo);
    const db = {
        execAsync: async (sql) => sqlite.exec(sql),
        runAsync: async (sql,...args) => sqlite.prepare(sql).run(...args),
        getAllAsync: async (sql,...args) => sqlite.prepare(sql).all(...args),
        getFirstAsync: async (sql,...args) => sqlite.prepare(sql).get(...args),
        withTransactionAsync: async (acao) => {
            sqlite.exec('BEGIN');
            try { await acao(); sqlite.exec('COMMIT'); }
            catch (e) { sqlite.exec('ROLLBACK'); throw e; }
        },
    };
    const repo=criarRepositorio(db,{produtosIniciais:[produto],contasIniciais:[{id:'admin-fortfit',nome:'Admin Teste',email:'admin@fortfit.com',perfil:'admin',senha:senhaAdmin},{id:'cliente-fortfit',nome:'Cliente Teste',email:'cliente@fortfit.com',perfil:'cliente',senha:senhaCliente}],imagens:{whey:1},...criarCodificadorSenhas(randomBytes),gerarId:randomUUID,gerarCodigo:()=> '123456'});
    return {repo,sqlite};
}
const dadosPedido = (id='FF-teste',totalEsperado=59.8) => ({numeroPedido:id,totalEsperado,formaPagamento:'credito',endereco:{cep:'04807-040',rua:'Rua Teste',bairro:'Centro',numero:'10',complemento:''}});
const cliente = (r) => r.autenticarUsuario('cliente@fortfit.com',senhaCliente);
const admin = (r) => r.autenticarUsuario('admin@fortfit.com',senhaAdmin);

test('SQLite em arquivo preserva sessão, cadastro, produtos e carrinho após reabrir',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'fortfit-'));const path=join(dir,'fortfit.db');
 let {repo,sqlite}=abrir(path);
 try{
  await repo.inicializarBanco();await admin(repo);
  const p=await repo.criarProduto({...produto,nome:'Creatina',foto:{uri:'file:///document/foto.jpg'}});
  const u=await repo.cadastrarUsuario({nome:'David Teste',email:' DAVID@TESTE.COM ',telefone:'11999990000',senha:senhaCliente});
  await repo.autenticarUsuario(u.email,senhaCliente);await repo.adicionarItemAoCarrinho(p,2);sqlite.close();
  ({repo,sqlite}=abrir(path));await repo.inicializarBanco();
  assert.equal((await repo.buscarSessaoAtual()).id,u.id);assert.equal((await repo.listarCarrinho())[0].quantidade,2);
  assert.equal((await repo.listarProdutos()).find(i=>i.id===p.id).foto.uri,'file:///document/foto.jpg');
  assert.equal(sqlite.prepare('PRAGMA foreign_keys').get().foreign_keys,1);
 }finally{sqlite.close();rmSync(dir,{recursive:true,force:true});}
});

test('seeds idempotentes, exclusão do catálogo não repõe produtos nem recria conta excluída',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();await repo.inicializarBanco();assert.equal((await repo.listarProdutos()).length,1);
 await cliente(repo);await repo.excluirContaUsuario();await admin(repo);await repo.excluirProdutoDoBanco('p1');await repo.inicializarBanco();
 assert.equal((await repo.listarProdutos()).length,0);assert.equal(await cliente(repo),null);
 }finally{sqlite.close();}
});

test('senhas com salt/hash, e-mail normalizado e cadastro público sem privilégio admin',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();const u=await repo.cadastrarUsuario({nome:'Teste Cliente',email:' TESTE@EMAIL.COM ',senha:senhaCliente,perfil:'admin'});
 assert.equal(u.perfil,'cliente');assert.equal(u.senha,undefined);
 const hash=sqlite.prepare('SELECT senha FROM usuarios WHERE id=?').get(u.id).senha;assert.ok(hash.startsWith('$2b$'));assert.notEqual(hash,senhaCliente);
 await assert.rejects(repo.cadastrarUsuario({nome:'Outro',email:'teste@email.com',senha:senhaCliente}),/EMAIL_JA_CADASTRADO/);
 assert.equal(await repo.autenticarUsuario(u.email,'errada'),null);assert.equal((await repo.autenticarUsuario(' TESTE@EMAIL.COM ',senhaCliente)).id,u.id);
 await assert.rejects(repo.criarProduto(produto),/ACESSO_NEGADO/);
 }finally{sqlite.close();}
});

test('carrinho e pedidos isolados por cliente, exclusão não afeta outra conta',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();await cliente(repo);await repo.adicionarItemAoCarrinho(produto,2);await repo.registrarPedido(dadosPedido());await repo.adicionarItemAoCarrinho(produto,1);
 const u=await repo.cadastrarUsuario({nome:'Outro Cliente',email:'outro@teste.com',senha:senhaCliente});await repo.autenticarUsuario(u.email,senhaCliente);
 assert.deepEqual(await repo.listarCarrinho(),[]);assert.deepEqual(await repo.listarPedidosDoUsuario(),[]);await repo.adicionarItemAoCarrinho(produto,1);await repo.excluirContaUsuario();
 await cliente(repo);assert.equal((await repo.listarCarrinho())[0].quantidade,1);assert.equal((await repo.listarPedidosDoUsuario()).length,1);
 }finally{sqlite.close();}
});

test('checkout atômico e idempotente, histórico preserva preço e nome vendidos',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();await cliente(repo);await repo.adicionarItemAoCarrinho(produto,2);
 const [a,b]=await Promise.all([repo.registrarPedido(dadosPedido()),repo.registrarPedido(dadosPedido())]);assert.equal(a.id,b.id);
 assert.equal((await repo.listarProdutos())[0].estoque,3);assert.equal((await repo.listarPedidosDoUsuario()).length,1);assert.deepEqual(await repo.listarCarrinho(),[]);
 await admin(repo);await repo.atualizarProdutoNoBanco('p1',{...produto,nome:'Novo nome',preco:99});await repo.excluirProdutoDoBanco('p1');await cliente(repo);
 const p=(await repo.listarPedidosDoUsuario())[0];assert.equal(p.total,59.8);assert.equal(p.itens[0].nome_produto,'Whey');assert.equal(p.itens[0].preco_unitario,29.9);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM pedido_itens').get().n,1);
 }finally{sqlite.close();}
});

test('falta de estoque causa rollback de pedido, itens e baixa de todos os produtos',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();await admin(repo);const p=await repo.criarProduto({...produto,nome:'Z Produto'});await cliente(repo);
 await repo.adicionarItemAoCarrinho(produto,2);await repo.adicionarItemAoCarrinho(p,2);
 sqlite.prepare('UPDATE produtos SET estoque=1 WHERE id=?').run(p.id);
 await assert.rejects(repo.registrarPedido(dadosPedido('FF-falha',119.6)),/ESTOQUE_INSUFICIENTE/);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM pedidos').get().n,0);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM pedido_itens').get().n,0);
 assert.equal(sqlite.prepare('SELECT estoque FROM produtos WHERE id=?').get('p1').estoque,5);assert.equal((await repo.listarCarrinho()).length,2);
 }finally{sqlite.close();}
});

test('checkout recusa carrinho vazio, mudança de preço e quantidades inválidas',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();await cliente(repo);await assert.rejects(repo.registrarPedido(dadosPedido()),/CARRINHO_VAZIO/);
 await assert.rejects(repo.adicionarItemAoCarrinho(produto,-1),/QUANTIDADE_INVALIDA/);await assert.rejects(repo.adicionarItemAoCarrinho(produto,6),/ESTOQUE_INSUFICIENTE/);
 await repo.adicionarItemAoCarrinho(produto,2);await assert.rejects(repo.registrarPedido(dadosPedido('FF-errado',1)),/CARRINHO_ALTERADO/);
 assert.equal((await repo.listarCarrinho())[0].quantidade,2);assert.equal((await repo.listarProdutos())[0].estoque,5);
 }finally{sqlite.close();}
});

test('migra esquema do Pedro, conserva sessão/produtos/carrinho/pedidos e converte senha antiga',async()=>{
 const {repo,sqlite}=abrir();try{
 sqlite.exec(`CREATE TABLE produtos (id TEXT PRIMARY KEY,nome TEXT,marca TEXT,categoria TEXT,descricao TEXT,preco REAL,estoque INTEGER,foto_tipo TEXT,foto_valor TEXT);
 CREATE TABLE usuarios (id TEXT PRIMARY KEY,nome TEXT,email TEXT UNIQUE,telefone TEXT,senha TEXT,perfil TEXT,criado_em TEXT);
 CREATE TABLE sessao (id INTEGER PRIMARY KEY,usuario_id TEXT);
 CREATE TABLE carrinho_itens (produto_id TEXT PRIMARY KEY,quantidade INTEGER);
 CREATE TABLE pedidos (id TEXT PRIMARY KEY,criado_em TEXT,forma_pagamento TEXT,cep TEXT,rua TEXT,bairro TEXT,numero TEXT,complemento TEXT,total REAL);
 INSERT INTO produtos VALUES ('antigo','Legado','FortFit','Teste','Descrição',10,4,'asset','whey');

 INSERT INTO sessao VALUES (1,'u1'); INSERT INTO carrinho_itens VALUES ('antigo',2);`);
 sqlite.prepare('INSERT INTO usuarios VALUES (?,?,?,?,?,?,?)').run('u1','Antigo','antigo@teste.com','',senhaCliente,'cliente','2026-01-01');
 await repo.inicializarBanco();assert.equal((await repo.listarCarrinho())[0].quantidade,2);assert.equal((await repo.listarProdutos()).length,1);
 assert.ok(sqlite.prepare('SELECT senha FROM usuarios WHERE id=?').get('u1').senha.startsWith('$2b$'));assert.equal((await repo.autenticarUsuario('antigo@teste.com',senhaCliente)).id,'u1');
 assert.ok(sqlite.prepare('PRAGMA table_info(pedidos)').all().some(c=>c.name==='usuario_id'));
 }finally{sqlite.close();}
});

test('recuperação exige código correto, respeita tentativas, expiração e uso único',async()=>{
 const {repo,sqlite}=abrir();try{
 await repo.inicializarBanco();const r=await repo.iniciarRecuperacao('cliente@fortfit.com');
 await assert.rejects(repo.atualizarSenhaUsuario(r.id,senhaNova),/RECUPERACAO_INVALIDA/);
 assert.equal(await repo.validarCodigoRecuperacao(r.id,'999999'),false);assert.equal(await repo.validarCodigoRecuperacao(r.id,'123456'),true);
 await repo.atualizarSenhaUsuario(r.id,senhaNova);assert.equal(await cliente(repo),null);assert.ok(await repo.autenticarUsuario('cliente@fortfit.com',senhaNova));
 await assert.rejects(repo.atualizarSenhaUsuario(r.id,senhaCliente),/RECUPERACAO_INVALIDA/);
 const r2=await repo.iniciarRecuperacao('cliente@fortfit.com');for(let i=0;i<5;i++)assert.equal(await repo.validarCodigoRecuperacao(r2.id,'000000'),false);
 assert.equal(await repo.validarCodigoRecuperacao(r2.id,'123456'),false);
 const r3=await repo.iniciarRecuperacao('cliente@fortfit.com');sqlite.prepare('UPDATE recuperacao_senha SET expira_em=0 WHERE id=?').run(r3.id);assert.equal(await repo.validarCodigoRecuperacao(r3.id,'123456'),false);
 }finally{sqlite.close();}
});

test('dashboard calcula valores dos pedidos reais no período, incluindo estado vazio',()=>{
 const agora=new Date('2026-11-10T12:00:00');
 const p={id:'p',total:59.8,criado_em:'2026-11-10T10:00:00',itens:[{produto_id:'p1',nome_produto:'Whey',quantidade:2}]};
 const r=calcularResumoVendas([p,{...p,criado_em:'2026-09-01T10:00:00'}],[produto],'Hoje',agora);
 assert.equal(r.faturamento,59.8);assert.equal(r.pedidos,1);assert.equal(r.maisVendidos[0].vendas,2);
 assert.equal(calcularResumoVendas([],[],'Hoje',agora).ticketMedio,0);
});
