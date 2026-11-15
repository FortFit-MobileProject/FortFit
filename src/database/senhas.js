import bcrypt from 'bcryptjs';

export function criarCodificadorSenhas(bytesAleatorios) {
    return {
        codificarSenha: async (senha) => {
            if (bcrypt.truncates(senha)) throw new Error('SENHA_MUITO_LONGA');
            // Salt explícito para não depender de crypto do Node no React Native.
            const salt = '$2b$10$' + bcrypt.encodeBase64(Array.from(bytesAleatorios(16)), 16);
            return bcrypt.hash(senha, salt);
        },
        conferirSenha: (senha, hash) => !bcrypt.truncates(senha) && bcrypt.compare(senha, hash),
    };
}
