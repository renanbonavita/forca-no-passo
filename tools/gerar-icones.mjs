// Gera os ícones PNG a partir dos SVGs (precisa do Playwright): node tools/gerar-icones.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const raiz = new URL('..', import.meta.url).pathname;
const alvos = [
  ['icons/quadrado.svg', 'icons/icon-192.png', 192, '#2B59A0'],
  ['icons/quadrado.svg', 'icons/icon-512.png', 512, '#2B59A0'],
  ['icons/maskable.svg', 'icons/icon-maskable-512.png', 512, '#2B59A0'],
  ['icons/quadrado.svg', 'icons/apple-touch-icon.png', 180, '#2B59A0'],
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
