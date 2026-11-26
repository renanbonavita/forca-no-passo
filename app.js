// Framework de micro-treinos (Força na Caneta e família) — app principal, vanilla JS, sem backend.
// O que muda de um produto para outro vem de config.json ("produto", "textos", "falas"...)
// e de exercicios.json; o conteúdo fixo das páginas fica em index.html e termos.html.
import {
  montarLinhaDoTempo, duracaoTotal, sortearTreino, nivelDoTreino, nomeDoNivel, normalizarProduto,
  momentosDasFalas, diasDesde, testeDevido, faixaTeste, codigoDe, lerCodigo, lerHashTreino, hojeISO, gerarICS, linkGoogleAgenda, lerHorario,
  detectarPlataforma, idClinicaValido, mostrarElastico,
} from './js/logica.js';

const $ = (sel) => document.querySelector(sel);
// Elementos de recursos opcionais (Teste do mês, Compartilhar) podem não existir no index.html de um produto.
const NADA = new Proxy({}, { get: (_, k) => (k === 'classList' ? { add() {}, remove() {}, toggle() {} } : (typeof k === 'string' && /^(add|remove|set|append|replace|query|focus|scroll)/.test(k) ? () => NADA : undefined)), set: () => true });
const $o = (sel) => document.querySelector(sel) || NADA;
const sortearDe = (lista) => (lista && lista.length ? lista[Math.floor(Math.random() * lista.length)] : '');

// ---------------- Armazenamento (sempre em try/catch) ----------------
// Prefixo por produto: apps no mesmo domínio (ex.: github.io) não misturam as contagens.
let prefixoStore = 'fnc:';
const store = {
  get(chave, padrao = null) {
    try { const v = localStorage.getItem(prefixoStore + chave); return v === null ? padrao : JSON.parse(v); } catch { return padrao; }
  },
  set(chave, valor) { try { localStorage.setItem(prefixoStore + chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ } },
};
const treinosFeitos = () => Number(store.get('treinos', 0)) || 0;
function treinosHoje() {
  const h = store.get('hoje', null);
  return h && h.dia === hojeISO() ? h.n : 0;
}

// ---------------- Dados ----------------
let config = {};
let produto = normalizarProduto();
let exercicios = [];

// Textos de tela que mudam por produto (gênero, "treino" × "pausa"...). Padrões = Força na Caneta.
const TEXTOS_PADRAO = {
  rotulo_sessao: 'Treino',
  segundo_do_dia: 'Que tal o 2º treino do dia?',
  varios_no_dia: 'Hoje já foram {n} treinos. Que orgulho!',
  titulo_fim: 'Acabou! {rotulo} nº {n} 🎉',
  confirmar_encerrar: 'Encerrar o treino agora? Ele não vai entrar na contagem.',
  aquecimento_descricao: 'Sentada, costas retas. Siga a voz: marcha leve, ombros e mãos.',
  ultimo_descanso_descricao: 'Respire fundo. Já já vem o desaquecimento.',
  desaquecimento_descricao: 'Sente-se, respire e alongue. No final, levante devagar e fique um instante parada antes de sair andando.',
  // Selo do modo parceiro (?c=id): "Indicado por Clínica X", "Oferecido por Empresa X"...
  selo_parceiro: 'Indicado por',
  // Pergunta ao restaurar pelo código. {n} = sessões feitas, {prox} = número da próxima.
  restaurar_um: 'Restaurar para o treino 1? Sua contagem fica com 1 treino feito, e o próximo será o nº 2.',
  restaurar_varios: 'Restaurar para o treino {n}? Sua contagem fica com {n} treinos feitos, e o próximo será o nº {prox}.',
  bora_sub: 'treino de 5 min',
  teste_chamada: 'Teste do mês: quantas vezes você senta e levanta em 30 segundos?',
  teste_instrucao: 'Sente no meio da cadeira encostada na parede, com os braços cruzados no peito. Quando a voz disser "valendo", levante e sente o máximo de vezes que conseguir, com segurança, em 30 segundos. Conte em voz alta.',
  teste_seguranca: 'Se precisar, use as mãos nas coxas. Pare se sentir tontura, dor ou falta de ar.',
  teste_pergunta: 'Quantas vezes você ficou em pé?',
  compartilhar_texto: 'Achei este treino de força de 5 minutos, grátis e sem cadastro. Abra no celular e toque em BORA:',
  requisitos_inicio: 'Cadeira encostada na parede e uma toalha.',
};
const txt = (chave, vars = {}) => String({ ...TEXTOS_PADRAO, ...(config.textos || {}) }[chave] || '')
  .replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
const niveis = () => produto.niveis;
let clinica = null;

async function carregarJSON(url, padrao) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch { return padrao; }
}

// ---------------- Telas ----------------
const TELAS = ['aviso', 'inicio', 'treino', 'fim', 'sobre', 'teste'];
function mostrar(nome) {
  TELAS.forEach((t) => { const el = document.getElementById(t); if (el) el.classList.toggle('ativa', t === nome); });
  window.scrollTo(0, 0);
}

function atualizarInicio() {
  const proximo = treinosFeitos() + 1;
  $('#num-treino').textContent = `${txt('rotulo_sessao')} nº ${proximo}`;
  $('#nome-nivel').textContent = nomeDoNivel(nivelDoTreino(proximo, niveis()), niveis());
  const hoje = treinosHoje();
  const msg = $('#msg-hoje');
  if (hoje === 1) { msg.textContent = txt('segundo_do_dia'); msg.hidden = false; }
  else if (hoje > 1) { msg.textContent = txt('varios_no_dia', { n: hoje }); msg.hidden = false; }
  else msg.hidden = true;
  const lt = $o('#link-teste');
  const t = produto.teste || {};
  lt.hidden = !(t.ativo && testeDevido(store.get('testes', []), t.intervalo_dias || 30));
  lt.textContent = txt('teste_chamada');
}

// ---------------- Reduzir animações ----------------
const querReduzir = () => store.get('reduzir', null) ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function aplicarReduzir() {
  const r = querReduzir();
  document.documentElement.classList.toggle('reduzir-animacoes', !!r);
}

