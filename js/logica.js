// Lógica pura do framework (sem DOM). Usada pelo app e pelos testes.
// Tudo o que muda de um produto para outro vem do bloco "produto" do config.json
// (veja normalizarProduto). Os valores padrão abaixo são os do Força na Caneta.

// Padrão: 30 s + 4 × (40 s + 20 s) + 30 s = 300 s = 5 min.
export const DURACAO = Object.freeze({ aquecimento: 30, exercicio: 40, descanso: 20, desaquecimento: 30, descanso_final: true });
export const GRUPOS = Object.freeze(['pernas', 'empurrar', 'costas', 'extra']);

export const NIVEIS = Object.freeze([
  { nivel: 1, nome: 'Esquentando', de: 1, ate: 6 },
  { nivel: 2, nome: 'Pegando no tranco', de: 7, ate: 15 },
  { nivel: 3, nome: 'Força Total', de: 16, ate: Infinity },
]);

export const PRODUTO_PADRAO = Object.freeze({
  id: 'fnc',
  nome: 'Força na Caneta',
  prefixo_codigo: 'FNC',
  prefixos_aceitos: ['FNC', 'DOSE'],
  titulo_lembrete: 'Treino Força na Caneta – 5 min',
  descricao_lembrete: 'Hora do treino de 5 minutos! Cadeira encostada na parede, toalha na mão e bora.',
  lembretes_padrao: ['8:0'],
  duracao: DURACAO,
  niveis: NIVEIS,
});

/** Junta o bloco "produto" do config.json com os padrões e valida o essencial. */
export function normalizarProduto(p = {}) {
  const produto = { ...PRODUTO_PADRAO, ...p };
  produto.duracao = { ...DURACAO, ...(p.duracao || {}) };
  produto.niveis = (p.niveis && p.niveis.length ? p.niveis : NIVEIS)
    .map((nv) => ({ ...nv, ate: nv.ate == null ? Infinity : nv.ate }));
  produto.prefixo_codigo = String(produto.prefixo_codigo || 'FNC').toUpperCase();
  produto.prefixos_aceitos = [...new Set([produto.prefixo_codigo, ...(p.prefixos_aceitos || [])].map((x) => String(x).toUpperCase()))];
  if (!/^[a-z0-9-]{1,20}$/.test(produto.id)) throw new Error('produto.id inválido: use letras minúsculas, números e hífen');
  return produto;
}

/** Nível do treino de número `n` (1, 2, 3...). */
export function nivelDoTreino(n, niveis = NIVEIS) {
  const achado = niveis.find((nv) => n >= nv.de && n <= (nv.ate == null ? Infinity : nv.ate));
  return achado ? achado.nivel : 1;
}
export const nomeDoNivel = (nivel, niveis = NIVEIS) => (niveis.find((nv) => nv.nivel === nivel) || niveis[0]).nome;

/**
 * Monta a sequência de etapas do treino com o segundo de início de cada uma.
 * Com d.descanso_final = false, não há descanso depois do último movimento.
 */
export function montarLinhaDoTempo(movimentos, d = DURACAO) {
  const etapas = [{ tipo: 'aquecimento', dur: d.aquecimento, proximo: movimentos[0] || null }];
  movimentos.forEach((mov, i) => {
    etapas.push({ tipo: 'exercicio', dur: d.exercicio, mov, indice: i });
    const ultimo = i === movimentos.length - 1;
    if (!ultimo || d.descanso_final !== false) etapas.push({ tipo: 'descanso', dur: d.descanso, proximo: movimentos[i + 1] || null, indice: i });
  });
  etapas.push({ tipo: 'desaquecimento', dur: d.desaquecimento });
  let t = 0;
  for (const e of etapas) { e.inicio = t; t += e.dur; }
  return etapas;
}
export const duracaoTotal = (etapas) => etapas.reduce((soma, e) => soma + e.dur, 0);

/**
 * Momentos (em segundos dentro da etapa) em que cada fala programada toca.
 * Proporcionais à duração, para funcionar com etapas curtas ou longas.
 */
