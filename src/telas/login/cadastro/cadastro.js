import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../../../constants/theme';

export default function CadastroScreen(props) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Tela de Cadastro</Text>
            <Text style={styles.subtext}>Em construção — próxima etapa do projeto</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: COLORS.text,
        fontSize: SIZES.h2,
        fontWeight: '700',
    },
    subtext: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        marginTop: 8,
    },
});