// ---------------- Analytics (sem cookies, sem dados pessoais) ----------------
const filaEventos = [];
function carregarScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.src = src; s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
  return s;
}
function configurarAnalytics() {
  const a = config.analytics || {};
  if (a.goatcounter) {
    const s = carregarScript('https://gc.zgo.at/count.js', { 'data-goatcounter': `https://${a.goatcounter}.goatcounter.com/count` });
    s.onload = () => { while (filaEventos.length) enviarEvento(...filaEventos.shift()); };
  }
  if (a.plausible_dominio) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    carregarScript('https://plausible.io/js/script.js', { 'data-domain': a.plausible_dominio });
  }
}
function enviarEvento(nome, props) {
  try {
    if (window.goatcounter && window.goatcounter.count) {
      // GoatCounter não tem "propriedades": a clínica vai no caminho do evento.
      const caminho = `evento/${nome}` + (props.clinica ? `/${props.clinica}` : '') + (props.nivel ? `/nivel-${props.nivel}` : '') + (props.faixa ? `/faixa-${props.faixa}` : '');
      window.goatcounter.count({ path: caminho, title: nome, event: true });
    } else if ((config.analytics || {}).goatcounter) {
      filaEventos.push([nome, props]);
    }
  } catch { /* ignora */ }
}
function track(nome, extra = {}) {
  const props = { ...extra };
  if (clinica) props.clinica = clinica.id;
  enviarEvento(nome, props);
  try { if (window.plausible && (config.analytics || {}).plausible_dominio) window.plausible(nome, { props }); } catch { /* ignora */ }
  if ((config.analytics || {}).debug) console.info('[evento]', nome, props);
  window.dispatchEvent(new CustomEvent('fnc:evento', { detail: { nome, props } }));
}

// ---------------- Modo clínica ----------------
async function configurarClinica() {
  const dados = await carregarJSON('clinicas.json', { clinicas: [] });
  const lista = dados.clinicas || [];
  const daUrl = new URLSearchParams(location.search).get('c');
  let id = null;
  if (idClinicaValido(daUrl) && lista.some((c) => c.id === daUrl)) { id = daUrl; store.set('clinica', id); }
  else id = store.get('clinica', null);
  clinica = lista.find((c) => c.id === id) || null;
  if (!clinica) return;
  $('#nome-clinica').textContent = clinica.nome;
  $o('#selo-texto').textContent = txt('selo_parceiro');
  const logo = $('#logo-clinica');
  if (clinica.logo) { logo.src = clinica.logo; logo.alt = `Logo ${clinica.nome}`; } else logo.hidden = true;
  if (clinica.cor && /^#[0-9a-f]{3,8}$/i.test(clinica.cor)) document.documentElement.style.setProperty('--cor-clinica', clinica.cor);
  $('#selo-clinica').hidden = false;
}

// ---------------- Voz: MP3 pré-gravado ou speechSynthesis de reserva ----------------
const voz = {
  fila: [], falando: false, player: new Audio(), vozPt: null, ctx: null, timeout: null,
};
function escolherVoz() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  const norm = (v) => (v.lang || '').replace('_', '-').toLowerCase();
  voz.vozPt = vs.find((v) => norm(v) === 'pt-br') || vs.find((v) => norm(v).startsWith('pt')) || null;
}
if ('speechSynthesis' in window) {
  escolherVoz();
  speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
}
const vozLigada = () => store.get('voz', true) !== false;
function legenda(texto) { $('#legenda').textContent = texto || ''; }
const semEmoji = (t) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();

/** Enfileira falas. Cada item: { texto, audio } (audio = caminho do MP3, opcional). */
function falar(itens, { interromper = false } = {}) {
  if (interromper) calar();
  voz.fila.push(...[].concat(itens).filter((i) => i && i.texto));
  if (!voz.falando) proximaFala();
}
function calar() {
  voz.fila = [];
  voz.falando = false;
  clearTimeout(voz.timeout);
  try { voz.player.pause(); } catch { /* */ }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* */ }
}
function proximaFala() {
  const item = voz.fila.shift();
  if (!item) { voz.falando = false; return; }
  voz.falando = true;
  legenda(item.texto);
  const terminou = () => { clearTimeout(voz.timeout); if (voz.falando) proximaFala(); };
  if (!vozLigada()) { voz.timeout = setTimeout(terminou, 1200 + item.texto.length * 60); return; }
  // Rede de segurança: alguns navegadores não disparam "onend".
  voz.timeout = setTimeout(terminou, 1500 + item.texto.length * 95);
  const porTTS = () => {
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(semEmoji(item.texto));
      u.lang = 'pt-BR';
      if (voz.vozPt) u.voice = voz.vozPt;
      u.rate = Number(produto.voz_velocidade) || 1;
      u.onend = terminou;
      speechSynthesis.speak(u);
    } catch { /* sem voz: a legenda continua */ }
  };
  if ((config.audio || {}).usar_mp3 && item.audio) {
    voz.player.src = item.audio;
    voz.player.onended = terminou;
    voz.player.onerror = porTTS;
    voz.player.play().catch(porTTS);
  } else porTTS();
}
const fala = (id) => ({ texto: (config.falas || {})[id] || '', audio: `audio/${id}.mp3` });
const falaDeLista = (lista, prefixo) => {
  const arr = config[lista] || [];
  if (!arr.length) return null;
  const i = Math.floor(Math.random() * arr.length);
  return { texto: arr[i], audio: `audio/${prefixo}-${String(i + 1).padStart(2, '0')}.mp3` };
};

/** Precisa acontecer dentro do toque no botão (gesto do usuário), por causa do iOS. */
function desbloquearAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !voz.ctx) voz.ctx = new AC();
    if (voz.ctx && voz.ctx.state === 'suspended') voz.ctx.resume();
  } catch { /* */ }
  if ((config.audio || {}).usar_mp3) {
    // toca um silêncio curtinho para liberar o <audio> no iPhone
    voz.player.src = silencioWav();
    voz.player.play().catch(() => {});
  }
}
let _silencio = null;
function silencioWav() {
  if (_silencio) return _silencio;
  const n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  _silencio = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  return _silencio;
}
function bipe(freq = 880, ms = 120) {
  try {
    if (!voz.ctx) return;
    const o = voz.ctx.createOscillator(), g = voz.ctx.createGain();
    o.frequency.value = freq; g.gain.value = 0.08;
    o.connect(g); g.connect(voz.ctx.destination);
    o.start(); o.stop(voz.ctx.currentTime + ms / 1000);
  } catch { /* */ }
}

