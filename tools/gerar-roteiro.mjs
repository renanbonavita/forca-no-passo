// Gera ROTEIRO-GRAVACAO.md (lista de vídeos e áudios) a partir de exercicios.json e config.json.
// Uso: node tools/gerar-roteiro.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const raiz = new URL('..', import.meta.url).pathname;
const { exercicios } = JSON.parse(readFileSync(raiz + 'exercicios.json', 'utf8'));
const cfg = JSON.parse(readFileSync(raiz + 'config.json', 'utf8'));
const G = { pernas: 'Pernas', empurrar: 'Empurrar', costas: 'Costas', extra: 'Extra', ...((cfg.produto || {}).nomes_grupos || {}) };
const N = Object.fromEntries(((cfg.produto || {}).niveis || [{ nivel: 1, nome: 'Esquentando' }, { nivel: 2, nome: 'Pegando no tranco' }, { nivel: 3, nome: 'Força Total' }]).map((n) => [n.nivel, n.nome]));
const NOME = (cfg.produto || {}).nome || 'Força na Caneta';
// Orientações de gravação por produto (config.json → "roteiro"), com os padrões do Força na Caneta.
const R = {
  cenario: 'Fundo claro e liso, luz natural, cadeira firme **com o encosto encostado na parede** e toalha visível.',
  modelo: 'Modelo real de 40 a 59 anos, roupa confortável, sem foco em corpo "ideal".',
  voz: 'voz feminina animada e acolhedora',
  ...(cfg.roteiro || {}),
};
const SEG = ((cfg.produto || {}).duracao || {}).exercicio || 40;

let md = `# Roteiro de gravação — ${NOME}

> Arquivo gerado por \`node tools/gerar-roteiro.mjs\`. Se mudar exercícios ou frases, gere de novo.

## Padrão técnico

**Vídeos (${exercicios.length}):** MP4 (H.264), vertical ou 4:3, 720p, **6 a 10 segundos em loop perfeito** (o fim emenda no começo), **sem som**, até 1,5 MB cada. ${R.cenario} ${R.modelo} Mostre 2 ou 3 repetições em ritmo controlado. Grave também 1 repetição da **versão mais fácil** (opcional, para uma versão futura).

**Áudios:** MP3 mono, 64–96 kbps, ${R.voz}, **sem trilha**, 0,2 s de silêncio no começo e no fim. Normalize para −16 LUFS. O nome do arquivo tem que ser **exatamente** o indicado.

Depois de gravar: coloque os vídeos em \`videos/\` e os áudios em \`audio/\`, mude \`"usar_videos": true\` e \`"usar_mp3": true\` no \`config.json\` e aumente a \`VERSAO\` no \`sw.js\`.

## 1. Vídeos dos movimentos

| # | Arquivo | Movimento | Grupo | O que mostrar | Atenção na gravação |
|---|---|---|---|---|---|
`;
exercicios.forEach((e, i) => {
  md += `| ${i + 1} | \`${e.video}\` | **${e.nome}** (nível ${e.nivel} · ${N[e.nivel]}) | ${G[e.grupo]} | ${e.descricao} | ${e.dica_seguranca}${e.unilateral ? ' Mostre os dois lados.' : ''} |\n`;
});

md += `\n## 2. Áudios de cada movimento (${exercicios.length * 2})\n\nPara cada movimento: uma **apresentação** (tocada no início dos ${SEG} s) e um **"A seguir"** (tocado no descanso anterior).\n\n| Arquivo | Texto |\n|---|---|\n`;
exercicios.forEach((e) => {
  md += `| \`${e.audio_intro}\` | ${e.fala_intro} |\n| \`${e.audio_proximo}\` | ${cfg.falas['a-seguir']} ${e.nome}. |\n`;
});

md += `\n## 3. Falas fixas\n\n| Arquivo | Texto | Quando toca |\n|---|---|---|\n`;
const quando = {
  'aquecimento-1': 'Início do aquecimento (0 s)', 'aquecimento-2': 'Aquecimento, 10 s', 'aquecimento-3': 'Aquecimento, 18 s',
  'cadeira-alerta': 'Antes de movimento com cadeira', 'levanta-devagar': 'Ao levantar da cadeira / movimentos de levantar',
  'troca-lado': 'Metade dos movimentos de um lado só', 'ultimo-descanso': 'Último descanso',
  'desaquecimento-1': 'Início do desaquecimento', 'desaquecimento-2': 'Desaquecimento, 10 s', 'desaquecimento-3': 'Desaquecimento, 20 s',
  'a-seguir': 'Não precisa gravar sozinho (já entra nos arquivos prox-*)',
};
Object.entries(cfg.falas).forEach(([id, t]) => { md += `| \`audio/${id}.mp3\` | ${t} | ${quando[id] || ''} |\n`; });

const listas = [
  ['frases_durante', 'durante', 'Metade dos movimentos (geral)'],
  ['frases_levantar', 'levantar', 'Metade dos movimentos de levantar'],
  ['frases_toalha', 'toalha', 'Metade dos movimentos com toalha'],
  ['frases_objeto', 'objeto', 'Metade dos movimentos com objeto (garrafa, elástico...)'],
  ['frases_10s', 'dez', 'Faltando 10 s'],
  ['frases_descanso', 'descanso', 'Início do descanso'],
  ['frases_conclusao', 'conclusao', 'Tela final'],
];
let total = 0;
md += `\n## 4. Frases sorteadas\n\nO número do arquivo segue a ordem da lista no \`config.json\` (01 = primeira frase).\n`;
for (const [k, p, q] of listas.filter(([k]) => (cfg[k] || []).length)) {
  md += `\n### ${q}\n\n| Arquivo | Texto |\n|---|---|\n`;
  (cfg[k] || []).forEach((t, i) => { total++; md += `| \`audio/${p}-${String(i + 1).padStart(2, '0')}.mp3\` | ${t.replace(/ ?💪/, '')} |\n`; });
}
const fixas = Object.keys(cfg.falas).length - 1;
md += `\n---\n\n**Total:** ${exercicios.length} vídeos e ${exercicios.length * 2 + fixas + total} áudios (${exercicios.length * 2} de movimentos, ${fixas} falas fixas e ${total} frases).\n`;
writeFileSync(raiz + 'ROTEIRO-GRAVACAO.md', md);
console.log('ROTEIRO-GRAVACAO.md gerado');
