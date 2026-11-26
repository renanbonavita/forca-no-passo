// Servidor local simples para testar: node tools/servidor.mjs  → http://localhost:8080
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const porta = Number(process.env.PORT || 8080);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ics': 'text/calendar' };

export function iniciarServidor(p = porta) {
  const srv = createServer(async (req, res) => {
    try {
      let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (caminho.endsWith('/')) caminho += 'index.html';
      const arquivo = normalize(join(raiz, caminho));
      if (!arquivo.startsWith(raiz)) throw new Error('fora');
      if (!(await stat(arquivo)).isFile()) throw new Error('nao');
      res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream' });
      res.end(await readFile(arquivo));
    } catch { res.writeHead(404); res.end('404'); }
  });
  return new Promise((ok) => srv.listen(p, () => ok(srv)));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  iniciarServidor().then(() => console.log(`Força na Caneta em http://localhost:${porta}`));
}
