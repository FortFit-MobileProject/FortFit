import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function DetalhesProduto() {
  const navigation = useNavigation();
  const [quantidade, setQuantidade] = useState(1);

  const aumentarQuantidade = () => setQuantidade((prev) => prev + 1);
  const diminuirQuantidade = () => {
    if (quantidade > 1) setQuantidade((prev) => prev - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Container da Imagem com fundo estilizado */}
        <View style={styles.imageContainer}>
          {/* Círculos decorativos de fundo simulando o design original */}
          <View
            style={[
              styles.bgCircle,
              { top: -20, right: -20, width: 150, height: 150 },
            ]}
          />
          <View
            style={[
              styles.bgCircle,
              { bottom: -30, left: -30, width: 120, height: 120 },
            ]}
          />

          {/* Imagem do Produto (Substitua pela sua imagem real) */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80",
            }} // Exemplo placeholder
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Badge "Mais Vendido" */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MAIS VENDIDO</Text>
        </View>

        {/* Título e Marca */}
        <Text style={styles.productTitle}>Creatina Pure 300g</Text>
        <Text style={styles.productBrand}>Forge Labs</Text>

        {/* Preço e Avaliação */}
        <View style={styles.priceRatingContainer}>
          <Text style={styles.productPrice}>R$ 89,90</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingValue}> 4,9 </Text>
            <Text style={styles.ratingCount}>(128)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Quantidade */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantidade</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={diminuirQuantidade}
              style={styles.stepperButton}
            >
              <Ionicons name="remove" size={20} color="#A0A0A0" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantidade}</Text>
            <TouchableOpacity
              onPress={aumentarQuantidade}
              style={styles.stepperButton}
            >
              <Ionicons name="add" size={20} color="#CCFF33" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Descrição */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.description}>
          Creatina monohidratada pura para auxiliar no ganho de força e
          desempenho durante os treinos.
        </Text>
      </ScrollView>

      {/* Botão de Adicionar ao Carrinho */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton}>
          <Ionicons
            name="cart-outline"
            size={24}
            color="#000"
            style={styles.buyIcon}
          />
          <Text style={styles.buyButtonText}>ADICIONAR AO CARRINHO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A", // Fundo preto/escuro da imagem
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: "#1E1E1E",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 320,
    backgroundColor: "#161616", // Fundo cinza escuro do cartão da imagem
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    backgroundColor: "rgba(204, 255, 51, 0.05)", // Círculos verdes bem fracos ao fundo
    borderRadius: 100,
  },
  productImage: {
    width: "60%",
    height: "70%",
    borderRadius: 16,
  },
  badge: {
    backgroundColor: "rgba(204, 255, 51, 0.1)", // Fundo verde translúcido
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#CCFF33", // Verde néon
    fontSize: 10,
    fontWeight: "bold",
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 16,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CCFF33", // Verde néon
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  ratingCount: {
    color: "#666666",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#1E1E1E",
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  stepper: {
    flexDirection: "row",git remote set-url origin [https://github.com/FortFit-MobileProject/FortFit.git](https://github.com/FortFit-MobileProject/FortFit.git)
  stepperValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: "#888888",
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: "#0A0A0A",
  },
  buyButton: {
    backgroundColor: "#CCFF33", // Verde néon principal
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  buyIcon: {
    marginRight: 8,
  },
  buyButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
