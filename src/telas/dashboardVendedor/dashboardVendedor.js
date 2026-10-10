import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const PERIODOS = ["Hoje", "7 dias", "30 dias"];

const DADOS_POR_PERIODO = {
  Hoje: { faturamento: 459.7, pedidos: 4 },
  "7 dias": { faturamento: 3280.5, pedidos: 31 },
  "30 dias": { faturamento: 12840.9, pedidos: 118 },
};

const TOTAL_PRODUTOS_ATIVOS = 7;

const MAIS_VENDIDOS_MOCK = [
  { id: "1", nome: "Whey Protein Concentrado 900g", vendas: 42 },
  { id: "2", nome: "Creatina Monohidratada 300g", vendas: 28 },
  { id: "3", nome: "Barra de Proteína Chocolate", vendas: 19 },
];

const ESTOQUE_BAIXO_MOCK = [
  { id: "4", nome: "Camiseta Dry-Fit FortFit", estoque: 0 },
  { id: "5", nome: "Kit Halteres 2kg", estoque: 3 },
  { id: "6", nome: "Luvas de Treino Pro", estoque: 5 },
];

const PEDIDOS_RECENTES_MOCK = [
  { id: "1041", cliente: "João Silva", total: 129.9, status: "Pendente" },
  { id: "1042", cliente: "Maria Oliveira", total: 209.8, status: "Enviado" },
  { id: "1043", cliente: "Carlos Santos", total: 49.9, status: "Entregue" },
  { id: "1044", cliente: "Ana Costa", total: 79.9, status: "Cancelado" },
];

