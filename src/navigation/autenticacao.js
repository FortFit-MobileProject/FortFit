import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../telas/login/login';
import CadastroScreen from '../telas/login/cadastro/cadastro';
import AreaVendedorScreen from '../telas/login/areaVendedor/areaVendedor';
import ValidarEmailScreen from '../telas/login/reset/validarEmail';
import ValidarCodigoScreen from '../telas/login/reset/validarCodigo';
import ResetScreen from '../telas/login/reset/reset';
import DetalheProdutoScreen from '../telas/detalheProduto'; 

// IMPORTANTE: Importe a tela de lista de produtos!
import ListaProdutosClienteScreen from '../telas/listaProdutosCliente/listaProdutoCliente';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator
            // MUDANÇA TEMPORÁRIA: Comece o app direto na lista de produtos
            initialRouteName="ListaProdutos" 
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="EsqueciSenha" component={ValidarEmailScreen} />
            <Stack.Screen name="ValidarCodigo" component={ValidarCodigoScreen} />
            <Stack.Screen name="RedefinirSenha" component={ResetScreen} />
            <Stack.Screen name="AreaVendedor" component={AreaVendedorScreen} />
            
            {/* Adicione a tela de Lista para ela existir na navegação */}
            <Stack.Screen name="ListaProdutos" component={ListaProdutosClienteScreen} />
            
            {/* A sua tela de detalhes */}
            <Stack.Screen name="DetalheProduto" component={DetalheProdutoScreen} />
        </Stack.Navigator>
    );
}