import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportarVendas(pedidos, produtos, agora = new Date()) {
  const nome = 'fortfit-vendas-' + agora.toISOString().replace(/[:.]/g, '-') + '.json';
  const conteudo = JSON.stringify({
    versao: 1,
    moeda: 'BRL',
    geradoEm: agora.toISOString(),
    pedidos: pedidos.map(({ criado_em, total, itens }) => ({
      data: criado_em.slice(0, 10),
      totalCentavos: Math.round(total * 100),
      itens: itens.map(({ nome_produto, quantidade }) => ({
        nome: nome_produto,
        quantidade,
      })),
    })),
    produtos: produtos.map(({ nome, estoque }) => ({ nome, estoque })),
  }, null, 2);

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  if (!await Sharing.isAvailableAsync()) {
    throw new Error('O compartilhamento não está disponível neste aparelho.');
  }
  const arquivo = new File(Paths.cache, nome);
  arquivo.write(conteudo);
  await Sharing.shareAsync(arquivo.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Exportar vendas do FortFit',
  });
}
