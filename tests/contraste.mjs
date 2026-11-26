// Confere o contraste WCAG AA das cores do app: node tests/contraste.mjs
// Lê as cores padrão do styles.css (:root) e aplica por cima as do produto (config.json → produto.cores),
// do mesmo jeito que o app.js faz. Assim o teste vale para qualquer produto da família.
import { readFileSync } from 'node:fs';
const raiz = new URL('..', import.meta.url);
const css = readFileSync(new URL('styles.css', raiz), 'utf8');
const config = JSON.parse(readFileSync(new URL('config.json', raiz), 'utf8'));

// Mesmo mapa do app.js (CORES_CSS): chave do config.json → variável CSS.
const CORES_CSS = {
  principal: '--coral', principal_hover: '--coral-hover', principal_suave: '--coral-suave', acento: '--acento', texto_botao: '--texto-botao',
  fundo: '--fundo', superficie: '--botao', borda: '--borda', texto: '--texto', texto_suave: '--suave', contorno: '--contorno', midia: '--midia',
};
const v = {};
const bloco = css.match(/:root\s*\{([\s\S]*?)\}/)[1];
for (const [, nome, valor] of bloco.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\b/gi)) v[nome] = valor;
const cores = (config.produto || {}).cores || {};
for (const [k, nome] of Object.entries(CORES_CSS)) if (/^#[0-9a-f]{6}$/i.test(cores[k] || '')) v[nome] = cores[k];
// --midia usa a cor suave quando o produto não define uma própria (styles.css: --midia:var(--coral-suave)).
if (!/^#[0-9a-f]{6}$/i.test(cores.midia || '')) v['--midia'] = v['--coral-suave'];

const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const c = (x) => (x.startsWith('--') ? v[x] : x);

const pares = [
  ['texto sobre fundo', '--texto', '--fundo', 4.5],
  ['texto secundário sobre fundo', '--suave', '--fundo', 4.5],
  ['texto secundário sobre branco/superfície', '--suave', '--botao', 4.5],
  ['texto secundário sobre cor suave', '--suave', '--coral-suave', 4.5],
  ['texto sobre chip de cor suave', '--texto', '--coral-suave', 4.5],
  ['acento sobre cor suave (rótulos)', '--acento', '--coral-suave', 4.5],
  ['verde de sucesso sobre verde claro', '--sucesso', '--sucesso-suave', 4.5],
  ['texto sobre alerta', '--texto', '--atencao', 4.5],
  ['ícone de acento sobre superfície (gráfico)', '--acento', '--botao', 3],
  ['texto do botão principal (BORA)', '--texto-botao', '--coral', 4.5],
  ['texto do botão principal pressionado', '--texto-botao', '--coral-hover', 4.5],
  ['link (acento) sobre fundo', '--acento', '--fundo', 4.5],
  ['marcador de acento sobre superfície', '--acento', '--botao', 4.5],
  ['legenda branca sobre texto escuro', '#FFFFFF', '--texto', 4.5],
  ['verde de sucesso sobre fundo', '--sucesso', '--fundo', 4.5],
  ['texto sobre alerta amarelo', '--texto', '#FFF1C9', 4.5],
  ['texto sobre verde claro', '--texto', '#DDF3E8', 4.5],
  ['erro sobre branco', '#A3241B', '#FFFFFF', 4.5],
  ['erro sobre fundo', '#A3241B', '--fundo', 4.5],
  ['contorno de botões e campos sobre o fundo (WCAG 1.4.11)', '--contorno', '--fundo', 3],
  ['contorno de botões sobre superfície', '--contorno', '--botao', 3],
  ['borda do BORA sobre a cor principal', '--acento', '--coral', 1],
  ['barra de progresso (gráfico) sobre trilho', '--acento', '--borda', 3],
  ['texto sobre a área de mídia', '--texto', '--midia', 4.5],
];
let falhou = false;
console.log(`Produto: ${(config.produto || {}).nome || 'padrão'}`);
for (const [nome, a, b, min] of pares) {
  const [ca, cb] = [c(a), c(b)];
  if (!ca || !cb) { falhou = true; console.log(`✗ cor ausente (${a} / ${b}) ${nome}`); continue; }
  const r = razao(ca, cb);
  const ok = r >= min;
  if (!ok) falhou = true;
  console.log(`${ok ? '✓' : '✗'} ${r.toFixed(2)}:1 (mín ${min}) ${nome}  [${ca} × ${cb}]`);
}
process.exit(falhou ? 1 : 0);