// ---------------- Wake Lock (tela ligada) ----------------
let wakeLock = null;
async function pedirWakeLock() {
  if (!('wakeLock' in navigator)) { $('#aviso-tela').hidden = false; return; }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    $('#aviso-tela').hidden = true;
  } catch { $('#aviso-tela').hidden = false; }
}
function soltarWakeLock() { try { wakeLock && wakeLock.release(); } catch { /* */ } wakeLock = null; }

// ---------------- Motor do treino ----------------
const T = {
  ativo: false, etapas: [], idx: -1, inicioEtapa: 0, pausadoEm: null,
  timer: null, nivel: 1, numero: 1, posicao: 'sentada', ditos: new Set(), facil: false,
};

function comecarTreino(nivelForcado = null) {
  desbloquearAudio();
  T.numero = treinosFeitos() + 1;
  T.nivel = nivelForcado || nivelDoTreino(T.numero, niveis());
  const movs = sortearTreino(exercicios, T.nivel, store.get('ultimaCombo', []));
  store.set('ultimaCombo', movs.map((m) => m.id));
  T.etapas = montarLinhaDoTempo(movs, produto.duracao);
  T.total = duracaoTotal(T.etapas); // sempre 300 s
  T.ativo = true; T.pausadoEm = null; T.posicao = 'sentada';
  rotuloPausa(false);
  ir('#treino', { substituir: location.hash === '#fim' });
  pedirWakeLock();
  track('treino_iniciado', { nivel: T.nivel });
  entrarEtapa(0);
  clearInterval(T.timer);
  T.timer = setInterval(tique, 200);
}

function mostrarMidia(mov, imagemPadrao) {
  const video = $('#video'), img = $('#placeholder');
  const usarVideo = (config.midia || {}).usar_videos && mov && mov.video;
  img.src = mov ? mov.placeholder : imagemPadrao;
  img.alt = mov ? `Ilustração: ${mov.nome}` : '';
  if (usarVideo) {
    video.onerror = () => { video.hidden = true; img.hidden = false; };
    if (!video.src.endsWith(mov.video)) video.src = mov.video;
    video.hidden = false; img.hidden = true;
    video.play().catch(() => {});
  } else {
    video.hidden = true; video.removeAttribute('src'); img.hidden = false;
  }
}

function alertaCadeira(proximo) {
  const el = $('#alerta');
  if (proximo && proximo.usa_cadeira) { $('#alerta-texto').textContent = fala('cadeira-alerta').texto; el.hidden = false; return true; }
  el.hidden = true; return false;
}
function anunciarProximo(proximo) {
  if (!proximo) return;
  const itens = [{ texto: `${fala('a-seguir').texto} ${proximo.nome}.`, audio: proximo.audio_proximo }];
  if (alertaCadeira(proximo)) itens.push(fala('cadeira-alerta'));
  falar(itens);
}

function entrarEtapa(i) {
  if (i >= T.etapas.length) return concluir();
  T.idx = i;
  T.inicioEtapa = Date.now();
  T.ditos = new Set();
  T.facil = false;
  const e = T.etapas[i];
  const btnFacil = $('#btn-facil');
  btnFacil.setAttribute('aria-pressed', 'false');
  btnFacil.disabled = e.tipo !== 'exercicio';
  $('#alerta').hidden = true;

  if (e.tipo === 'aquecimento') {
    $('#etapa-rotulo').textContent = 'Aquecimento';
    $('#nome-mov').textContent = 'Aquecimento';
    $('#descricao-mov').textContent = txt('aquecimento_descricao');
    mostrarMidia(null, 'img/aquecimento.svg');
    falar(fala('aquecimento-1'), { interromper: true });
  } else if (e.tipo === 'exercicio') {
    const m = e.mov;
    $('#etapa-rotulo').textContent = `Movimento ${e.indice + 1} de 4`;
    $('#nome-mov').textContent = m.nome;
    $('#descricao-mov').textContent = m.descricao;
    mostrarMidia(m);
    const itens = [];
    const levantando = m.posicao === 'em_pe' && T.posicao === 'sentada';
    if (levantando) itens.push(fala('levanta-devagar'));
    itens.push({ texto: m.fala_intro, audio: m.audio_intro });
    if (m.envolve_levantar && !/levanta devagar/i.test(m.fala_intro) && !levantando) itens.push(fala('levanta-devagar'));
    falar(itens, { interromper: true });
    T.posicao = m.posicao;
  } else if (e.tipo === 'descanso') {
    $('#etapa-rotulo').textContent = 'Descanso';
    if (e.proximo) {
      $('#nome-mov').textContent = `A seguir: ${e.proximo.nome}`;
      $('#descricao-mov').textContent = e.proximo.dica_seguranca;
      mostrarMidia(e.proximo);
      falar(falaDeLista('frases_descanso', 'descanso'), { interromper: true });
    } else {
      $('#nome-mov').textContent = 'Último descanso';
      $('#descricao-mov').textContent = txt('ultimo_descanso_descricao');
      mostrarMidia(null, 'img/descanso.svg');
      falar(fala('ultimo-descanso'), { interromper: true });
    }
  } else if (e.tipo === 'desaquecimento') {
    $('#etapa-rotulo').textContent = 'Desaquecimento';
    $('#nome-mov').textContent = 'Desaquecimento';
    $('#descricao-mov').textContent = txt('desaquecimento_descricao');
    mostrarMidia(null, 'img/desaquecimento.svg');
    falar(fala('desaquecimento-1'), { interromper: true });
  }
  renderizarTempo();
}

function uma(chave, fn) { if (!T.ditos.has(chave)) { T.ditos.add(chave); fn(); } }

function decorridoNaEtapa() {
  const agora = T.pausadoEm || Date.now();
  return (agora - T.inicioEtapa) / 1000;
}

