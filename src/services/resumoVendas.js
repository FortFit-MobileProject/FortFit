export function calcularResumoVendas(pedidos, produtos, periodo, agora = new Date()) {
    const inicio = new Date(agora);
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - ({ Hoje: 0, '7 dias': 6, '30 dias': 29 }[periodo] ?? 6));
    const filtrados = pedidos.filter((p) => new Date(p.criado_em) >= inicio && new Date(p.criado_em) <= agora);
    const totaisPorDia = new Map();
    let faturamentoCentavos = 0;
    for (const pedido of filtrados) {
        const dia = new Date(pedido.criado_em);
        dia.setHours(0, 0, 0, 0);
        const chave = dia.getTime();
        const centavos = Math.round(pedido.total * 100);
        totaisPorDia.set(chave, (totaisPorDia.get(chave) ?? 0) + centavos);
        faturamentoCentavos += centavos;
    }
    const faturamento = faturamentoCentavos / 100;
    const faturamentoPorDia = [...totaisPorDia]
        .sort(([diaA], [diaB]) => diaA - diaB)
        .map(([dia, centavos]) => ({ dia, total: centavos / 100 }));
    const vendas = new Map();
    for (const p of filtrados) for (const i of p.itens) {
        const anterior = vendas.get(i.produto_id) ?? { id: i.produto_id, nome: i.nome_produto, vendas: 0 };
        vendas.set(i.produto_id, { ...anterior, vendas: anterior.vendas + i.quantidade });
    }
    return {
        faturamento, faturamentoPorDia, pedidos: filtrados.length,
        ticketMedio: filtrados.length ? faturamento / filtrados.length : 0,
        maisVendidos: [...vendas.values()].sort((a, b) => b.vendas - a.vendas).slice(0, 3),
        estoqueBaixo: produtos.filter((p) => p.estoque <= 5).sort((a, b) => a.estoque - b.estoque),
        pedidosRecentes: filtrados.slice(0, 5).map((p) => ({ ...p, status: 'Em preparo', cliente: p.cliente ?? 'Cliente removido' })),
    };
}
