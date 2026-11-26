// Teste de ponta a ponta no navegador (Playwright): node tests/e2e.mjs
// Cobre: aviso → BORA → treino de 300 s (relógio simulado) → conclusão, contador, 2º treino do dia,
// navegação por endereço (voltar), modo clínica, código de recuperação, lembretes, instalação,
// prévia da conclusão, offline, navegador interno e ausência de erros/violação de CSP.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { iniciarServidor } from '../tools/servidor.mjs';

// Genérico: os textos esperados vêm do config.json do próprio produto.
const raiz = new URL('..', import.meta.url);
const CFG = JSON.parse(readFileSync(new URL('config.json', raiz), 'utf8'));
const P = CFG.produto || {};
const TX = CFG.textos || {};
const R = TX.rotulo_sessao || 'Treino';
const PREFIXO = (P.prefixo_codigo || 'FNC').toUpperCase();
const D = { aquecimento: 30, exercicio: 40, descanso: 20, desaquecimento: 30, ...(P.duracao || {}) };
const TOTAL = D.total_segundos || 300;
const MARCADORES = !!CFG.mostrar_marcadores_de_lugar;
const nTxt = (n) => `${R} nº ${n}`;

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const PORTA = 8199;
const BASE = `http://localhost:${PORTA}/`;
const srv = await iniciarServidor(PORTA);
const browser = await chromium.launch();
const passos = [];
const ok = (t) => { passos.push(t); console.log('✓', t); };
const erros = [];
const vigiar = (page) => {
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy|Refused/i.test(m.text())) erros.push('CSP: ' + m.text()); });
};
const visivel = (page, sel) => page.locator(sel).waitFor({ state: 'visible' });

