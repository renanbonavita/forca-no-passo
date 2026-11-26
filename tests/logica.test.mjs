// Testes da lógica: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DURACAO, GRUPOS, montarLinhaDoTempo, duracaoTotal, sortearTreino, temLevantarSeguido, nivelDoTreino,
  gerarICS, lerCodigo, normalizarProduto, momentosDasFalas, lerHorario, lerHashTreino, codigoDe, detectarPlataforma, mostrarElastico, proximoDiaUtil, idClinicaValido,
} from '../js/logica.js';

const raiz = new URL('..', import.meta.url);
const { exercicios } = JSON.parse(readFileSync(new URL('exercicios.json', raiz), 'utf8'));
const config = JSON.parse(readFileSync(new URL('config.json', raiz), 'utf8'));
const produto = normalizarProduto(config.produto || {});

test('treino soma exatamente a duração do produto (Força na Caneta: 300 s)', () => {
  const total = produto.duracao.total_segundos;
  assert.ok(total, 'config.produto.duracao.total_segundos ausente');
  for (const nv of produto.niveis) {
    const etapas = montarLinhaDoTempo(sortearTreino(exercicios, nv.nivel), produto.duracao);
    assert.equal(duracaoTotal(etapas), total);
    assert.equal(etapas.at(-1).inicio + etapas.at(-1).dur, total);
  }
  if (produto.id === 'fnc') assert.equal(total, 300);
});

test('framework: sem descanso final e falas sempre dentro da etapa', () => {
  const d = { aquecimento: 15, exercicio: 30, descanso: 10, desaquecimento: 15, descanso_final: false };
  const etapas = montarLinhaDoTempo([1, 2, 3, 4].map((i) => ({ id: i })), d);
  assert.equal(duracaoTotal(etapas), 180);
  assert.equal(etapas.filter((e) => e.tipo === 'descanso').length, 3);
  for (const dd of [d, produto.duracao, { aquecimento: 20, exercicio: 30, descanso: 5, desaquecimento: 20 }]) {
    for (const e of montarLinhaDoTempo([1, 2].map((i) => ({ id: i })), dd)) {
      Object.values(momentosDasFalas(e)).filter((v) => v != null).forEach((t) => assert.ok(t >= 0 && t < e.dur, `${e.tipo}: ${t}s fora de ${e.dur}s`));
    }
  }
});

test('framework: produto padrão, prefixos e horários', () => {
  const p = normalizarProduto({ id: 'batente', prefixo_codigo: 'fnb', niveis: [{ nivel: 1, nome: 'A', de: 1, ate: null }] });
  assert.equal(p.prefixo_codigo, 'FNB');
  assert.equal(lerCodigo('FNB-9', p.prefixos_aceitos), 9);
  assert.equal(lerCodigo('FNC-9', p.prefixos_aceitos), null);
  assert.equal(nivelDoTreino(500, p.niveis), 1);
  assert.throws(() => normalizarProduto({ id: 'Com Espaço' }));
  assert.deepEqual(lerHorario('14:30'), { hora: 14, minuto: 30 });
  const ics = gerarICS({ horarios: ['10:0', '14:0', '16:0'], titulo: 'Pausa – 3 min', id: 'batente', minutos: 3 });
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, 3);
  assert.match(ics, /DURATION:PT3M/);
});

test('biblioteca: 8 movimentos por nível, 2 por grupo, campos completos', () => {
  const campos = ['id', 'nome', 'nivel', 'grupo', 'descricao', 'dica_seguranca', 'versao_facil', 'usa_cadeira', 'envolve_levantar', 'video', 'audio_intro'];
  for (const nivel of produto.niveis.map((n) => n.nivel)) {
    const doNivel = exercicios.filter((e) => e.nivel === nivel);
    assert.equal(doNivel.length, 8, `nível ${nivel}`);
    for (const g of GRUPOS) assert.equal(doNivel.filter((e) => e.grupo === g).length, 2, `nível ${nivel} grupo ${g}`);
  }
  for (const e of exercicios) for (const c of campos) assert.ok(e[c] !== undefined && e[c] !== '', `${e.id} sem ${c}`);
  assert.equal(new Set(exercicios.map((e) => e.id)).size, exercicios.length, 'ids repetidos');
});

test('nada no chão e nada de mergulho de tríceps', () => {
  for (const e of exercicios) {
    const txt = `${e.nome} ${e.descricao} ${e.versao_facil}`.toLowerCase();
    assert.ok(!/mergulho|deitad|no chão, de|de joelhos no chão|ajoelhad|quatro apoios/.test(txt), e.id);
  }
});

test('sorteio: 1 por grupo, não repete combinação anterior, sem levantar seguido', () => {
  for (const nivel of produto.niveis.map((n) => n.nivel)) {
    let anterior = [];
    for (let i = 0; i < 2000; i++) {
      const t = sortearTreino(exercicios, nivel, anterior);
      assert.deepEqual(t.map((m) => m.grupo).sort(), [...GRUPOS].sort());
      assert.ok(t.every((m) => m.nivel === nivel));
      const ids = t.map((m) => m.id);
      assert.notEqual(ids.slice().sort().join(), anterior.slice().sort().join(), 'repetiu a combinação');
      assert.ok(!temLevantarSeguido(t));
      anterior = ids;
    }
  }
});