function tique() {
  if (!T.ativo || T.pausadoEm) return;
  const e = T.etapas[T.idx];
  const d = decorridoNaEtapa();
  const restante = Math.ceil(e.dur - d);

  // Falas programadas por etapa, em momentos proporcionais à duração (js/logica.js)
  const mo = momentosDasFalas(e);
  if (e.tipo === 'aquecimento') {
    if (d >= mo.aq2) uma('aq2', () => falar(fala('aquecimento-2')));
    if (d >= mo.aq3) uma('aq3', () => falar(fala('aquecimento-3')));
    if (d >= mo.prox) uma('prox', () => anunciarProximo(e.proximo));
  } else if (e.tipo === 'exercicio') {
    const m = e.mov;
    if (d >= mo.meio) {
      uma('meio', () => {
        if (m.unilateral) falar(fala('troca-lado'), { interromper: true });
        else if (m.envolve_levantar) falar(falaDeLista('frases_levantar', 'levantar'));
        // usa_objeto (garrafa, elástico...) é o nome novo; usa_toalha continua aceito.
        else if (m.usa_objeto ?? m.usa_toalha) falar(config.frases_objeto ? falaDeLista('frases_objeto', 'objeto') : falaDeLista('frases_toalha', 'toalha'));
        else falar(falaDeLista('frases_durante', 'durante'));
      });
    }
    if (mo.dez != null && d >= mo.dez) uma('10s', () => falar(falaDeLista('frases_10s', 'dez')));
  } else if (e.tipo === 'descanso') {
    if (d >= mo.prox && e.proximo) uma('prox', () => anunciarProximo(e.proximo));
  } else if (e.tipo === 'desaquecimento') {
    if (d >= mo.dq2) uma('dq2', () => falar(fala('desaquecimento-2')));
    if (d >= mo.dq3) uma('dq3', () => falar(fala('desaquecimento-3')));
  }
  if (restante <= 3 && restante >= 1 && e.tipo !== 'desaquecimento') uma('bipe' + restante, () => bipe(restante === 1 ? 1175 : 880));

  if (d >= e.dur) { entrarEtapa(T.idx + 1); return; }
  renderizarTempo();
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
function renderizarTempo() {
  const e = T.etapas[T.idx];
  if (!e) return;
  const d = Math.min(decorridoNaEtapa(), e.dur);
  const restanteEtapa = Math.max(0, Math.ceil(e.dur - d));
  const feito = e.inicio + d;
  $('#cronometro').textContent = restanteEtapa;
  $('#tempo-total').textContent = `${mmss(Math.max(0, Math.ceil(T.total - feito)))} restantes`;
  $('#barra-preenchida').style.width = `${(feito / T.total) * 100}%`;
  $('#barra').setAttribute('aria-valuenow', String(Math.round(feito)));
}

function rotuloPausa(pausado) {
  const b = $('#btn-pausar');
  b.querySelector('use').setAttribute('href', pausado ? '#i-play' : '#i-pausa');
  b.querySelector('span').textContent = pausado ? 'Continuar' : 'Pausar';
}

function pausar(motivo) {
  if (!T.ativo || T.pausadoEm) return;
  T.pausadoEm = Date.now();
  calar();
  legenda(motivo || 'Pausado. Toque em Continuar quando quiser.');
  rotuloPausa(true);
  $('#cronometro').classList.add('pausado');
  try { $('#video').pause(); } catch { /* */ }
}
function continuar() {
  if (!T.pausadoEm) return;
  T.inicioEtapa += Date.now() - T.pausadoEm;
  T.pausadoEm = null;
  legenda('');
  rotuloPausa(false);
  $('#cronometro').classList.remove('pausado');
  if (!$('#video').hidden) $('#video').play().catch(() => {});
}

function pararTreino() {
  T.ativo = false;
  clearInterval(T.timer);
  calar();
  soltarWakeLock();
  try { $('#video').pause(); } catch { /* */ }
}

function concluir() {
  pararTreino();
  const n = treinosFeitos() + 1;
  store.set('treinos', n);
  store.set('ultimoTreino', hojeISO());
  store.set('hoje', { dia: hojeISO(), n: treinosHoje() + 1 });
  track('treino_concluido', { nivel: T.nivel });
  const novoNivel = nivelDoTreino(n + 1, niveis());
  const subiu = novoNivel > nivelDoTreino(n, niveis());
  if (subiu) track('nivel_alcancado', { nivel: novoNivel });
  mostrarFim(n, subiu ? novoNivel : null);
}

// ---------------- Conclusão ----------------
function marcador(texto) {
  const s = document.createElement('span');
  s.className = 'marcador';
  s.textContent = `📍 ${texto}`;
  return s;
}

function mostrarFim(n, novoNivel, { previa = false } = {}) {
  $('#titulo-fim').textContent = txt('titulo_fim', { rotulo: txt('rotulo_sessao'), n });
  const frase = falaDeLista('frases_conclusao', 'conclusao');
  $('#frase-fim').textContent = frase ? frase.texto : '';
  const msgNivel = $('#msg-nivel');
  if (novoNivel) { msgNivel.textContent = `Novo nível desbloqueado: ${nomeDoNivel(novoNivel, niveis())}!`; msgNivel.hidden = false; }
  else msgNivel.hidden = true;

  const marcadores = !!config.mostrar_marcadores_de_lugar;

  // Patrocínio (uma linha discreta)
  const pat = config.patrocinio || {};
  const elPat = $('#patrocinio');
  elPat.replaceChildren();
  if (pat.marca) {
    elPat.append(`${pat.texto || 'Apoio'} `);
    if (pat.link) {
      const a = document.createElement('a');
      a.href = pat.link; a.target = '_blank'; a.rel = 'sponsored noopener';
      a.textContent = pat.marca;
      a.addEventListener('click', () => track('clique_patrocinio'));
      elPat.append(a);
    } else elPat.append(pat.marca);
    elPat.hidden = false;
  } else if (marcadores) {
    elPat.append(marcador('ESPAÇO DO PATROCINADOR — preencher "patrocinio" (marca + link) em config.json'));
    elPat.hidden = false;
  } else elPat.hidden = true;

  // Missão Elástico
  const el = config.elastico || {};
  const card = $('#card-elastico');
  const deveMostrar = previa || mostrarElastico(n, store.get('elasticoDispensadoEm', null), el.a_partir_do_treino || 7, el.repetir_a_cada || 5);
  if (deveMostrar && (el.link || marcadores)) {
    $('#elastico-titulo').textContent = el.titulo || 'Missão Elástico';
    $('#elastico-texto').textContent = el.texto || '';
    const link = $('#elastico-link');
    if (el.link) {
      link.href = el.link; link.textContent = el.botao || 'Ver elásticos';
      link.removeAttribute('aria-disabled'); link.className = 'btn btn-secundario';
    } else {
      link.removeAttribute('href'); link.textContent = '📍 LINK DE AFILIADO DO ELÁSTICO — preencher "elastico.link" em config.json';
      link.setAttribute('aria-disabled', 'true'); link.className = 'btn marcador';
    }
    card.hidden = false;
  } else card.hidden = true;

  fimPronto = true;
  if (previa) mostrar('fim'); else ir('#fim', { substituir: true });
  if (!previa) falar(frase, { interromper: true });
  confete();
}

function confete() {
  const canvas = $('#confete');
  if (querReduzir() || !canvas.getContext) { canvas.hidden = true; return; }
  canvas.hidden = false;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const cores = ['#FF6B4A', '#FFC24B', '#2F9E7A', '#7A5AF8', '#FF9AB0'];
  const pecas = Array.from({ length: 70 }, () => ({
    x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5,
    vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, r: Math.random() * Math.PI,
    cor: cores[Math.floor(Math.random() * cores.length)], w: 6 + Math.random() * 6,
  }));
  const inicio = performance.now();
  (function quadro(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pecas.forEach((p) => {
      p.y += p.vy; p.x += p.vx; p.r += 0.1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.cor; ctx.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); ctx.restore();
    });
    if (t - inicio < 2800) requestAnimationFrame(quadro);
    else { ctx.clearRect(0, 0, innerWidth, innerHeight); canvas.hidden = true; }
  })(inicio);
}

