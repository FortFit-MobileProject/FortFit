// Servidor local do export Expo, com os cabeçalhos exigidos pelo SQLite Web.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const raiz = path.resolve('dist-web');
const tipos = { '.html':'text/html', '.js':'text/javascript', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.ttf':'font/ttf', '.css':'text/css' };
http.createServer((req,res) => {
    res.setHeader('Cross-Origin-Opener-Policy','same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy','credentialless');
    let arquivo;
    try { arquivo = path.resolve(raiz, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname)); }
    catch { res.writeHead(400).end(); return; }
    if (!arquivo.startsWith(raiz + path.sep) && arquivo !== raiz) { res.writeHead(403).end(); return; }
    if (arquivo === raiz || !path.extname(arquivo)) arquivo = path.join(raiz,'index.html');
    if (!fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type',tipos[path.extname(arquivo)] || 'application/octet-stream');
    fs.createReadStream(arquivo).pipe(res);
}).listen(Number(process.env.PORT || 8081),'0.0.0.0',()=>console.log('FortFit Web em http://localhost:'+(process.env.PORT || 8081)));
