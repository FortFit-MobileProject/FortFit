import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLoja } from '../context/LojaContext';
import DashboardVendedor from '../telas/dashboardVendedor/dashboardVendedor';
import { COLORS } from '../constants/theme';
import LoginScreen from '../telas/login/login';
import CadastroScreen from '../telas/login/cadastro/cadastro';
import AreaVendedorScreen from '../telas/login/areaVendedor/areaVendedor';
import ValidarEmailScreen from '../telas/login/reset/validarEmail';
import ValidarCodigoScreen from '../telas/login/reset/validarCodigo';
import ResetScreen from '../telas/login/reset/reset';
import PagamentoScreen from '../telas/pagamento/pagamento';
import ConfirmacaoPagamentoScreen from '../telas/pagamento/confirmacaoPagamento';
import ListaProdutosClienteScreen from '../telas/listaProdutosCliente/listaProdutoCliente';
import DetalhesProdutoScreen from '../telas/detalhesProduto/detalhesProduto';
import CarrinhoScreen from '../telas/carrinho/carrinho';
import PerfilScreen from '../telas/perfil/perfil';
import ListaProdutosAdminScreen from '../telas/listaProdutosAdmin/listaProdutosAdmin';
import CadastroProdutoScreen from '../telas/cadastroProduto/cadastroProduto';
import MeusPedidosScreen from '../telas/pedidos/meusPedidos';

const Stack = createNativeStackNavigator();
const TELAS_COM_RETORNO = new Set([
    'ListaProdutosAdmin',
    'DashboardVendedor',
]);
const TITULOS = {
    ListaProdutosAdmin: 'Gerenciar produtos',
    DashboardVendedor: 'Painel de vendas',
};

export default function AuthStack() {
    const { usuario } = useLoja();
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
                headerShown: TELAS_COM_RETORNO.has(route.name),
                headerTitle: TITULOS[route.name],
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.text,
                headerTitleStyle: { fontWeight: '700' },
                headerBackTitle: 'Voltar',
                headerShadowVisible: false,
                contentStyle: { backgroundColor: COLORS.background },
            })}
        >
            {!usuario ? <Stack.Group navigationKey="publico">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Cadastro" component={CadastroScreen} />
                <Stack.Screen name="EsqueciSenha" component={ValidarEmailScreen} />
                <Stack.Screen name="ValidarCodigo" component={ValidarCodigoScreen} />
                <Stack.Screen name="RedefinirSenha" component={ResetScreen} />
            </Stack.Group> : usuario.perfil === 'admin' ? <Stack.Group navigationKey={usuario.id}>
                <Stack.Screen name="AreaVendedor" component={AreaVendedorScreen} />
                <Stack.Screen name="DashboardVendedor" component={DashboardVendedor} />
                <Stack.Screen name="ListaProdutosAdmin" component={ListaProdutosAdminScreen} />
                <Stack.Screen name="CadastroProduto" component={CadastroProdutoScreen} />
            </Stack.Group> : <Stack.Group navigationKey={usuario.id}>
                <Stack.Screen name="ListaProdutosCliente" component={ListaProdutosClienteScreen} />
                <Stack.Screen name="DetalheProduto" component={DetalhesProdutoScreen} />
                <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
                <Stack.Screen name="Perfil" component={PerfilScreen} />
                <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} />
                <Stack.Screen name="Pagamento" component={PagamentoScreen} />
                <Stack.Screen name="PagamentoConfirmado" component={ConfirmacaoPagamentoScreen} />
            </Stack.Group>}
        </Stack.Navigator>
    );
}
