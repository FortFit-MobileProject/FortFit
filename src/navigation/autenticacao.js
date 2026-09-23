import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../telas/login/login';
import CadastroScreen from '../telas/login/cadastro/cadastro';
import AreaVendedorScreen from '../telas/login/areaVendedor/areaVendedor';
import ValidarEmailScreen from '../telas/login/reset/validarEmail';
import ValidarCodigoScreen from '../telas/login/reset/validarCodigo';
import ResetScreen from '../telas/login/reset/reset';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
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
        </Stack.Navigator>
    );
}