export default function DashboardVendedor(props) {
  const navigation = props.navigation;

  const [periodoSelecionado, setPeriodoSelecionado] = useState("7 dias");

  const nomeVendedor = "Vendedor";

  function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function selecionarPeriodo(periodo) {
    setPeriodoSelecionado(periodo);
  }

  function irParaCadastroProduto() {
    if (navigation) {
      navigation.navigate("CadastroProduto");
    } else {
      console.error("Navegação ainda não disponível.");
    }
  }

  function irParaMeusProdutos() {
    if (navigation) {
      navigation.navigate("ListaProdutosAdmin");
    } else {
      console.error("Navegação ainda não disponível.");
    }
  }

  function handleVerPedidos(pedido) {
    console.log("Ver pedido:", pedido.id);
  }

  function estiloDoStatus(status) {
    if (status === "Enviado") {
      return styles.statusEnviado;
    }
    if (status === "Entregue") {
      return styles.statusEntregue;
    }
    if (status === "Cancelado") {
      return styles.statusCancelado;
    }
    return styles.statusPendente;
  }

  function estiloTextoDoStatus(status) {
    if (status === "Enviado" || status === "Entregue") {
      return styles.statusTextoEscuro;
    }
    return styles.statusTexto;
  }

  const dadosPeriodo = DADOS_POR_PERIODO[periodoSelecionado];

  let ticketMedio = 0;
  if (dadosPeriodo.pedidos > 0) {
    ticketMedio = dadosPeriodo.faturamento / dadosPeriodo.pedidos;
  }

  const maiorVenda = MAIS_VENDIDOS_MOCK[0].vendas;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ------- CABEÇALHO ------*/}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSaudacao}>Olá, {nomeVendedor}!</Text>
            <Text style={styles.headerTitle}>Painel de Vendas</Text>
          </View>
          <View style={styles.headerIcone}>
            <Feather name="bar-chart-2" size={20} color={COLORS.primary} />
          </View>
        </View>

        {/*------ FILTRO DE PERÍODO ------*/}
        <View style={styles.periodosRow}>
          {PERIODOS.map(function (periodo) {
            const estaSelecionado = periodo === periodoSelecionado;

            let estiloChip = styles.chip;
            if (estaSelecionado == true) {
              estiloChip = styles.chipSelecionado;
            }

            let estiloTextoChip = styles.chipText;
            if (estaSelecionado == true) {
              estiloTextoChip = styles.chipTextSelecionado;
            }

            return (
              <TouchableOpacity
                key={periodo}
                style={estiloChip}
                onPress={function () {
                  selecionarPeriodo(periodo);
                }}
              >
                <Text style={estiloTextoChip}>{periodo}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/*---------- CARD DE DESTAQUE: FATURAMENTO ----------*/}
        <View style={styles.cardDestaque}>
          <Text style={styles.cardDestaqueLabel}>FATURAMENTO</Text>
          <Text style={styles.cardDestaqueValor}>{formatarPreco(dadosPeriodo.faturamento)}</Text>
          <Text style={styles.cardDestaqueSub}>
            {dadosPeriodo.pedidos} pedidos em {periodoSelecionado.toLowerCase()}
          </Text>
        </View>

        {/*---------- CARDS DE NÚMEROS ----------*/}
        <View style={styles.numerosRow}>
          <View style={styles.numeroCard}>
            <Feather name="shopping-bag" size={18} color={COLORS.primary} />
            <Text style={styles.numeroValor}>{dadosPeriodo.pedidos}</Text>
            <Text style={styles.numeroLabel}>PEDIDOS</Text>
          </View>

          <View style={styles.numeroCard}>
            <Feather name="trending-up" size={18} color={COLORS.primary} />
            <Text style={styles.numeroValor} numberOfLines={1} adjustsFontSizeToFit>
              {formatarPreco(ticketMedio)}
            </Text>
            <Text style={styles.numeroLabel}>TICKET MÉDIO</Text>
          </View>

          <View style={styles.numeroCard}>
            <Feather name="package" size={18} color={COLORS.primary} />
            <Text style={styles.numeroValor} numberOfLines={1} adjustsFontSizeToFit>
              {TOTAL_PRODUTOS_ATIVOS}
            </Text>
            <Text style={styles.numeroLabel}>PRODUTOS</Text>
          </View>
        </View>

        {/*---------- AÇÕES RÁPIDAS ----------*/}
        <View style={styles.acoesRow}>
          <TouchableOpacity
            style={styles.acaoPrimaria}
            onPress={irParaCadastroProduto}
          >
            <Feather name="plus" size={18} color={COLORS.background} />
            <Text style={styles.acaoPrimariaTexto}>Novo Produto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acaoSecundaria}
            onPress={irParaMeusProdutos}
          >
            <Feather name="list" size={18} color={COLORS.primary} />
            <Text style={styles.acaoSecundariaTexto}>Meus Produtos</Text>
          </TouchableOpacity>
        </View>

        {/*---------- ESTOQUE BAIXO ----------*/}
        <Text style={styles.secaoTitulo}>ATENÇÃO: ESTOQUE BAIXO</Text>
        <View style={styles.secaoCard}>
          {ESTOQUE_BAIXO_MOCK.map(function (produto, indice) {
            let textoEstoque = produto.estoque + " restantes";
            let estiloBadge = styles.estoqueBadge;
            if (produto.estoque === 0) {
              textoEstoque = "Esgotado";
              estiloBadge = styles.estoqueBadgeVazio;
            }

            let estiloLinha = styles.linha;
            if (indice === ESTOQUE_BAIXO_MOCK.length - 1) {
              estiloLinha = styles.linhaUltima;
            }

            return (
              <View key={produto.id} style={estiloLinha}>
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.linhaNome} numberOfLines={1}>
                  {produto.nome}
                </Text>
                <View style={estiloBadge}>
                  <Text style={styles.estoqueTexto}>{textoEstoque}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/*---------- MAIS VENDIDOS ----------*/}
        <Text style={styles.secaoTitulo}>MAIS VENDIDOS</Text>
        <View style={styles.secaoCard}>
          {MAIS_VENDIDOS_MOCK.map(function (produto, indice) {
            const percentualVenda = (produto.vendas / maiorVenda) * 100;

            let estiloLinha = styles.linhaColuna;
            if (indice === MAIS_VENDIDOS_MOCK.length - 1) {
              estiloLinha = styles.linhaColunaUltima;
            }

            return (
              <View key={produto.id} style={estiloLinha}>
                <View style={styles.rankingTopo}>
                  <Text style={styles.rankingPosicao}>{indice + 1}º</Text>
                  <Text style={styles.linhaNome} numberOfLines={1}>
                    {produto.nome}
                  </Text>
                  <Text style={styles.rankingVendas} numberOfLines={1} adjustsFontSizeToFit>
                    {produto.vendas} un.
                  </Text>
                </View>
                <View style={styles.barraFundo}>
                  <View
                    style={[
                      styles.barraPreenchida,
                      { width: percentualVenda + "%" },
                    ]}
                  ></View>
                </View>
              </View>
            );
          })}
        </View>

        {/*---------- PEDIDOS RECENTES ----------*/}

        <Text style={styles.secaoTitulo}>PEDIDOS RECENTES</Text>
        <View style={styles.secaoCard}>
          {PEDIDOS_RECENTES_MOCK.map(function (pedido, indice) {
            let estiloLinha = styles.linha;
            if (indice === PEDIDOS_RECENTES_MOCK.length - 1) {
              estiloLinha = styles.linhaUltima;
            }

            return (
              <TouchableOpacity
                key={pedido.id}
                style={estiloLinha}
                onPress={function () {
                  handleVerPedidos(pedido);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pedidoCliente}>
                    #{pedido.id} · {pedido.cliente}
                  </Text>
                  <Text style={styles.pedidoTotal} numberOfLines={1} adjustsFontSizeToFit>
                    {formatarPreco(pedido.total)}
                  </Text>
                </View>
                <View style={estiloDoStatus(pedido.status)}>
                  <Text style={estiloTextoDoStatus(pedido.status)}>
                    {pedido.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerSaudacao: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.h1,
    fontWeight: "700",
    marginTop: 2,
  },
  headerIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  periodosRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelecionado: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  chipTextSelecionado: {
    color: COLORS.background,
    fontSize: SIZES.small,
    fontWeight: "700",
  },
  cardDestaque: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 20,
    marginBottom: 12,
  },
  cardDestaqueLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cardDestaqueValor: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "700",
    marginTop: 6,
  },
  cardDestaqueSub: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  numerosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  numeroCard: {
    width: "31%",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  numeroValor: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: "700",
    marginTop: 8,
  },
  numeroLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  acoesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  acaoPrimaria: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
  },
  acaoPrimariaTexto: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: "700",
    marginLeft: 6,
  },
  acaoSecundaria: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
  },
  acaoSecundariaTexto: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: "600",
    marginLeft: 6,
  },
  secaoTitulo: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  secaoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linhaUltima: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  linhaNome: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.body,
    marginHorizontal: 10,
  },
  linhaColuna: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linhaColunaUltima: {
    paddingVertical: 14,
  },
  estoqueBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  estoqueBadgeVazio: {
    backgroundColor: COLORS.danger,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  estoqueTexto: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },
  rankingTopo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rankingPosicao: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: "700",
    width: 24,
  },
  rankingVendas: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  barraFundo: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  barraPreenchida: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  pedidoCliente: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  pedidoTotal: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginTop: 2,
  },
  statusPendente: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusEnviado: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusEntregue: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusCancelado: {
    backgroundColor: COLORS.danger,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTexto: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextoEscuro: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "700",
  },
});
