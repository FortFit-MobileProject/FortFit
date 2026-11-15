import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { IMAGENS_PRODUTOS, PRODUTOS_INICIAIS } from '../data/produtos';
import { criarRepositorio } from './repositorio';
import { criarCodificadorSenhas } from './senhas';

let repositorioPromise;
export function obterRepositorio() {
    if (!repositorioPromise) {
        repositorioPromise = (async () => {
            const db = await SQLite.openDatabaseAsync('fortfit.db');
            const repositorio = criarRepositorio(db, {
                produtosIniciais: PRODUTOS_INICIAIS,
                contasIniciais: [
                    { id: 'admin-fortfit', nome: 'Administrador FortFit', email: 'admin@fortfit.com', perfil: 'admin', senha: process.env.EXPO_PUBLIC_FORTFIT_ADMIN_PASSWORD },
                    { id: 'cliente-fortfit', nome: 'Cliente FortFit', email: 'cliente@fortfit.com', perfil: 'cliente', senha: process.env.EXPO_PUBLIC_FORTFIT_CLIENT_PASSWORD },
                ].filter((conta) => conta.senha),
                imagens: IMAGENS_PRODUTOS,
                ...criarCodificadorSenhas(Crypto.getRandomBytes),
                gerarId: Crypto.randomUUID,
                gerarCodigo: () => Array.from(Crypto.getRandomBytes(6), (b) => b % 10).join(''),
            });
            await repositorio.inicializarBanco();
            return repositorio;
        })().catch((erro) => { repositorioPromise = null; throw erro; });
    }
    return repositorioPromise;
}

export async function persistirFotoProduto(foto) {
    const uri = typeof foto === 'string' ? foto : foto?.uri;
    if (!uri || Platform.OS === 'web' || !/^(file|content):/.test(uri)) return foto;
    const pasta = new Directory(Paths.document, 'fortfit-produtos');
    pasta.create({ idempotent: true, intermediates: true });
    if (uri.startsWith(pasta.uri)) return foto;
    const origem = new File(uri);
    const extensao = origem.extension || '.jpg';
    const destino = new File(pasta, `${Crypto.randomUUID()}${extensao}`);
    await origem.copy(destino);
    return { uri: destino.uri };
}
