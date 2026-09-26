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
import { COLORS, SIZES, FONTS } from '../../../constants/theme';

export default function ValidarEmail(props) {

    const navigation = props.navigation;

    const [email, setEmail] = useState('');

    function handleEnviarCodigo() {
        console.log('Solicitando envio de código para:', email);

        // OBSERVAÇÃO: Adicionar lógica para:
        // 1. Validar se o campo de e-mail não está vazio e tem formato válido
        // 2. Chamar a API do backend (ex: POST /auth/enviar-codigo) passando o e-mail
        // 3. Se a API confirmar que o e-mail existe e o código foi enviado,
        //    navegar para a tela de validação de código, passando o e-mail como parâmetro
        // 4. Se der erro (e-mail não encontrado, falha no envio), mostrar mensagem ao usuário

        if (navigation) {
            navigation.navigate('ValidarCodigo', { email: email });
        } else {
            console.log('Navegação ainda não configurada');
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.glowCircle} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Esqueceu sua senha?</Text>
                    <Text style={styles.subtitle}>
                        Digite seu e-mail cadastrado para receber um código de verificação.
                    </Text>

                    <Text style={styles.label}>E-MAIL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seuemail@exemplo.com"
                        placeholderTextColor={COLORS.placeholder}
                        value={email}
                        onChangeText={function (textoDigitado) {
                            setEmail(textoDigitado);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleEnviarCodigo}>
                        <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>
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
    glowCircle: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: COLORS.primary,
        opacity: 0.08,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: SIZES.padding,
        paddingTop: 40,
        paddingBottom: 24,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.h1,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        marginBottom: 32,
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
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: SIZES.h3,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});