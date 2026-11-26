// Gera as ilustrações provisórias (SVG) de cada movimento a partir de exercicios.json.
// Uso: node tools/gerar-placeholders.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const raiz = new URL('..', import.meta.url).pathname;
const { exercicios } = JSON.parse(readFileSync(raiz + 'exercicios.json', 'utf8'));
mkdirSync(raiz + 'img/mov', { recursive: true });

// Cores do produto (config.json → produto.cores), com os padrões do Força na Caneta.
const cfg = JSON.parse(readFileSync(raiz + 'config.json', 'utf8'));
const coresP = (cfg.produto || {}).cores || {};
const cor = { parede: '#C9B3A8', texto: '#2A1A14', texto_suave: '#6B5850', acento: '#B23A1C', principal: '#FF6B4A', ...coresP };
cor.midia = coresP.midia || coresP.principal_suave || '#FFEDE6';
// Faixa do chão: cor própria (cores.chao) ou uma sombra leve sobre a cor da mídia.
const chao = coresP.chao ? `fill="${coresP.chao}"` : 'fill="#000" opacity=".06"';
const CORES = { pernas: cor.midia, empurrar: cor.midia, costas: cor.midia, extra: cor.midia };
// Textos das 3 telas fixas (config.json → "placeholders"), com os padrões do Força na Caneta.
const telas = { aquecimento: 'Sentada, no seu ritmo', descanso: 'Respira fundo', desaquecimento: 'Levante devagar no final', ...(cfg.placeholders || {}) };
const ROTULO = { pernas: 'Pernas', empurrar: 'Empurrar', costas: 'Costas', extra: 'Extra', ...((cfg.produto || {}).nomes_grupos || {}) };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function quebrar(texto, max = 19) {
  const linhas = []; let atual = '';
  for (const p of texto.split(' ')) {
    if ((atual + ' ' + p).trim().length > max) { linhas.push(atual.trim()); atual = p; } else atual += ' ' + p;
  }
  if (atual.trim()) linhas.push(atual.trim());
  return linhas;
}

const cadeira = `<g stroke="${cor.texto}" stroke-width="6" stroke-linecap="round" fill="none">
  <path d="M250 150 v110"/><path d="M250 205 h70 v55"/><path d="M250 205 v55"/><path d="M250 150 h0"/></g>`;
const parede = `<rect x="226" y="60" width="14" height="210" fill="${cor.parede}"/>`;
const pessoaSentada = `<g stroke="${cor.texto}" stroke-width="8" stroke-linecap="round" fill="none">
  <path d="M285 140 v55 h40 v60"/><path d="M285 160 l35 15"/></g><circle cx="285" cy="120" r="16" fill="${cor.texto}"/>`;
const pessoaEmPe = `<g stroke="${cor.texto}" stroke-width="8" stroke-linecap="round" fill="none">
  <path d="M360 135 v70 l-12 60"/><path d="M360 205 l12 60"/><path d="M360 155 l-40 25"/></g><circle cx="360" cy="113" r="16" fill="${cor.texto}"/>`;
const toalha = `<path d="M300 172 q20 -14 42 0" stroke="${cor.principal}" stroke-width="10" fill="none" stroke-linecap="round"/>`;

function svg(mov) {
  const fundo = CORES[mov.grupo] || '#FFF';
  const linhas = quebrar(mov.nome);
  const usaParede = /parede/i.test(mov.nome + mov.descricao);
  const figura = '<g transform="translate(-60 -48)">' + [
    usaParede ? parede : '',
    mov.usa_cadeira ? cadeira : '',
    mov.posicao === 'sentada' ? pessoaSentada : pessoaEmPe,
    (mov.usa_objeto ?? mov.usa_toalha) ? toalha : '',
  ].join('\n') + '</g>';
  const _texto = linhas.map((l, i) => `<text x="24" y="${46 + i * 31}" font-size="26" font-weight="800">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="Nunito, Arial, sans-serif" fill="${cor.texto}">
<rect width="480" height="300" fill="${fundo}"/>
<rect x="0" y="222" width="480" height="78" ${chao}/>
${figura}
<text x="24" y="40" font-size="18" font-weight="800" fill="${cor.acento}">${ROTULO[mov.grupo].toUpperCase()}</text>
<text x="24" y="282" font-size="16" fill="${cor.texto_suave}">Ilustração provisória · vídeo em gravação</text>
</svg>\n`;
}

for (const mov of exercicios) writeFileSync(raiz + mov.placeholder, svg(mov));

const simples = (titulo, sub, fundo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="Nunito, Arial, sans-serif" fill="${cor.texto}">
<rect width="480" height="300" fill="${fundo}"/>
<g transform="translate(0 -48)">${pessoaSentada.replace(/285/g, '240').replace(/325/g, '280').replace(/320/g, '275')}</g>
<rect x="0" y="222" width="480" height="78" ${chao}/>
<text x="24" y="40" font-size="18" font-weight="800" fill="${cor.acento}">${titulo.toUpperCase()}</text>
<text x="24" y="282" font-size="16" fill="${cor.texto_suave}">${sub}</text>
</svg>\n`;
writeFileSync(raiz + 'img/aquecimento.svg', simples('Aquecimento', telas.aquecimento, cor.midia));
writeFileSync(raiz + 'img/descanso.svg', simples('Descanso', telas.descanso, cor.midia));
writeFileSync(raiz + 'img/desaquecimento.svg', simples('Desaquecimento', telas.desaquecimento, cor.midia));
console.log(`${exercicios.length} ilustrações + 3 telas geradas em img/`);
