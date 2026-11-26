// Preenche os dados do responsável técnico e o contato a partir do config.json.
fetch('config.json').then((r) => r.json()).then((c) => {
  const rt = c.responsavel_tecnico || {};
  document.querySelectorAll('[data-rt-nome]').forEach((e) => { if (rt.nome) e.textContent = rt.nome; });
  document.querySelectorAll('[data-rt-cref]').forEach((e) => { if (rt.cref) e.textContent = rt.cref; });
  document.querySelectorAll('[data-contato]').forEach((e) => { if (c.contato_email) e.textContent = c.contato_email; });
  const fi = c.responsavel_fisioterapia;
  document.querySelectorAll('[data-fisio]').forEach((e) => { e.hidden = !fi; });
  if (fi) {
    document.querySelectorAll('[data-fisio-nome]').forEach((e) => { e.textContent = fi.nome; });
    document.querySelectorAll('[data-fisio-crefito]').forEach((e) => { e.textContent = fi.crefito; });
  }
}).catch(() => {});