try {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  vigiar(page);
  await page.clock.install();
  await page.goto(BASE);

  await page.getByRole('heading', { name: 'Antes de começar' }).waitFor();
  assert.ok(!(await page.content()).match(/isen[çc][ãa]o de responsabilidade|assumo|assume a responsabilidade/i));
  ok('aviso aparece no primeiro acesso, sem cláusula de isenção');

  await page.getByRole('button', { name: 'Entendi, bora!' }).click();
  await page.locator('#num-treino', { hasText: nTxt(1) }).waitFor();
  assert.ok((await page.locator('#btn-bora').innerText()).includes(TX.bora_sub || '5 min'));
  assert.ok(await page.locator('#botao-instalar').isVisible());
  ok(`início: BORA com "${TX.bora_sub || '5 min'}", ${nTxt(1)} e "Usar sem internet" no navegador`);

  const eventos = [];
  await page.exposeFunction('registrarEvento', (n) => eventos.push(n));
  await page.evaluate(() => window.addEventListener('fnc:evento', (e) => window.registrarEvento(e.detail.nome)));

  await page.locator('#btn-bora').click();
  await visivel(page, '#treino');
  assert.equal(page.url(), BASE + '#treino');
  assert.equal(await page.locator('#etapa-rotulo').innerText(), 'Aquecimento');
  assert.equal(await page.evaluate(() => window.__fnc.T.total), TOTAL);
  ok(`treino abre em #treino, com aquecimento e ${TOTAL} s no total`);

  await page.clock.runFor((D.aquecimento + 1) * 1000);
  assert.equal(await page.locator('#etapa-rotulo').innerText(), 'Movimento 1 de 4');
  assert.notEqual(await page.locator('#legenda').innerText(), '');
  ok(`após ${D.aquecimento} s entra no movimento 1, com legenda`);

  await page.locator('#btn-facil').click();
  assert.match(await page.locator('#descricao-mov').innerText(), /Versão mais fácil/);
  await page.locator('#btn-voz').click();
  assert.equal(await page.locator('#btn-voz').getAttribute('aria-pressed'), 'false');
  await page.locator('#btn-voz').click();
  ok('versão mais fácil e botão de voz (aria-pressed) funcionam');

  await page.locator('#btn-pausar').click();
  const antes = await page.locator('#cronometro').innerText();
  await page.clock.runFor(10_000);
  assert.equal(await page.locator('#cronometro').innerText(), antes);
  await page.locator('#btn-pausar').click();
  ok('pausar congela o cronômetro');

  await page.clock.runFor((TOTAL - D.aquecimento) * 1000);
  await visivel(page, '#fim');
  assert.equal(page.url(), BASE + '#fim');
  assert.ok((await page.locator('#titulo-fim').innerText()).includes(nTxt(1)));
  assert.equal(await page.evaluate(() => window.__fnc.store.get('treinos')), 1);
  assert.ok(eventos.includes('treino_iniciado') && eventos.includes('treino_concluido'));
  if (MARCADORES && !(CFG.patrocinio || {}).marca) assert.match(await page.locator('#patrocinio').innerText(), /ESPAÇO DO PATROCINADOR/);
  ok(`conclusão em ${TOTAL} s (#fim), contador = 1, eventos enviados`);

  await page.getByRole('button', { name: 'Por hoje tá ótimo' }).click();
  await page.getByText(TX.segundo_do_dia || 'Que tal o 2º treino do dia?').waitFor();
  await page.locator('#num-treino', { hasText: nTxt(2) }).waitFor();
  ok(`início mostra ${nTxt(2)} e sugere mais um no dia`);

  // Voltar do celular no meio do treino: pergunta e não conta
  await page.locator('#btn-bora').click();
  await visivel(page, '#treino');
  page.once('dialog', (d) => d.accept());
  await page.goBack();
  await visivel(page, '#inicio');
  assert.equal(await page.evaluate(() => window.__fnc.T.ativo), false);
  assert.equal(await page.evaluate(() => window.__fnc.store.get('treinos')), 1);
  ok('"voltar" do celular durante o treino pergunta, encerra e não conta');

  // Código de recuperação (seção da página Sobre)
  await page.getByRole('link', { name: 'Meu código' }).click();
  await visivel(page, '#sobre');
  assert.equal(await page.locator('#codigo-texto').innerText(), `${PREFIXO}-1`);
  assert.match(await page.locator('#codigo-link').inputValue(), /#t=1$/);
  await page.locator('#codigo-entrada').fill(`${PREFIXO}-15`);
  await page.getByRole('button', { name: 'Restaurar', exact: true }).click();
  assert.match(await page.locator('#restaurar-texto').innerText(), /\b15\b/);
  await page.getByRole('button', { name: 'Sim, restaurar' }).click();
  await page.getByRole('button', { name: '← Voltar' }).click();
  await page.locator('#num-treino', { hasText: nTxt(16) }).waitFor();
  ok(`código ${PREFIXO}-15 restaura (próximo: nº 16) e "← Voltar" leva ao início`);

  // Link #t=
  await page.goto(BASE + '#t=6');
  await page.locator('#restaurar-texto', { hasText: /\b6\b/ }).waitFor();
  await page.getByRole('button', { name: 'Sim, restaurar' }).click();
  await page.goto(BASE);
  await page.locator('#num-treino', { hasText: nTxt(7) }).waitFor();
  ok('link #t=6 pergunta e restaura');

  // Lembretes
  await page.getByRole('link', { name: 'Lembretes' }).click();
  assert.ok(await page.locator('#sobre-lembretes').evaluate((d) => d.open));
  const icsTexto = decodeURIComponent(await page.locator('#link-ics').getAttribute('href'));
  assert.match(icsTexto, /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR/);
  assert.equal(icsTexto.match(/BEGIN:VEVENT/g).length, (P.lembretes_padrao || ['8:0']).length);
  ok('lembretes abrem a seção e geram .ics recorrente');

  // Modo clínica
  await page.goto(BASE + '?c=demo');
  await page.getByText('Indicado por').waitFor();
  assert.equal(await page.locator('#nome-clinica').innerText(), 'Clínica Exemplo');
  await page.goto(BASE);
  await page.getByText('Indicado por').waitFor();
  ok('modo clínica (?c=demo) aparece e fica guardado');

  // Instalação no iPhone
  await page.getByRole('button', { name: 'Usar sem internet' }).click();
  await visivel(page, '#sobre');
  assert.ok(await page.locator('#sobre-instalar').evaluate((d) => d.open));
  assert.match(await page.locator('#sobre-instalar').innerText(), /Adicionar à Tela de Início/);
  ok('"Usar sem internet" abre as instruções de instalação');

  // Prévia da conclusão com Missão Elástico
  await page.goto(BASE + '?previa=fim');
  if (MARCADORES && !(CFG.elastico || {}).link) {
    await visivel(page, '#card-elastico');
    assert.match(await page.locator('#elastico-link').innerText(), /LINK DE AFILIADO/);
  } else await visivel(page, '#fim');
  ok('prévia da conclusão (?previa=fim) abre');

  // Teste do mês (só nos produtos que ativam)
  if ((P.teste || {}).ativo) {
    await page.goto(BASE);
    await visivel(page, '#link-teste');
    await page.locator('#link-teste').click();
    await visivel(page, '#teste');
    await page.getByRole('button', { name: 'Começar' }).click();
    await page.clock.runFor(((P.teste.segundos || 30) + 4) * 1000);
    await visivel(page, '#teste-resultado');
    const antesT = Number(await page.locator('#teste-valor').innerText());
    await page.getByRole('button', { name: 'Aumentar' }).click();
    await page.getByRole('button', { name: 'Aumentar' }).click();
    await page.getByRole('button', { name: 'Salvar resultado' }).click();
    await visivel(page, '#teste-mensagem');
    assert.equal(await page.evaluate(() => window.__fnc.store.get('testes').at(-1).n), antesT + 2);
    await page.getByRole('button', { name: 'Voltar ao início' }).click();
    await visivel(page, '#inicio');
    assert.ok(!(await page.locator('#link-teste').isVisible()), 'convite do teste continua aparecendo depois de feito');
    await page.goto(BASE + '#sobre/progresso');
    assert.match(await page.locator('#progresso-lista').innerText(), new RegExp(`${antesT + 2} vezes`));
    ok('Teste do mês: 30 s, resultado salvo, convite some e aparece em Meu progresso');
  }
  if (P.compartilhar) {
    await page.goto(BASE);
    assert.ok(await page.locator('#link-compartilhar').isVisible());
    ok('"Compartilhar" aparece no rodapé');
  }

  // Termos
  await page.goto(BASE + 'termos.html');
  await page.getByRole('heading', { name: 'Termos de uso e privacidade' }).waitFor();
  ok('termos abrem');

  // Offline
  await page.goto(BASE);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload();
  await page.locator('#btn-bora').waitFor();
  await ctx.setOffline(false);
  ok('abre offline depois da primeira visita (service worker)');

  // Navegador interno do Instagram
  const ig = await browser.newContext({ ...devices['iPhone 13'], userAgent: devices['iPhone 13'].userAgent + ' Instagram 350.0' });
  const p2 = await ig.newPage();
  vigiar(p2);
  await p2.goto(BASE);
  await p2.getByRole('button', { name: 'Entendi, bora!' }).click();
  await p2.getByRole('button', { name: 'Usar sem internet' }).click();
  await p2.locator('#instalar-inapp', { hasText: 'navegador interno do Instagram' }).waitFor();
  ok('detecta navegador interno do Instagram e orienta abrir no Safari');

  // iPhone SE (tela baixa): BORA e rodapé cabem sem rolar
  const se = await browser.newContext({ ...devices['iPhone SE'] });
  const p3 = await se.newPage();
  vigiar(p3);
  await p3.goto(BASE);
  await p3.getByRole('button', { name: 'Entendi, bora!' }).click();
  await visivel(p3, '#inicio');
  const caber = await p3.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1);
  assert.ok(caber, 'início rola no iPhone SE');
  ok('iPhone SE: tela inicial cabe sem rolar');

  assert.deepEqual(erros, [], 'erros: ' + erros.join(' | '));
  ok('nenhum erro de JavaScript nem violação de CSP');
  console.log(`\n${passos.length} verificações passaram.`);
} catch (e) {
  console.error('✗ FALHOU:', e.message);
  if (erros.length) console.error('Erros:', erros);
  process.exitCode = 1;
} finally {
  await browser.close();
  srv.close();
}