// ---------------- Instalação ----------------
let promptInstalacao = null;
const estaInstalado = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); promptInstalacao = e;
  const b = document.getElementById('btn-instalar-agora');
  if (b) b.hidden = false;
});
window.addEventListener('appinstalled', () => {
  track('instalacao');
  promptInstalacao = null;
  $('#botao-instalar').hidden = true;
});
async function instalar() {
  if (!promptInstalacao) { ir('#sobre/instalar'); return; }
  promptInstalacao.prompt();
  try { await promptInstalacao.userChoice; } catch { /* */ }
  promptInstalacao = null;
  $('#btn-instalar-agora').hidden = true;
}

// ---------------- Navegação por endereço (#), para o "voltar" do celular funcionar ----------------
const pilha = [location.hash];
let fimPronto = false;
let restaurarPendente = null;

function ir(hash, { substituir = false } = {}) {
  const url = hash || location.pathname + location.search;
  if (substituir) { history.replaceState(null, '', url); pilha[pilha.length - 1] = location.hash; }
  else { history.pushState(null, '', url); pilha.push(location.hash); }
  rota();
}
window.addEventListener('hashchange', () => {
  if (pilha.length > 1 && pilha[pilha.length - 2] === location.hash) pilha.pop();
  else pilha.push(location.hash);
  rota();
});
/* "Voltar" desfaz o último passo dentro do app; se a pessoa abriu direto num link, vai para o início. */
function voltar() {
  if (pilha.length > 1) { history.back(); return; }
  ir('', { substituir: true });
}

function rota() {
  if (!store.get('aceite')) { mostrar('aviso'); return; }

  const t = lerHashTreino(location.hash);
  if (t != null) {
    if (t !== treinosFeitos()) { restaurarPendente = t; ir('#sobre/codigo', { substituir: true }); }
    else ir('', { substituir: true });
    return;
  }

  const [tipo, sub] = location.hash.replace('#', '').split('/');

  // Saiu do treino pelo "voltar" do celular: confirma antes de encerrar.
  if (T.ativo && tipo !== 'treino') {
    pausar();
    if (window.confirm(txt('confirmar_encerrar'))) pararTreino();
    else { history.pushState(null, '', '#treino'); pilha.push('#treino'); mostrar('treino'); continuar(); return; }
  }

  if (tipo !== 'teste') pararTeste();
  if (tipo === 'treino') { if (T.ativo) mostrar('treino'); else ir('', { substituir: true }); return; }
  if (tipo === 'teste') { if ((produto.teste || {}).ativo) { prepararTeste(); mostrar('teste'); } else ir('', { substituir: true }); return; }
  if (tipo === 'fim') { if (fimPronto) mostrar('fim'); else ir('', { substituir: true }); return; }
  if (tipo === 'sobre') {
    prepararSobre();
    mostrar('sobre');
    const alvo = { instalar: 'sobre-instalar', lembretes: 'sobre-lembretes', codigo: 'sobre-codigo', voz: 'sobre-voz', movimentos: 'sobre-movimentos', progresso: 'sobre-progresso' }[sub];
    if (alvo) { const d = document.getElementById(alvo); d.open = true; d.scrollIntoView(); }
    return;
  }
  atualizarInicio();
  mostrar('inicio');
}

