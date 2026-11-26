// Gera og-image.png (1200×630), a prévia do link no WhatsApp/Instagram: node tools/gerar-og.mjs
// Nome, frase e cores vêm do config.json (produto.nome, textos.og_frase, produto.cores).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = new URL('..', import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(raiz + 'config.json', 'utf8'));
const p0 = cfg.produto || {};
const cores = { fundo: '#FFFBF8', texto: '#2A1A14', texto_suave: '#6B5850', principal: '#FF6B4A', acento: '#B23A1C', texto_botao: '#2A1A14', ...(p0.cores || {}) };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Textos: bloco "previa" (titulo, linha1, linha2, selo) ou textos.og_frase (duas linhas separadas por \n).
const [l1, l2] = ((cfg.textos || {}).og_frase || 'Treino de força de 5 min em casa.\nCadeira, toalha e bora.').split('\n');
const pv = { titulo: p0.nome || 'Força na Caneta', linha1: l1, linha2: l2 || '', selo: 'Grátis · sem cadastro', ...(cfg.previa || {}) };
const nome = esc(pv.titulo);
const frase = [pv.linha1, pv.linha2].filter(Boolean).map(esc).join('<br>');
const logo = readFileSync(raiz + 'icons/logo.svg', 'utf8').replace('<svg ', '<svg width="260" height="260" ');
const html = `<body style="margin:0;width:1200px;height:630px;background:${cores.fundo};display:flex;align-items:center;gap:64px;padding:0 96px;box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${cores.texto}">
${logo}<div><div style="font-size:76px;font-weight:800;line-height:1.05">${nome}</div>
<div style="font-size:40px;margin-top:20px;color:${cores.texto_suave}">${frase}</div>
<div style="margin-top:32px;display:inline-block;background:${cores.principal};color:${cores.texto_botao};border:3px solid ${cores.acento};border-radius:20px;padding:14px 28px;font-size:34px;font-weight:800">${esc(pv.selo)}</div></div></body>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.screenshot({ path: raiz + 'og-image.png' });
await b.close();
console.log('og-image.png gerado');
