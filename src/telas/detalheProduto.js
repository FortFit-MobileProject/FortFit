import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

export default function DetalheProdutoScreen({ route, navigation }) {
  // Recebe o produto passado pela tela anterior
  const { produto } = route.params;
  const [quantidade, setQuantidade] = useState(1);

  const estaEsgotado = produto.estoque === 0;

  function formatarPreco(preco) {
    return "R$ " + preco.toFixed(2).replace(".", ",");
  }

  function handleAdicionarAoCarrinho() {
    console.log(`Adicionado ${quantidade}x ${produto.nome} ao carrinho`);
    // Lógica futura de carrinho global entrará aqui
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecalho de Navegacao */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 24 }} />{" "}
        {/* Espaçador para centralizar o título */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagem do Produto */}
        <View style={styles.imageContainer}>
          {produto.foto ? (
            <Image
              source={produto.foto}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Feather name="image" size={60} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Informacoes do Produto */}
        <View style={styles.infoContainer}>
          <Text style={styles.categoria}>{produto.categoria}</Text>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>

          {estaEsgotado ? (
            <Text style={styles.estoqueEsgotado}>Produto Esgotado</Text>
          ) : (
            <Text style={styles.estoqueDisponivel}>
              Em estoque: {produto.estoque} unidades
            </Text>
          )}

          <Text style={styles.descricaoTitulo}>Descrição</Text>
          <Text style={styles.descricaoTexto}>
            Este é um texto de exemplo para a descrição do produto. No futuro,
            você pode adicionar o campo "descricao" no seu PRODUTOS_MOCK e
            renderizá-lo diretamente aqui para fornecer mais detalhes ao
            cliente.
          </Text>
        </View>
      </ScrollView>

      {/* Barra Inferior (Compra) */}
      <View style={styles.bottomBar}>
        <View style={styles.quantidadeContainer}>
          <TouchableOpacity
            style={styles.qtdButton}
            onPress={() => setQuantidade(Math.max(1, quantidade - 1))}
          >
            <Feather name="minus" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.qtdTexto}>{quantidade}</Text>
          <TouchableOpacity
            style={styles.qtdButton}
            onPress={() => setQuantidade(quantidade + 1)}
            disabled={estaEsgotado || quantidade >= produto.estoque}
          >
            <Feather name="plus" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.btnComprar,
            estaEsgotado && styles.btnComprarDesabilitado,
          ]}
          disabled={estaEsgotado}
          onPress={handleAdicionarAoCarrinho}
        >
          <Text style={styles.btnComprarTexto}>Adicionar</Text>
          <Text style={styles.btnComprarPreco}>
            {formatarPreco(produto.preco * quantidade)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: "700",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "80%",
    height: "80%",
  },
  infoContainer: {
    padding: SIZES.padding,
  },
  categoria: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  nome: {
    color: COLORS.text,
    fontSize: SIZES.h2,
    fontWeight: "700",
    marginBottom: 8,
  },
  preco: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  estoqueDisponivel: {
    color: COLORS.success || "#28a745", // Ajuste caso não tenha 'success' no theme
    fontSize: SIZES.small,
    marginBottom: 24,
  },
  estoqueEsgotado: {
    color: COLORS.danger,
    fontSize: SIZES.small,
    fontWeight: "700",
    marginBottom: 24,
  },
  descricaoTitulo: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: "700",
    marginBottom: 8,
  },
  descricaoTexto: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: "row",
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  quantidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginRight: 16,
  },
  qtdButton: {
    padding: 12,
  },
  qtdTexto: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  btnComprar: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
  },
  btnComprarDesabilitado: {
    backgroundColor: COLORS.border,
  },
  btnComprarTexto: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: "700",
  },
  btnComprarPreco: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: "700",
  },
});
