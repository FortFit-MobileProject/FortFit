import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const fotoWhey = require('../../../assets/images/produtos/wheyOn.png');
const wheyPerformace = require('../../../assets/images/produtos/wheyPerformace.webp');
const fotoCreatina = require('../../../assets/images/produtos/creatina.webp');
const fotoStrap = require('../../../assets/images/produtos/strap.png');
const fotoCamiseta = require('../../../assets/images/produtos/camiseta.webp');
const fotoProteinaChocolate = require('../../../assets/images/produtos/proteinaChocolate.webp');
const halteres2kg = require('../../../assets/images/produtos/halteres_2kg.webp');

// Dados de exemplo, só para a tela não ficar vazia enquanto não existe backend.
// Futuramente essa lista vai vir do Firebase (coleção "produtos").
const PRODUTOS_MOCK = [
    { id: '1', nome: 'Whey Protein Concentrado 900g', categoria: 'Suplementos', preco: 129.9, estoque: 42, foto: wheyPerformace },
    { id: '2', nome: 'Creatina Monohidratada 300g', categoria: 'Suplementos', preco: 79.9, estoque: 15, foto: fotoCreatina },
    { id: '3', nome: 'Luvas de Treino Pro', categoria: 'Acessórios', preco: 49.9, estoque: 8, foto: fotoStrap },
    { id: '4', nome: 'Camiseta Dry-Fit FortFit', categoria: 'Roupas', preco: 59.9, estoque: 0, foto: fotoCamiseta },
    { id: '5', nome: 'Barra de Proteína Chocolate', categoria: 'Suplementos', preco: 12.9, estoque: 60, foto: fotoProteinaChocolate },
    { id: '6', nome: 'Kit Halteres 2kg', categoria: 'Equipamentos', preco: 89.9, estoque: 5, foto: halteres2kg },
    { id: '7', nome: 'Whey Protein Isolado 900g', categoria: 'Suplementos', preco: 149.9, estoque: 30, foto: fotoWhey },
];


export default function ListaProdutosAdminScreen(props) {

    const navigation = props.navigation;

    const [busca, setBusca] = useState('');
    const [produtos, setProdutos] = useState(PRODUTOS_MOCK);


    function formatarPreco(preco) {
        return 'R$ ' + preco.toFixed(2).replace('.', ',');
    }

    function irParaCadastroProduto() {
        if (navigation) {
            navigation.navigate('CadastroProduto');
        } else {
            console.log('Navegação ainda não configurada');
        }
    }

    function handleEditarProduto(produto) {
        console.log('Editar produto:', produto.nome);
        // Futuramente: navegar para CadastroProduto passando o produto para edição
    }

    function handleExcluirProduto(produto) {
        console.log('Excluir produto:', produto.nome);

        // Por enquanto só remove da lista local.
        // Futuramente: excluir também no Firebase.
        const novaLista = produtos.filter(function (item) {
            return item.id !== produto.id;
        });
        setProdutos(novaLista);
    }


    let produtosFiltrados = produtos;
    if (busca.trim() !== '') {
        produtosFiltrados = produtos.filter(function (produto) {
            return produto.nome.toLowerCase().includes(busca.toLowerCase());
        });
    }

    function renderizarProduto({ item }) {
        let estiloEstoque = styles.estoqueBadge;
        let textoEstoque = item.estoque + ' em estoque';
        if (item.estoque === 0) {
            estiloEstoque = styles.estoqueBadgeVazio;
            textoEstoque = 'Esgotado';
        }

        return (
            <View style={styles.card}>
                <View style={styles.thumbnail}>
                    {item.foto ? (
                        <Image source={item.foto} style={styles.thumbnailImage} resizeMode="cover" />
                    ) : (
                        <Feather name="image" size={22} color={COLORS.textSecondary} />
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
                    <Text style={styles.cardCategoria}>{item.categoria}</Text>
                    <View style={styles.cardRodape}>
                        <Text style={styles.cardPreco}>{formatarPreco(item.preco)}</Text>
                        <View style={estiloEstoque}>
                            <Text style={styles.estoqueTexto}>{textoEstoque}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardAcoes}>
                    <TouchableOpacity
                        style={styles.acaoBotao}
                        onPress={function () {
                            handleEditarProduto(item);
                        }}
                    >
                        <Feather name="edit-2" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.acaoBotao}
                        onPress={function () {
                            handleExcluirProduto(item);
                        }}
                    >
                        <Feather name="trash-2" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    function renderizarListaVazia() {
        return (
            <View style={styles.vazioContainer}>
                <Feather name="package" size={32} color={COLORS.textSecondary} />
                <Text style={styles.vazioTexto}>Nenhum produto encontrado</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ---------- CABEÇALHO ---------- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Produtos</Text>
                    <Text style={styles.headerSubtitle}>{produtos.length} cadastrados</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={irParaCadastroProduto}>
                    <Feather name="plus" size={22} color={COLORS.background} />
                </TouchableOpacity>
            </View>

            {/* ---------- BUSCA ---------- */}
            <View style={styles.searchWrapper}>
                <Feather name="search" size={18} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar produto..."
                    placeholderTextColor={COLORS.placeholder}
                    value={busca}
                    onChangeText={function (textoDigitado) {
                        setBusca(textoDigitado);
                    }}
                />
            </View>

            {/* ---------- LISTA ---------- */}
            <FlatList
                data={produtosFiltrados}
                keyExtractor={function (item) {
                    return item.id;
                }}
                renderItem={renderizarProduto}
                contentContainerStyle={styles.listaContainer}
                ListEmptyComponent={renderizarListaVazia}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: SIZES.h1,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 4,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginHorizontal: SIZES.padding,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        color: COLORS.text,
        fontSize: SIZES.body,
    },
    listaContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 24,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        marginBottom: 12,
    },
    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    cardInfo: {
        flex: 1,
    },
    cardNome: {
        color: COLORS.text,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    cardCategoria: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 2,
    },
    cardRodape: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    cardPreco: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontWeight: '700',
        marginRight: 10,
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
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    cardAcoes: {
        alignItems: 'center',
        marginLeft: 8,
    },
    acaoBotao: {
        padding: 6,
    },
    vazioContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    vazioTexto: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        marginTop: 12,
    },
});