test('evita levantar seguido mesmo com dois movimentos de levantar', () => {
  const falsos = GRUPOS.map((g, i) => ({ id: g, grupo: g, nivel: 9, envolve_levantar: i < 2 }));
  for (let i = 0; i < 500; i++) assert.ok(!temLevantarSeguido(sortearTreino(falsos, 9)));
});

test('níveis do produto: contínuos, sem buracos, o último sem fim', () => {
  const nv = produto.niveis;
  nv.forEach((n, i) => {
    assert.equal(nivelDoTreino(n.de, nv), n.nivel);
    if (i > 0) assert.equal(n.de, nv[i - 1].ate + 1, `buraco antes do nível ${n.nivel}`);
  });
  assert.equal(nv.at(-1).ate, Infinity);
  assert.equal(nivelDoTreino(100000, nv), nv.at(-1).nivel);
  if (produto.id === 'fnc') assert.deepEqual([1, 6, 7, 15, 16, 100].map((n) => nivelDoTreino(n, nv)), [1, 1, 2, 2, 3, 3]);
});

test('frases: pelo menos 30 e nenhuma cita remédio ou emagrecimento', () => {
  const listas = ['frases_durante', 'frases_levantar', 'frases_toalha', 'frases_objeto', 'frases_10s', 'frases_descanso', 'frases_conclusao'];
  const todas = listas.flatMap((l) => config[l] || []);
  assert.ok(todas.length >= 30, `só ${todas.length} frases`);
  const tudo = JSON.stringify(config) + JSON.stringify(exercicios);
  assert.ok(!/ozempic|mounjaro|wegovy|semaglutid|tirzepatid|liraglutid|saxenda|emagre[cç]a|perca peso|perder peso|kg/i.test(tudo));
});

test('.ics: recorrente seg–sex, 5 min, título correto', () => {
  const agora = new Date(2026, 10, 28, 10, 0); // sábado
  const ics = gerarICS({ hora: 8, minuto: 30, url: 'https://exemplo.com/', agora });
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR/);
  assert.match(ics, /DURATION:PT5M/);
  assert.match(ics, /SUMMARY:Treino Força na Caneta – 5 min/);
  assert.match(ics, /DTSTART:20261130T083000/); // segunda
  assert.ok(ics.includes('\r\n'));
  assert.equal(proximoDiaUtil(8, 0, new Date(2026, 10, 25, 7, 0)).getDate(), 25);
});

test('código de recuperação e link #t=', () => {
  assert.equal(codigoDe(15), 'FNC-15');
  assert.equal(lerCodigo('dose-15'), 15);
  assert.equal(lerCodigo('fnc-15'), 15);
  assert.equal(lerCodigo(' FNC 7 '), 7);
  assert.equal(lerCodigo('abc'), null);
  assert.equal(lerHashTreino('#t=15'), 15);
  assert.equal(lerHashTreino('#x=1&t=3'), 3);
  assert.equal(lerHashTreino(''), null);
});

test('plataforma: iOS, Android e navegadores internos', () => {
  const ig = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0';
  assert.deepEqual(detectarPlataforma(ig), { ios: true, android: false, inApp: 'Instagram', standalone: false });
  assert.equal(detectarPlataforma('Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile').android, true);
  assert.equal(detectarPlataforma('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5).ios, true);
  assert.equal(detectarPlataforma('Mozilla/5.0 (Linux; Android 14) WhatsApp/2.24').inApp, 'WhatsApp');
});

test('Missão Elástico: a partir do 7 e reaparece a cada 5', () => {
  assert.equal(mostrarElastico(6, null), false);
  assert.equal(mostrarElastico(7, null), true);
  assert.equal(mostrarElastico(9, 7), false);
  assert.equal(mostrarElastico(12, 7), true);
});

test('id de clínica', () => {
  assert.ok(idClinicaValido('demo'));
  assert.ok(!idClinicaValido('<script>'));
  assert.ok(!idClinicaValido('Demo'));
});

test('Teste do mês: dias, prazo e faixas', async () => {
  const { diasDesde, testeDevido, faixaTeste } = await import('../js/logica.js');
  const agora = new Date(2026, 10, 30);
  assert.equal(diasDesde('2026-11-01', agora), 29);
  assert.equal(testeDevido([], 30, agora), true);
  assert.equal(testeDevido([{ data: '2026-11-01', n: 10 }], 30, agora), false);
  assert.equal(testeDevido([{ data: '2026-10-31', n: 10 }], 30, agora), true);
  assert.deepEqual([5, 8, 12, 20].map(faixaTeste), ['0-7', '8-11', '12-15', '16+']);
});
