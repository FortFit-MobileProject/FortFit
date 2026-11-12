// Regras de persistência independentes do Expo para testar as consultas em SQLite real.
export function criarRepositorio(db, { produtosIniciais = [], contasIniciais = [], imagens = {}, codificarSenha, conferirSenha, gerarId, gerarCodigo }) {
    let fila = Promise.resolve();
    const serializar = (acao) => {
        const resultado = fila.then(acao);
        fila = resultado.catch(() => {});
        return resultado;
    };
    const transacao = async (acao) => {
        let resultado;
        await db.withTransactionAsync(async () => { resultado = await acao(); });
        return resultado;
    };
    const normalizarEmail = (email = '') => email.trim().toLowerCase();
    const usuarioDaLinha = (linha) => linha ? ({ id: linha.id, nome: linha.nome, email: linha.email, telefone: linha.telefone, perfil: linha.perfil }) : null;
    const exigirUsuario = async (perfil) => {
        const linha = await db.getFirstAsync('SELECT u.* FROM sessao s JOIN usuarios u ON u.id = s.usuario_id WHERE s.id = 1');
        if (!linha || (perfil && linha.perfil !== perfil)) throw new Error('ACESSO_NEGADO');
        return linha;
    };
    const fotoParaBanco = (foto) => {
        if (typeof foto === 'string' || foto?.uri) return ['uri', foto.uri ?? foto];
        const entrada = Object.entries(imagens).find(([, valor]) => valor === foto);
        return entrada ? ['asset', entrada[0]] : [null, null];
    };
    const produtoDaLinha = (p) => ({ id: p.id, nome: p.nome, marca: p.marca, categoria: p.categoria, descricao: p.descricao, preco: Number(p.preco), estoque: Number(p.estoque), foto: p.foto_tipo === 'asset' ? imagens[p.foto_valor] : p.foto_valor ? { uri: p.foto_valor } : null });
    const inserirProduto = async (p) => db.runAsync('INSERT INTO produtos (id,nome,marca,categoria,descricao,preco,estoque,foto_tipo,foto_valor) VALUES (?,?,?,?,?,?,?,?,?)', p.id, p.nome, p.marca, p.categoria, p.descricao, p.preco, p.estoque, ...fotoParaBanco(p.foto));
    const validarProduto = (p) => {
        if (![p.nome, p.marca, p.categoria, p.descricao].every((v) => typeof v === 'string' && v.trim()) || !Number.isFinite(p.preco) || p.preco <= 0 || !Number.isSafeInteger(p.estoque) || p.estoque < 0) throw new Error('PRODUTO_INVALIDO');
    };
    const listarCarrinhoInterno = async (usuarioId) => {
        const linhas = await db.getAllAsync('SELECT p.*, c.quantidade FROM carrinho_itens c JOIN produtos p ON p.id = c.produto_id WHERE c.usuario_id = ? ORDER BY p.nome', usuarioId);
        return linhas.map((p) => ({ produto: produtoDaLinha(p), quantidade: Number(p.quantidade) }));
    };
    const listarPedidosInterno = async (usuarioId) => {
        const pedidos = usuarioId ? await db.getAllAsync('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC', usuarioId) : await db.getAllAsync('SELECT p.*, u.nome AS cliente FROM pedidos p LEFT JOIN usuarios u ON u.id = p.usuario_id ORDER BY criado_em DESC');
        return Promise.all(pedidos.map(async (p) => ({ ...p, total: Number(p.total), itens: await db.getAllAsync('SELECT * FROM pedido_itens WHERE pedido_id = ?', p.id) })));
    };
    const api = {
        inicializarBanco: () => serializar(async () => {
            await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
            const versao = await db.getFirstAsync('PRAGMA user_version');
            if (versao.user_version > 1) throw new Error('BANCO_MAIS_RECENTE');
            if (versao.user_version === 1) return;
            await transacao(async () => {
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, marca TEXT NOT NULL, categoria TEXT NOT NULL, descricao TEXT NOT NULL, preco REAL NOT NULL, estoque INTEGER NOT NULL, foto_tipo TEXT, foto_valor TEXT);
                    CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, telefone TEXT, senha TEXT NOT NULL, perfil TEXT NOT NULL CHECK(perfil IN ('cliente','admin')), criado_em TEXT NOT NULL);
                    CREATE TABLE IF NOT EXISTS sessao (id INTEGER PRIMARY KEY CHECK(id = 1), usuario_id TEXT NOT NULL REFERENCES usuarios(id));
                    CREATE TABLE IF NOT EXISTS pedidos (id TEXT PRIMARY KEY NOT NULL, criado_em TEXT NOT NULL, forma_pagamento TEXT NOT NULL, cep TEXT NOT NULL, rua TEXT NOT NULL, bairro TEXT NOT NULL, numero TEXT NOT NULL, complemento TEXT, total REAL NOT NULL, usuario_id TEXT);
                    CREATE TABLE IF NOT EXISTS pedido_itens (id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id TEXT NOT NULL REFERENCES pedidos(id), produto_id TEXT NOT NULL, nome_produto TEXT NOT NULL, preco_unitario REAL NOT NULL, quantidade INTEGER NOT NULL);
                    CREATE TABLE IF NOT EXISTS recuperacao_senha (id TEXT PRIMARY KEY NOT NULL, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, codigo TEXT NOT NULL, expira_em INTEGER NOT NULL, tentativas INTEGER NOT NULL DEFAULT 0, verificado INTEGER NOT NULL DEFAULT 0);
                `);
                const colunasPedidos = await db.getAllAsync('PRAGMA table_info(pedidos)');
                if (!colunasPedidos.some((c) => c.name === 'usuario_id')) await db.execAsync('ALTER TABLE pedidos ADD COLUMN usuario_id TEXT');
                const carrinhoAntigo = await db.getAllAsync('PRAGMA table_info(carrinho_itens)');
                if (carrinhoAntigo.length && !carrinhoAntigo.some((c) => c.name === 'usuario_id')) await db.execAsync('ALTER TABLE carrinho_itens RENAME TO carrinho_legado');
                await db.execAsync('CREATE TABLE IF NOT EXISTS carrinho_itens (usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, produto_id TEXT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE, quantidade INTEGER NOT NULL CHECK(quantidade > 0), PRIMARY KEY(usuario_id, produto_id));');
                if (carrinhoAntigo.length && !carrinhoAntigo.some((c) => c.name === 'usuario_id')) {
                    await db.execAsync('INSERT INTO carrinho_itens (usuario_id,produto_id,quantidade) SELECT s.usuario_id,c.produto_id,c.quantidade FROM carrinho_legado c JOIN produtos p ON p.id=c.produto_id JOIN sessao s ON s.id=1 JOIN usuarios u ON u.id=s.usuario_id WHERE c.quantidade > 0; DROP TABLE carrinho_legado;');
                }
                // Seeds somente na primeira migração. Excluir todos os produtos não repõe o catálogo.
                const quantidade = await db.getFirstAsync('SELECT COUNT(*) AS total FROM produtos');
                if (!quantidade.total) for (const p of produtosIniciais) await inserirProduto(p);
                for (const conta of contasIniciais) {
                    const u = [conta.id, conta.nome, normalizarEmail(conta.email), conta.senha, conta.perfil];
                    const existente = await db.getFirstAsync('SELECT id FROM usuarios WHERE email = ?', u[2]);
                    if (!existente) await db.runAsync('INSERT INTO usuarios (id,nome,email,telefone,senha,perfil,criado_em) VALUES (?,?,?,?,?,?,?)', u[0], u[1], u[2], '', await codificarSenha(u[3]), u[4], new Date().toISOString());
                }
                // Atualiza as credenciais de instalações anteriores sem perder os cadastros.
                for (const u of await db.getAllAsync('SELECT id,senha FROM usuarios')) {
                    if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(u.senha)) await db.runAsync('UPDATE usuarios SET senha = ? WHERE id = ?', await codificarSenha(u.senha), u.id);
                }
                await db.execAsync('CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id,criado_em); PRAGMA user_version = 1;');
            });
        }),
        cadastrarUsuario: (dados) => serializar(async () => {
            const email = normalizarEmail(dados.email);
            if (!dados.nome?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof dados.senha !== 'string' || dados.senha.length < 6 || dados.senha.length > 72) throw new Error('USUARIO_INVALIDO');
            if (await db.getFirstAsync('SELECT id FROM usuarios WHERE email = ?', email)) throw new Error('EMAIL_JA_CADASTRADO');
            const u = { id: gerarId(), nome: dados.nome.trim(), email, telefone: dados.telefone?.trim() ?? '', perfil: 'cliente' };
            await db.runAsync('INSERT INTO usuarios (id,nome,email,telefone,senha,perfil,criado_em) VALUES (?,?,?,?,?,?,?)', u.id, u.nome, u.email, u.telefone, await codificarSenha(dados.senha), u.perfil, new Date().toISOString());
            return u;
        }),
        autenticarUsuario: (email, senha) => serializar(async () => {
            const linha = await db.getFirstAsync('SELECT * FROM usuarios WHERE email = ?', normalizarEmail(email));
            if (!linha || !await conferirSenha(senha, linha.senha)) return null;
            await db.runAsync('INSERT OR REPLACE INTO sessao (id,usuario_id) VALUES (1,?)', linha.id);
            return usuarioDaLinha(linha);
        }),
        buscarSessaoAtual: () => serializar(async () => usuarioDaLinha(await db.getFirstAsync('SELECT u.* FROM sessao s JOIN usuarios u ON u.id = s.usuario_id WHERE s.id = 1'))),
        encerrarSessao: () => serializar(() => db.runAsync('DELETE FROM sessao')),
        excluirContaUsuario: () => serializar(() => transacao(async () => {
            const u = await exigirUsuario();
            if (u.perfil === 'admin') throw new Error('CONTA_ADMINISTRATIVA');
            await db.runAsync('DELETE FROM pedido_itens WHERE pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = ?)', u.id);
            await db.runAsync('DELETE FROM pedidos WHERE usuario_id = ?', u.id);
            await db.runAsync('DELETE FROM carrinho_itens WHERE usuario_id = ?', u.id);
            await db.runAsync('DELETE FROM recuperacao_senha WHERE usuario_id = ?', u.id);
            await db.runAsync('DELETE FROM sessao WHERE usuario_id = ?', u.id);
            await db.runAsync('DELETE FROM usuarios WHERE id = ?', u.id);
        })),
        iniciarRecuperacao: (email) => serializar(async () => {
            const u = await db.getFirstAsync('SELECT id FROM usuarios WHERE email = ?', normalizarEmail(email));
            if (!u) throw new Error('CONTA_NAO_ENCONTRADA');
            const id = gerarId(), codigo = gerarCodigo();
            await transacao(async () => {
                await db.runAsync('DELETE FROM recuperacao_senha WHERE usuario_id = ?', u.id);
                await db.runAsync('INSERT INTO recuperacao_senha (id,usuario_id,codigo,expira_em) VALUES (?,?,?,?)', id, u.id, await codificarSenha(codigo), Date.now() + 10 * 60 * 1000);
            });
            return { id, codigo }; // Demonstração local. Não existe serviço de envio de e-mail.
        }),
        validarCodigoRecuperacao: (id, codigo) => serializar(async () => {
            const r = await db.getFirstAsync('SELECT * FROM recuperacao_senha WHERE id = ?', id);
            if (!r || r.expira_em < Date.now() || r.tentativas >= 5) return false;
            await db.runAsync('UPDATE recuperacao_senha SET tentativas = tentativas + 1 WHERE id = ?', id);
            if (!await conferirSenha(codigo, r.codigo)) return false;
            await db.runAsync('UPDATE recuperacao_senha SET verificado = 1 WHERE id = ?', id);
            return true;
        }),
        atualizarSenhaUsuario: (id, senha) => serializar(() => transacao(async () => {
            const r = await db.getFirstAsync('SELECT * FROM recuperacao_senha WHERE id = ?', id);
            if (!r || !r.verificado || r.expira_em < Date.now() || typeof senha !== 'string' || senha.length < 6 || senha.length > 72) throw new Error('RECUPERACAO_INVALIDA');
            await db.runAsync('UPDATE usuarios SET senha = ? WHERE id = ?', await codificarSenha(senha), r.usuario_id);
            await db.runAsync('DELETE FROM sessao WHERE usuario_id = ?', r.usuario_id);
            await db.runAsync('DELETE FROM recuperacao_senha WHERE usuario_id = ?', r.usuario_id);
            return true;
        })),
        listarProdutos: () => serializar(async () => (await db.getAllAsync('SELECT * FROM produtos ORDER BY nome')).map(produtoDaLinha)),
        criarProduto: (dados) => serializar(async () => {
            await exigirUsuario('admin'); validarProduto(dados);
            const p = { ...dados, id: gerarId() }; await inserirProduto(p); return p;
        }),
        atualizarProdutoNoBanco: (id, dados) => serializar(() => transacao(async () => {
            await exigirUsuario('admin'); validarProduto(dados);
            const r = await db.runAsync('UPDATE produtos SET nome=?,marca=?,categoria=?,descricao=?,preco=?,estoque=?,foto_tipo=?,foto_valor=? WHERE id=?', dados.nome, dados.marca, dados.categoria, dados.descricao, dados.preco, dados.estoque, ...fotoParaBanco(dados.foto), id);
            if (!r.changes) throw new Error('PRODUTO_NAO_ENCONTRADO');
            await db.runAsync('DELETE FROM carrinho_itens WHERE produto_id = ? AND ? = 0', id, dados.estoque);
            await db.runAsync('UPDATE carrinho_itens SET quantidade = MIN(quantidade,?) WHERE produto_id = ?', dados.estoque, id);
        })),
        excluirProdutoDoBanco: (id) => serializar(() => transacao(async () => {
            await exigirUsuario('admin');
            await db.runAsync('DELETE FROM carrinho_itens WHERE produto_id = ?', id);
            await db.runAsync('DELETE FROM produtos WHERE id = ?', id);
        })),
        listarCarrinho: () => serializar(async () => {
            const u = await exigirUsuario('cliente'); return listarCarrinhoInterno(u.id);
        }),
        adicionarItemAoCarrinho: (produto, quantidade) => serializar(async () => {
            const u = await exigirUsuario('cliente');
            if (!Number.isSafeInteger(quantidade) || quantidade < 1) throw new Error('QUANTIDADE_INVALIDA');
            const p = await db.getFirstAsync('SELECT estoque FROM produtos WHERE id = ?', produto.id);
            const item = await db.getFirstAsync('SELECT quantidade FROM carrinho_itens WHERE usuario_id = ? AND produto_id = ?', u.id, produto.id);
            if (!p || (item?.quantidade ?? 0) + quantidade > p.estoque) throw new Error('ESTOQUE_INSUFICIENTE');
            await db.runAsync('INSERT INTO carrinho_itens (usuario_id,produto_id,quantidade) VALUES (?,?,?) ON CONFLICT(usuario_id,produto_id) DO UPDATE SET quantidade=excluded.quantidade', u.id, produto.id, (item?.quantidade ?? 0) + quantidade);
        }),
        alterarQuantidadeNoCarrinho: (id, quantidade) => serializar(async () => {
            const u = await exigirUsuario('cliente');
            if (!Number.isSafeInteger(quantidade) || quantidade < 0) throw new Error('QUANTIDADE_INVALIDA');
            if (!quantidade) return db.runAsync('DELETE FROM carrinho_itens WHERE usuario_id=? AND produto_id=?', u.id, id);
            const p = await db.getFirstAsync('SELECT estoque FROM produtos WHERE id=?', id);
            if (!p || quantidade > p.estoque) throw new Error('ESTOQUE_INSUFICIENTE');
            await db.runAsync('UPDATE carrinho_itens SET quantidade=? WHERE usuario_id=? AND produto_id=?', quantidade, u.id, id);
        }),
        removerItemDoCarrinho: (id) => serializar(async () => {
            const u = await exigirUsuario('cliente'); await db.runAsync('DELETE FROM carrinho_itens WHERE usuario_id=? AND produto_id=?', u.id, id);
        }),
        limparCarrinhoNoBanco: () => serializar(async () => {
            const u = await exigirUsuario('cliente'); await db.runAsync('DELETE FROM carrinho_itens WHERE usuario_id=?', u.id);
        }),
        registrarPedido: (dados) => serializar(() => transacao(async () => {
            const u = await exigirUsuario('cliente');
            const existente = await db.getFirstAsync('SELECT * FROM pedidos WHERE id=?', dados.numeroPedido);
            if (existente) {
                if (existente.usuario_id !== u.id) throw new Error('PEDIDO_INVALIDO');
                return existente;
            }
            const itens = await listarCarrinhoInterno(u.id);
            if (!itens.length) throw new Error('CARRINHO_VAZIO');
            if (!['credito','debito'].includes(dados.formaPagamento) || !/^\d{8}$/.test((dados.endereco?.cep ?? '').replace(/\D/g,'')) || !['rua','bairro','numero'].every((c) => dados.endereco[c]?.trim())) throw new Error('PEDIDO_INVALIDO');
            const total = itens.reduce((s,i) => s + Math.round(i.produto.preco * 100) * i.quantidade, 0) / 100;
            // Se preço/quantidade mudou após abrir o checkout, o cliente precisa revisar.
            if (Math.round(dados.totalEsperado * 100) !== Math.round(total * 100)) throw new Error('CARRINHO_ALTERADO');
            const e = dados.endereco;
            await db.runAsync('INSERT INTO pedidos (id,criado_em,forma_pagamento,cep,rua,bairro,numero,complemento,total,usuario_id) VALUES (?,?,?,?,?,?,?,?,?,?)', dados.numeroPedido, new Date().toISOString(), dados.formaPagamento, e.cep, e.rua.trim(), e.bairro.trim(), e.numero.trim(), e.complemento?.trim() ?? '', total, u.id);
            for (const i of itens) {
                const r = await db.runAsync('UPDATE produtos SET estoque=estoque-? WHERE id=? AND estoque>=?', i.quantidade, i.produto.id, i.quantidade);
                if (!r.changes) throw new Error('ESTOQUE_INSUFICIENTE');
                await db.runAsync('INSERT INTO pedido_itens (pedido_id,produto_id,nome_produto,preco_unitario,quantidade) VALUES (?,?,?,?,?)', dados.numeroPedido, i.produto.id, i.produto.nome, i.produto.preco, i.quantidade);
            }
            await db.runAsync('DELETE FROM carrinho_itens WHERE usuario_id=?', u.id);
            return { id: dados.numeroPedido, total };
        })),
        listarPedidosDoUsuario: () => serializar(async () => {
            const u = await exigirUsuario('cliente'); return listarPedidosInterno(u.id);
        }),
        listarPedidosDaLoja: () => serializar(async () => { await exigirUsuario('admin'); return listarPedidosInterno(); }),
    };
    return api;
}