export function momentosDasFalas(e) {
  const d = e.dur;
  if (e.tipo === 'aquecimento') return { aq2: d / 3, aq3: d * 0.6, prox: Math.max(d * 0.6 + 2, d - 7) };
  if (e.tipo === 'exercicio') return { meio: d / 2, dez: d >= 25 ? d - 10 : null };
  if (e.tipo === 'descanso') return { prox: Math.min(7, d * 0.35) };
  if (e.tipo === 'desaquecimento') return { dq2: d / 3, dq3: (d * 2) / 3 };
  return {};
}

function sortearUm(lista, rnd) { return lista[Math.floor(rnd() * lista.length)]; }
function embaralhar(lista, rnd) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function temLevantarSeguido(ordem) {
  for (let i = 0; i < ordem.length - 1; i++) {
    if (ordem[i].envolve_levantar && ordem[i + 1].envolve_levantar) return true;
  }
  return false;
}
const chaveCombo = (ids) => ids.slice().sort().join('|');

/**
 * Sorteia 1 movimento de cada grupo do nível, em ordem aleatória.
 * - nunca repete a combinação exata do treino anterior (se houver alternativa);
 * - evita dois movimentos com envolve_levantar seguidos.
 */
export function sortearTreino(exercicios, nivel, idsAnteriores = [], rnd = Math.random) {
  const doNivel = exercicios.filter((e) => e.nivel === nivel);
  const porGrupo = GRUPOS.map((g) => doNivel.filter((e) => e.grupo === g));
  porGrupo.forEach((lista, i) => {
    if (!lista.length) throw new Error(`Nível ${nivel} sem movimento do grupo "${GRUPOS[i]}"`);
  });
  const chaveAnterior = chaveCombo(idsAnteriores);
  const totalCombos = porGrupo.reduce((p, l) => p * l.length, 1);

  let escolha;
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    escolha = porGrupo.map((lista) => sortearUm(lista, rnd));
    if (totalCombos === 1 || chaveCombo(escolha.map((e) => e.id)) !== chaveAnterior) break;
  }
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const ordem = embaralhar(escolha, rnd);
    if (!temLevantarSeguido(ordem)) return ordem;
  }
  return embaralhar(escolha, rnd);
}

// ---------- Código de recuperação ----------
export const codigoDe = (treinos, prefixo = 'FNC') => `${prefixo}-${treinos}`;
export function lerCodigo(texto, prefixos = ['FNC', 'DOSE']) {
  const alt = prefixos.map((x) => String(x).replace(/[^A-Za-z0-9]/g, '')).filter(Boolean).join('|');
  const m = String(texto || '').trim().match(new RegExp(`^(?:${alt})[\\s-]?(\\d{1,4})$`, 'i'));
  return m ? Number(m[1]) : null;
}
export function lerHashTreino(hash) {
  const m = String(hash || '').match(/[#&]t=(\d{1,4})(?:&|$)/);
  return m ? Number(m[1]) : null;
}

// ---------- Datas ----------
const doisDig = (n) => String(n).padStart(2, '0');
export function hojeISO(agora = new Date()) {
  return `${agora.getFullYear()}-${doisDig(agora.getMonth() + 1)}-${doisDig(agora.getDate())}`;
}

/** Próximo dia útil (seg–sex) a partir de hoje, no horário pedido. */
export function proximoDiaUtil(hora, minuto, agora = new Date()) {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), hora, minuto, 0);
  if (d <= agora) d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}
const fmtLocal = (d) => `${d.getFullYear()}${doisDig(d.getMonth() + 1)}${doisDig(d.getDate())}T${doisDig(d.getHours())}${doisDig(d.getMinutes())}00`;
const fmtUTC = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escaparICS = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const TITULO_LEMBRETE = PRODUTO_PADRAO.titulo_lembrete;

/** "8:30" → { hora: 8, minuto: 30 } */
export function lerHorario(txt) {
  const m = String(txt).match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return null;
  const hora = Number(m[1]), minuto = Number(m[2]);
  return hora < 24 && minuto < 60 ? { hora, minuto } : null;
}