// ---------------- Página Sobre ----------------
let listaPronta = false;
function prepararSobre() {
  // Os movimentos, por nível
  if (!listaPronta && exercicios.length) {
    const box = $('#lista-movimentos');
    const GR = { pernas: 'Pernas', empurrar: 'Empurrar', costas: 'Costas', extra: 'Extra', ...(produto.nomes_grupos || {}) };
    niveis().map((x) => x.nivel).forEach((nv) => {
      const h = document.createElement('h3');
      h.className = 'nivel-titulo';
      h.textContent = `Nível ${nv} · ${nomeDoNivel(nv, niveis())}`;
      const ul = document.createElement('ul');
      exercicios.filter((e) => e.nivel === nv).forEach((e) => {
        const li = document.createElement('li');
        const b = document.createElement('strong'); b.textContent = `${GR[e.grupo]}: `;
        li.append(b, e.nome);
        ul.append(li);
      });
      box.append(h, ul);
    });
    listaPronta = true;
  }

  // Instalar
  const p = detectarPlataforma(navigator.userAgent, navigator.maxTouchPoints || 0, estaInstalado());
  const inapp = $('#instalar-inapp');
  if (p.inApp) {
    inapp.textContent = `Você está no navegador interno do ${p.inApp}. Para instalar, toque nos três pontinhos (⋯ ou ⋮) e escolha “Abrir no ${p.ios ? 'Safari' : 'navegador'}”.`;
    inapp.hidden = false;
  } else inapp.hidden = true;
  $('#btn-instalar-agora').hidden = !promptInstalacao;

  // Lembretes
  prepararLembretes();

  // Código
  $('#codigo-texto').textContent = codigoDe(treinosFeitos(), produto.prefixo_codigo);
  $('#codigo-link').value = linkRecuperacao();
  const caixa = $('#restaurar-caixa');
  if (restaurarPendente != null) {
    const n = restaurarPendente;
    $('#restaurar-texto').textContent = txt(n === 1 ? 'restaurar_um' : 'restaurar_varios', { n, prox: n + 1 });
    caixa.hidden = false;
  } else caixa.hidden = true;

  // Meu progresso (Teste do mês)
  const sec = $o('#sobre-progresso');
  sec.hidden = !(produto.teste || {}).ativo;
  if (!sec.hidden) {
    const hist = store.get('testes', []);
    const lista = $o('#progresso-lista');
    lista.replaceChildren(...hist.slice().reverse().map((r) => {
      const li = document.createElement('li');
      const [a, m, d] = r.data.split('-');
      li.textContent = `${d}/${m}/${a}: ${r.n} vezes`;
      return li;
    }));
    $o('#progresso-resumo').textContent = hist.length
      ? `Melhor resultado: ${Math.max(...hist.map((r) => r.n))} vezes. Último teste há ${diasDesde(hist.at(-1).data)} dia(s).`
      : 'Você ainda não fez o Teste do mês.';
  }

  // Voz e animações
  $('#opcao-voz').checked = vozLigada();
  $('#opcao-reduzir').checked = !!querReduzir();
}

// ---------------- Lembretes (.ics) ----------------
// Um seletor de horário por lembrete diário (produto.lembretes_padrao define quantos e os horários iniciais).
function prepararLembretes() {
  const box = $('#horarios-lembrete');
  if (!box.children.length) {
    const padrao = produto.lembretes_padrao;
    const salvos = store.get('horariosLembrete', null) || [store.get('horaLembrete', null)].filter(Boolean);
    padrao.forEach((p, i) => {
      const sel = document.createElement('select');
      sel.className = 'campo';
      sel.id = i === 0 ? 'hora-lembrete' : `hora-lembrete-${i + 1}`;
      sel.setAttribute('aria-label', padrao.length > 1 ? `Horário ${i + 1}` : 'Horário');
      for (let h = 6; h <= 21; h++) for (const m of [0, 30]) {
        const o = document.createElement('option');
        o.value = `${h}:${m}`; o.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        sel.append(o);
      }
      sel.value = salvos[i] && lerHorario(salvos[i]) ? salvos[i] : p;
      sel.addEventListener('change', atualizarLinksLembrete);
      box.append(sel);
    });
  }
  atualizarLinksLembrete();
}
function atualizarLinksLembrete() {
  const horarios = [...$('#horarios-lembrete').querySelectorAll('select')].map((s) => s.value);
  store.set('horariosLembrete', horarios);
  const url = location.origin + location.pathname;
  const base = { url, titulo: produto.titulo_lembrete, descricao: produto.descricao_lembrete, id: produto.id, minutos: Math.max(1, Math.round(duracaoTotal(montarLinhaDoTempo([1, 2, 3, 4], produto.duracao)) / 60)) };
  $('#link-ics').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(gerarICS({ ...base, horarios }));
  const google = $('#links-google');
  google.replaceChildren(...horarios.map((h) => {
    const { hora, minuto } = lerHorario(h);
    const a = document.createElement('a');
    a.className = 'botao-link'; a.target = '_blank'; a.rel = 'noopener';
    a.href = linkGoogleAgenda({ ...base, hora, minuto });
    a.textContent = horarios.length > 1 ? `Google Agenda · ${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}` : 'Usar o Google Agenda';
    return a;
  }));
}

// ---------------- Código de recuperação ----------------
function linkRecuperacao() {
  return `${location.origin}${location.pathname}${clinica ? `?c=${clinica.id}` : ''}#t=${treinosFeitos()}`;
}
async function copiarTexto(texto) {
  let ok = false;
  try { await navigator.clipboard.writeText(texto); ok = true; } catch {
    const campo = $('#codigo-link'); campo.select();
    try { ok = document.execCommand('copy'); } catch { /* */ }
  }
  $('#copiado').textContent = ok ? 'Link copiado! Guarde no WhatsApp ou nas notas.' : 'Selecionado. Toque e segure para copiar.';
}

