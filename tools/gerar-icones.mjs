// Gera os ícones PNG a partir dos SVGs (precisa do Playwright): node tools/gerar-icones.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const raiz = new URL('..', import.meta.url).pathname;
// Fundo dos ícones = cor principal do produto (config.json → produto.cores.principal).
const cor = ((JSON.parse(readFileSync(raiz + 'config.json', 'utf8')).produto || {}).cores || {}).principal || '#FF6B4A';
const alvos = [
  ['icons/quadrado.svg', 'icons/icon-192.png', 192, cor],
  ['icons/quadrado.svg', 'icons/icon-512.png', 512, cor],
  ['icons/maskable.svg', 'icons/icon-maskable-512.png', 512, cor],
  ['icons/quadrado.svg', 'icons/apple-touch-icon.png', 180, cor],
];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap" rel="stylesheet"><div id="a"></div>');
for (const [svg, png, tam, fundo] of alvos) {
  const conteudo = readFileSync(raiz + svg, 'utf8').replace('<svg ', `<svg width="${tam}" height="${tam}" `);
  await page.setViewportSize({ width: tam, height: tam });
  await page.evaluate(([c, f]) => { document.body.style.cssText = `margin:0;background:${f}`; document.getElementById('a').innerHTML = c; }, [conteudo, fundo]);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: raiz + png, omitBackground: fundo === 'transparent', clip: { x: 0, y: 0, width: tam, height: tam } });
  console.log('ok', png);
}
await browser.close();
