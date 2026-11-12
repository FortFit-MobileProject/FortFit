const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = [
    ...config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    'wasm',
];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// SQLite Web usa WASM e SharedArrayBuffer. Os mesmos cabeçalhos são
// necessários no servidor que publicar o export web.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    return middleware(req, res, next);
};

module.exports = config;