// ---------------- Teste do mês (opcional) ----------------
const TT = { estado: 'intro', timer: null, inicio: 0, valor: 0, ditos: new Set() };
function prepararTeste() {
  pararTeste();
  TT.estado = 'intro';
  const hist = store.get('testes', []);
  TT.valor = hist.length ? hist.at(-1).n : 8;
  $o('#teste-instrucao').textContent = txt('teste_instrucao');
  $o('#teste-seguranca').textContent = txt('teste_seguranca');
  $o('#teste-pergunta').textContent = txt('teste_pergunta');
  $o('#teste-intro').hidden = false;
  $o('#teste-relogio').hidden = true;
  $o('#teste-resultado').hidden = true;
  $o('#teste-mensagem').hidden = true;
  $o('#teste-acao').textContent = 'Começar';
  $o('#teste-acao').disabled = false;
}
function pararTeste() {
  clearInterval(TT.timer); TT.timer = null;
  if (TT.estado === 'contando') { calar(); soltarWakeLock(); TT.estado = 'intro'; }
}
function iniciarContagemTeste() {
  desbloquearAudio();
  pedirWakeLock();
  TT.estado = 'contando';
  TT.ditos = new Set();
  const segundos = (produto.teste || {}).segundos || 30;
  TT.inicio = Date.now() + 3000; // 3, 2, 1
  $o('#teste-intro').hidden = true;
  $o('#teste-relogio').hidden = false;
  $o('#teste-acao').disabled = true;
  falar({ texto: 'Três, dois, um...' }, { interromper: true });
  const tique = () => {
    const d = (Date.now() - TT.inicio) / 1000;
    if (d < 0) { $o('#teste-relogio').textContent = String(Math.ceil(-d)); return; }
    if (!TT.ditos.has('valendo')) { TT.ditos.add('valendo'); bipe(1175, 200); falar({ texto: 'Valendo!' }, { interromper: true }); }
    const resta = Math.max(0, Math.ceil(segundos - d));
    $o('#teste-relogio').textContent = String(resta);
    if (resta <= 10 && !TT.ditos.has('10')) { TT.ditos.add('10'); falar({ texto: 'Faltam 10 segundos.' }); }
    if (d >= segundos) {
      clearInterval(TT.timer); TT.timer = null;
      bipe(880, 400);
      falar({ texto: 'Tempo! Pode sentar e respirar.' }, { interromper: true });
      soltarWakeLock();
      TT.estado = 'resultado';
      $o('#teste-relogio').hidden = true;
      $o('#teste-resultado').hidden = false;
      $o('#teste-valor').textContent = String(TT.valor);
      $o('#teste-acao').textContent = 'Salvar resultado';
      $o('#teste-acao').disabled = false;
    }
  };
  tique();
  TT.timer = setInterval(tique, 200);
}
function salvarTeste() {
  const hist = store.get('testes', []);
  const anterior = hist.length ? hist.at(-1).n : null;
  const hoje = hojeISO();
  const novo = hist.filter((r) => r.data !== hoje);
  novo.push({ data: hoje, n: TT.valor });
  store.set('testes', novo.slice(-36));
  track('teste_concluido', { faixa: faixaTeste(TT.valor) });
  const msg = $o('#teste-mensagem');
  if (anterior == null) msg.textContent = `Resultado guardado: ${TT.valor} vezes. Daqui a um mês tem mais!`;
  else if (TT.valor > anterior) msg.textContent = `${TT.valor} vezes: ${TT.valor - anterior} a mais que no último teste. Que evolução!`;
  else if (TT.valor === anterior) msg.textContent = `${TT.valor} vezes, igual ao último teste. Manter também é vitória!`;
  else msg.textContent = `${TT.valor} vezes. Tem dia que rende menos, e tudo bem. Siga treinando.`;
  msg.hidden = false;
  $o('#teste-resultado').hidden = true;
  TT.estado = 'salvo';
  $o('#teste-acao').textContent = 'Voltar ao início';
}

// ---------------- Mandar para alguém (opcional) ----------------
async function compartilhar(e) {
  e.preventDefault();
  const url = location.origin + location.pathname + (clinica ? `?c=${clinica.id}` : '');
  const texto = txt('compartilhar_texto');
  track('compartilhar');
  if (navigator.share) {
    try { await navigator.share({ title: produto.nome, text: texto, url }); return; } catch { return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank', 'noopener');
}

// ---------------- Textos do responsável técnico ----------------
function preencherTextosProduto() {
  document.querySelectorAll('[data-produto-nome]').forEach((e) => { e.textContent = produto.nome; });
  document.querySelectorAll('[data-titulo-lembrete]').forEach((e) => { e.textContent = produto.titulo_lembrete; });
  $('#link-ics').setAttribute('download', `lembrete-${produto.id}.ics`);
  $('#bora-sub').textContent = txt('bora_sub');
  $('#requisitos-inicio').textContent = txt('requisitos_inicio');
}
function preencherSlogan() {
  const el = $('#slogan');
  if (typeof config.slogan !== 'string') return;
  // Cada linha do slogan (separada por \n no config.json) fica numa linha da tela.
  el.replaceChildren(...config.slogan.split('\n').filter(Boolean).map((t) => {
    const sp = document.createElement('span'); sp.textContent = t.trim(); return sp;
  }));
  el.hidden = !config.slogan.trim();
}
function preencherRT() {
  const rt = config.responsavel_tecnico || {};
  document.querySelectorAll('[data-rt-nome]').forEach((e) => { e.textContent = rt.nome || '[NOME]'; });
  document.querySelectorAll('[data-rt-cref]').forEach((e) => { e.textContent = rt.cref || '[NÚMERO]'; });
  // Segundo responsável (opcional), ex.: fisioterapeuta no produto 60+.
  const fi = config.responsavel_fisioterapia;
  document.querySelectorAll('[data-fisio]').forEach((e) => { e.hidden = !fi; });
  if (fi) {
    document.querySelectorAll('[data-fisio-nome]').forEach((e) => { e.textContent = fi.nome || '[NOME]'; });
    document.querySelectorAll('[data-fisio-crefito]').forEach((e) => { e.textContent = fi.crefito || '[NÚMERO]'; });
  }
}

// ---------------- Service worker ----------------
function registrarSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const tinhaControle = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
    // Quando uma versão nova assume, recarrega uma vez (nunca no meio de um treino).
    let recarregou = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!tinhaControle || recarregou || T.ativo) return;
      recarregou = true;
      location.reload();
    });
  }
}

// ---------------- Eventos ----------------
function rotuloVoz() {
  const ligada = vozLigada();
  $('#btn-voz').setAttribute('aria-pressed', String(ligada));
  $('#btn-voz').setAttribute('aria-label', ligada ? 'Voz ligada. Toque para desligar' : 'Voz desligada. Toque para ligar');
}

