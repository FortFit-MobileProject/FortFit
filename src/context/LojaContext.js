import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { obterRepositorio, persistirFotoProduto } from '../database/database';

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [pedidosLoja, setPedidosLoja] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erroInicializacao, setErroInicializacao] = useState(false);

    const carregarDados = useCallback(async () => {
        const repo = await obterRepositorio();
        const sessao = await repo.buscarSessaoAtual();
        const produtosBanco = await repo.listarProdutos();
        const carrinhoBanco = sessao?.perfil === 'cliente' ? await repo.listarCarrinho() : [];
        const pedidosBanco = sessao?.perfil === 'admin' ? await repo.listarPedidosDaLoja() : [];
        setUsuario(sessao);
        setProdutos(produtosBanco);
        setCarrinho(carrinhoBanco);
        setPedidosLoja(pedidosBanco);
    }, []);

    const prepararLoja = useCallback(async () => {
        setCarregando(true);
        setErroInicializacao(false);
        try { await carregarDados(); }
        catch { setErroInicializacao(true); }
        finally { setCarregando(false); }
    }, [carregarDados]);
    useEffect(() => { prepararLoja(); }, [prepararLoja]);

    // Funções estáveis evitam recarregamento contínuo do histórico de pedidos.
    const acoes = useMemo(() => {
        const executar = async (metodo, ...args) => (await obterRepositorio())[metodo](...args);
        const alterar = async (metodo, ...args) => {
            const resultado = await executar(metodo, ...args);
            await carregarDados();
            return resultado;
        };
        return {
            entrar: (email, senha) => alterar('autenticarUsuario', email, senha),
            cadastrarUsuario: (dados) => executar('cadastrarUsuario', dados),
            sair: () => alterar('encerrarSessao'),
            excluirMinhaConta: () => alterar('excluirContaUsuario'),
            iniciarRecuperacao: (email) => executar('iniciarRecuperacao', email),
            validarCodigoRecuperacao: (id, codigo) => executar('validarCodigoRecuperacao', id, codigo),
            redefinirSenha: (id, senha) => alterar('atualizarSenhaUsuario', id, senha),
            adicionarProduto: async (dados) => alterar('criarProduto', { ...dados, marca: dados.marca ?? 'FortFit', foto: await persistirFotoProduto(dados.foto) }),
            atualizarProduto: async (id, dados) => alterar('atualizarProdutoNoBanco', id, { ...dados, marca: dados.marca ?? 'FortFit', foto: await persistirFotoProduto(dados.foto) }),
            excluirProduto: (id) => alterar('excluirProdutoDoBanco', id),
            adicionarAoCarrinho: (produto, quantidade = 1) => alterar('adicionarItemAoCarrinho', produto, quantidade),
            alterarQuantidade: (id, quantidade) => alterar('alterarQuantidadeNoCarrinho', id, quantidade),
            removerDoCarrinho: (id) => alterar('removerItemDoCarrinho', id),
            limparCarrinho: () => alterar('limparCarrinhoNoBanco'),
            finalizarPedido: (dados) => alterar('registrarPedido', dados),
            listarMeusPedidos: () => executar('listarPedidosDoUsuario'),
        };
    }, [carregarDados]);

    const quantidadeCarrinho = carrinho.reduce((s, i) => s + i.quantidade, 0);
    const totalCarrinho = carrinho.reduce((s, i) => s + Math.round(i.produto.preco * 100) * i.quantidade, 0) / 100;
    const valor = useMemo(() => ({ produtos, carrinho, pedidosLoja, usuario, carregando, erroInicializacao, tentarNovamente: prepararLoja, quantidadeCarrinho, totalCarrinho, ...acoes }), [produtos, carrinho, pedidosLoja, usuario, carregando, erroInicializacao, prepararLoja, quantidadeCarrinho, totalCarrinho, acoes]);
    return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>;
}

export function useLoja() {
    const contexto = useContext(LojaContext);
    if (!contexto) throw new Error('useLoja deve ser utilizado dentro de LojaProvider');
    return contexto;
}
