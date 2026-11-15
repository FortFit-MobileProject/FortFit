import { Alert as AlertaNativo, Platform } from 'react-native';

// React Native Web não implementa Alert.alert. Mantém as confirmações dos
// mesmos fluxos disponíveis também na demonstração pelo navegador.
export const Alert = {
    alert(titulo, mensagem = '', botoes = [{ text: 'OK' }]) {
        if (Platform.OS !== 'web') return AlertaNativo.alert(titulo, mensagem, botoes);
        const texto = `${titulo}\n\n${mensagem}`;
        const cancelar = botoes.find((b) => b.style === 'cancel');
        const confirmar = botoes.find((b) => b.style !== 'cancel');
        if (cancelar) {
            if (window.confirm(texto)) confirmar?.onPress?.();
            else cancelar.onPress?.();
        } else {
            window.alert(texto);
            confirmar?.onPress?.();
        }
    },
};