function ligarEventos() {
  $('#btn-aceitar').addEventListener('click', () => { store.set('aceite', new Date().toISOString()); rota(); });
  $('#btn-bora').addEventListener('click', () => comecarTreino());
  $('#botao-instalar').addEventListener('click', instalar);
  $('#btn-instalar-agora').addEventListener('click', instalar);

  // Treino
  $('#btn-pausar').addEventListener('click', () => (T.pausadoEm ? continuar() : pausar()));
  $('#btn-pular').addEventListener('click', () => { if (T.pausadoEm) continuar(); entrarEtapa(T.idx + 1); });
  $('#btn-facil').addEventListener('click', () => {
    const e = T.etapas[T.idx];
    if (!e || e.tipo !== 'exercicio') return;
    T.facil = !T.facil;
    $('#btn-facil').setAttribute('aria-pressed', String(T.facil));
    $('#descricao-mov').textContent = T.facil ? `Versão mais fácil: ${e.mov.versao_facil}` : e.mov.descricao;
    if (T.facil) falar({ texto: `Versão mais fácil: ${e.mov.versao_facil}` }, { interromper: true });
  });
  $('#btn-voz').addEventListener('click', () => {
    store.set('voz', !vozLigada());
    rotuloVoz();
    if (!vozLigada()) { try { voz.player.pause(); speechSynthesis.cancel(); } catch { /* */ } }
  });
  $('#btn-encerrar').addEventListener('click', () => {
    pausar();
    if (window.confirm(txt('confirmar_encerrar'))) { pararTreino(); voltar(); }
    else continuar();
  });

  // Conclusão
  $('#btn-mais-uma').addEventListener('click', () => { track('mais_uma_rodada', { nivel: T.nivel }); comecarTreino(T.nivel); });
  $('#btn-por-hoje').addEventListener('click', () => { calar(); fimPronto = false; ir('', { substituir: true }); });
  $('#btn-dispensar-elastico').addEventListener('click', () => { store.set('elasticoDispensadoEm', treinosFeitos()); $('#card-elastico').hidden = true; });
  $('#elastico-link').addEventListener('click', (e) => {
    if ($('#elastico-link').getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    track('clique_elastico');
  });

  // Teste do mês
  $o('#teste-acao').addEventListener('click', () => {
    if (TT.estado === 'intro') iniciarContagemTeste();
    else if (TT.estado === 'resultado') salvarTeste();
    else if (TT.estado === 'salvo') ir('', { substituir: true });
  });
  $o('#teste-menos').addEventListener('click', () => { TT.valor = Math.max(0, TT.valor - 1); $o('#teste-valor').textContent = String(TT.valor); });
  $o('#teste-mais').addEventListener('click', () => { TT.valor = Math.min(60, TT.valor + 1); $o('#teste-valor').textContent = String(TT.valor); });
  $o('#link-compartilhar').addEventListener('click', compartilhar);

  // Sobre
  document.querySelectorAll('[data-voltar]').forEach((b) => b.addEventListener('click', voltar));
  $('#btn-copiar').addEventListener('click', () => copiarTexto($('#codigo-link').value));
  $('#btn-usar-codigo').addEventListener('click', () => {
    const n = lerCodigo($('#codigo-entrada').value, produto.prefixos_aceitos);
    if (n == null) { $('#codigo-erro').textContent = `Código inválido. Ele tem o formato ${produto.prefixo_codigo}-15.`; return; }
    $('#codigo-erro').textContent = '';
    restaurarPendente = n;
    prepararSobre();
    $('#restaurar-caixa').scrollIntoView({ block: 'center' });
    $('#btn-restaurar-sim').focus();
  });
  $('#btn-restaurar-sim').addEventListener('click', () => {
    store.set('treinos', restaurarPendente);
    restaurarPendente = null;
    prepararSobre();
    $('#copiado').textContent = 'Contagem restaurada.';
  });
  $('#btn-restaurar-nao').addEventListener('click', () => { restaurarPendente = null; prepararSobre(); });
  $('#opcao-voz').addEventListener('change', (e) => { store.set('voz', e.target.checked); rotuloVoz(); });
  $('#opcao-reduzir').addEventListener('change', (e) => { store.set('reduzir', e.target.checked); aplicarReduzir(); });

  document.addEventListener('visibilitychange', () => {
    if (!T.ativo) return;
    if (document.visibilityState === 'hidden') pausar('Pausado porque você saiu do app. Toque em Continuar.');
    else pedirWakeLock();
  });
}

// ---------------- Início ----------------
// Cores do produto (config.json → produto.cores), aplicadas como variáveis CSS.
// Só "principal" é obrigatória; as demais são opcionais e, se ausentes, ficam as do styles.css.
const CORES_CSS = {
  principal: '--coral', principal_hover: '--coral-hover', principal_suave: '--coral-suave', acento: '--acento', texto_botao: '--texto-botao',
  fundo: '--fundo', superficie: '--botao', borda: '--borda', texto: '--texto', texto_suave: '--suave', contorno: '--contorno', midia: '--midia',
};
function aplicarCores() {
  const c = produto.cores || {};
  Object.entries(CORES_CSS).forEach(([k, v]) => {
    if (typeof c[k] === 'string' && /^#[0-9a-f]{3,8}$/i.test(c[k])) document.documentElement.style.setProperty(v, c[k]);
  });
}

async function iniciar() {
  [config, exercicios] = await Promise.all([
    carregarJSON('config.json', {}),
    carregarJSON('exercicios.json', { exercicios: [] }).then((j) => j.exercicios || []),
  ]);
  try { produto = normalizarProduto(config.produto || {}); } catch (e) { console.error(e); }
  prefixoStore = `${produto.id}:`;
  aplicarCores();
  // Tamanho de letra do produto (ex.: 1.12 = 12% maior; tudo em rem acompanha).
  if (Number(produto.escala_fonte) > 0) document.documentElement.style.fontSize = `${Number(produto.escala_fonte) * 100}%`;
  $o('#it-compartilhar').hidden = !produto.compartilhar;
  preencherRT();
  preencherTextosProduto();
  preencherSlogan();
  aplicarReduzir();
  rotuloVoz();
  ligarEventos();
  await configurarClinica();
  configurarAnalytics();
  registrarSW();
  if (!estaInstalado()) $('#botao-instalar').hidden = false;

  if (new URLSearchParams(location.search).get('previa') === 'fim') {
    mostrarFim(treinosFeitos() || 7, null, { previa: true });
    return;
  }
  rota();
}
iniciar();

// Exposto só para testes automatizados.
window.__fnc = { T, store };
