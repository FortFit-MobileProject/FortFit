import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

// Lista fixa de categorias por enquanto.
// Futuramente pode vir do Firebase (coleção "categorias").
const CATEGORIAS = ['Suplementos', 'Roupas', 'Acessórios', 'Equipamentos'];

export default function CadastroProdutoScreen(props) {

    const navigation = props.navigation;

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');


    function selecionarCategoria(categoria) {
        setCategoriaSelecionada(categoria);
    }

    function handleCadastrarProduto() {
        console.log('Tentativa de cadastro de produto');
        console.log('Nome:', nome);
        console.log('Descrição:', descricao);
        console.log('Categoria:', categoriaSelecionada);
        console.log('Preço:', preco);
        console.log('Estoque:', estoque);

        // Futuramente:
        // 1. Validar se todos os campos obrigatórios foram preenchidos
        // 2. Fazer upload da foto do produto (Firebase Storage)
        // 3. Salvar o produto no Firebase (Firestore)
        // 4. Se der certo, voltar para a listagem de produtos do admin
        // 5. Se der erro, mostrar mensagem para o usuário

        if (navigation) {
            navigation.navigate('ListaProdutosAdmin');
        } else {
            console.log('Navegação ainda não configurada');
        }
    }

    function handleAdicionarFoto() {
        console.log('Abrir seletor de foto');
        // Futuramente: usar expo-image-picker para escolher/tirar a foto do produto
    }

    function voltar() {
        if (navigation) {
            navigation.goBack();
        } else {
            console.log('Navegação ainda não configurada');
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ---------- CABEÇALHO ---------- */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={voltar} style={styles.backButton}>
                            <Feather name="chevron-left" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Cadastrar produto</Text>
                        <View style={styles.backButton} />
                    </View>

                    <Text style={styles.subtitle}>
                        Preencha os dados abaixo para adicionar um novo item à loja.
                    </Text>

                    {/* ---------- FOTO DO PRODUTO ---------- */}
                    <TouchableOpacity
                        style={styles.photoBox}
                        onPress={handleAdicionarFoto}
                    >
                        <Feather name="camera" size={26} color={COLORS.textSecondary} />
                        <Text style={styles.photoBoxText}>Adicionar foto do produto</Text>
                    </TouchableOpacity>

                    {/* ---------- NOME ---------- */}
                    <Text style={styles.label}>NOME DO PRODUTO</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Whey Protein Concentrado 900g"
                        placeholderTextColor={COLORS.placeholder}
                        value={nome}
                        onChangeText={function (textoDigitado) {
                            setNome(textoDigitado);
                        }}
                    />

                    {/* ---------- DESCRIÇÃO ---------- */}
                    <Text style={styles.label}>DESCRIÇÃO</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Conte os detalhes do produto..."
                        placeholderTextColor={COLORS.placeholder}
                        value={descricao}
                        onChangeText={function (textoDigitado) {
                            setDescricao(textoDigitado);
                        }}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* ---------- CATEGORIA ---------- */}
                    <Text style={styles.label}>CATEGORIA</Text>
                    <View style={styles.chipsRow}>
                        {CATEGORIAS.map(function (categoria) {
                            const estaSelecionada = categoria === categoriaSelecionada;

                            let estiloChip = styles.chip;
                            if (estaSelecionada === true) {
                                estiloChip = styles.chipSelecionado;
                            }

                            let estiloTextoChip = styles.chipText;
                            if (estaSelecionada === true) {
                                estiloTextoChip = styles.chipTextSelecionado;
                            }

                            return (
                                <TouchableOpacity
                                    key={categoria}
                                    style={estiloChip}
                                    onPress={function () {
                                        selecionarCategoria(categoria);
                                    }}
                                >
                                    <Text style={estiloTextoChip}>{categoria}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ---------- PREÇO E ESTOQUE ---------- */}
                    <View style={styles.rowFields}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>PREÇO (R$)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                placeholderTextColor={COLORS.placeholder}
                                value={preco}
                                onChangeText={function (textoDigitado) {
                                    setPreco(textoDigitado);
                                }}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>ESTOQUE</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.placeholder}
                                value={estoque}
                                onChangeText={function (textoDigitado) {
                                    setEstoque(textoDigitado);
                                }}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    {/* ---------- BOTÃO PRINCIPAL ---------- */}
                    <TouchableOpacity style={styles.button} onPress={handleCadastrarProduto}>
                        <Text style={styles.buttonText}>CADASTRAR PRODUTO</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: SIZES.padding,
        paddingTop: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    backButton: {
        width: 32,
        height: 32,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: SIZES.h2,
        fontWeight: '700',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        marginTop: 8,
        marginBottom: 24,
    },
    photoBox: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.surface,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    photoBoxText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 8,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: SIZES.body,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    chip: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelecionado: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    chipTextSelecionado: {
        color: COLORS.background,
        fontSize: SIZES.small,
        fontWeight: '700',
    },
    rowFields: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfField: {
        width: '48%',
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: SIZES.h3,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});