/**
 * Gera um .ics com um evento recorrente de segunda a sexta para cada horário
 * (horário local "flutuante"). Aceita { hora, minuto } ou { horarios: ['10:0', '14:0'] }.
 */
export function gerarICS({ hora, minuto, horarios, url = '', agora = new Date(), titulo = TITULO_LEMBRETE, descricao = PRODUTO_PADRAO.descricao_lembrete, id = 'fnc', minutos = 5 }) {
  const lista = (horarios || [`${hora}:${minuto}`]).map(lerHorario).filter(Boolean);
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${id}//Lembrete//PT-BR`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  lista.forEach(({ hora: h, minuto: m }) => {
    const inicio = proximoDiaUtil(h, m, agora);
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${id}-${fmtUTC(agora)}-${doisDig(h)}${doisDig(m)}@${id}.lembrete`,
      `DTSTAMP:${fmtUTC(agora)}`,
      `DTSTART:${fmtLocal(inicio)}`,
      `DURATION:PT${minutos}M`,
      'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      `SUMMARY:${escaparICS(titulo)}`,
      `DESCRIPTION:${escaparICS(`${descricao} ${url}`.trim())}`,
    );
    if (url) linhas.push(`URL:${url}`);
    linhas.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0S', `DESCRIPTION:${escaparICS(titulo)}`, 'END:VALARM', 'END:VEVENT');
  });
  linhas.push('END:VCALENDAR');
  return linhas.join('\r\n') + '\r\n';
}

/** Link para criar o lembrete de UM horário no Google Agenda (útil no Android). */
export function linkGoogleAgenda({ hora, minuto, url = '', agora = new Date(), titulo = TITULO_LEMBRETE, descricao = PRODUTO_PADRAO.descricao_lembrete, minutos = 5 }) {
  const inicio = proximoDiaUtil(hora, minuto, agora);
  const fim = new Date(inicio.getTime() + minutos * 60 * 1000);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${fmtLocal(inicio)}/${fmtLocal(fim)}`,
    recur: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    details: `${descricao} ${url}`.trim(),
    ctz: 'America/Sao_Paulo',
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// ---------- Plataforma ----------
export function detectarPlataforma(ua = '', toques = 0, standalone = false) {
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && toques > 1);
  const android = /Android/i.test(ua);
  let inApp = null;
  if (/Instagram/i.test(ua)) inApp = 'Instagram';
  else if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) inApp = 'Facebook';
  else if (/WhatsApp/i.test(ua)) inApp = 'WhatsApp';
  else if (/musical_ly|Bytedance|TikTok/i.test(ua)) inApp = 'TikTok';
  else if (/\bLine\//i.test(ua)) inApp = 'Line';
  return { ios, android, inApp, standalone: !!standalone };
}

/** Id de clínica válido: letras minúsculas, números e hífen. */
export const idClinicaValido = (id) => typeof id === 'string' && /^[a-z0-9-]{1,40}$/.test(id);

/** Deve mostrar o card "Missão Elástico" depois do treino número `n`? */
export function mostrarElastico(n, dispensadoEm, aPartirDe = 7, aCada = 5) {
  if (n < aPartirDe) return false;
  if (dispensadoEm == null) return true;
  return n - dispensadoEm >= aCada;
}

// ---------- Teste do mês (opcional) ----------
const DIA_MS = 24 * 60 * 60 * 1000;
/** Dias inteiros entre a data ISO (AAAA-MM-DD) e hoje. */
export function diasDesde(iso, agora = new Date()) {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a) return Infinity;
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((hoje - new Date(a, m - 1, d)) / DIA_MS);
}
/** O teste está "na hora" se nunca foi feito ou se o último tem intervaloDias ou mais. */
export function testeDevido(historico = [], intervaloDias = 30, agora = new Date()) {
  if (!historico.length) return true;
  return diasDesde(historico.at(-1).data, agora) >= intervaloDias;
}
/** Faixa do resultado, para relatórios agregados (nunca o número exato de uma pessoa). */
export function faixaTeste(n) {
  if (n <= 7) return '0-7';
  if (n <= 11) return '8-11';
  if (n <= 15) return '12-15';
  return '16+';
}
