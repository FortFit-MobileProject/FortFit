const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
let arquivos = 0;
function verificar(pasta) {
    for (const nome of fs.readdirSync(pasta)) {
        const arquivo = path.join(pasta,nome);
        if (fs.statSync(arquivo).isDirectory()) verificar(arquivo);
        else if (arquivo.endsWith('.js')) {
            parser.parse(fs.readFileSync(arquivo,'utf8'), {sourceType:'unambiguous',plugins:['jsx']});
            arquivos++;
        }
    }
}
verificar('src');
parser.parse(fs.readFileSync('App.js','utf8'), {sourceType:'module',plugins:['jsx']});
console.log(`${arquivos + 1} arquivos JavaScript/JSX verificados.`);
