import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/autenticacao';
import { LojaProvider, useLoja } from './src/context/LojaContext';
import { COLORS } from './src/constants/theme';

function ConteudoApp() {
    const { carregando, erroInicializacao, tentarNovamente } = useLoja();
    if (carregando || erroInicializacao) return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.background }}>
            {carregando ? <ActivityIndicator color={COLORS.primary} /> : <>
                <Text style={{ color: COLORS.text, textAlign: 'center', marginBottom: 20 }}>Não foi possível abrir os dados da loja. Tente novamente.</Text>
                <TouchableOpacity onPress={tentarNovamente}><Text style={{ color: COLORS.primary }}>TENTAR NOVAMENTE</Text></TouchableOpacity>
            </>}
            <StatusBar style="light" />
        </View>
    );
    return <NavigationContainer><AuthStack /><StatusBar style="light" /></NavigationContainer>;
}

export default function App() {
    return <SafeAreaProvider><LojaProvider><ConteudoApp /></LojaProvider></SafeAreaProvider>;
}
