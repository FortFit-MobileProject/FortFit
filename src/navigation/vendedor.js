// src/navigation/vendedor.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardVendedorScreen from '../telas/dashboardVendedor/dashboardVendedor';
import ListaProdutosAdminScreen from '../telas/listaProdutosAdmin/listaProdutosAdmin';
import CadastroProdutoScreen from '../telas/cadastroProduto/cadastroProduto';

const Stack = createNativeStackNavigator();

export default function VendedorStack() {
    return (
        <Stack.Navigator
            initialRouteName="DashboardVendedor"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="DashboardVendedor" component={DashboardVendedorScreen} />
            <Stack.Screen name="ListaProdutosAdmin" component={ListaProdutosAdminScreen} />
            <Stack.Screen name="CadastroProduto" component={CadastroProdutoScreen} />
        </Stack.Navigator>
    );
} 