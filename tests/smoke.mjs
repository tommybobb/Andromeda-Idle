// Browser smoke test: creates a commander, starts an action and visits every
// page at desktop and phone sizes, failing on any uncaught error.
//
//   npm start            (in one terminal)
//   npm run smoke        (needs the playwright package and a Chromium build)
//
// Set BASE_URL to test a deployed copy.

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const ROUTES = [
  'bridge', 'commander', 'cargo', 'market', 'hangar', 'mining', 'gas', 'salvaging', 'exploration', 'xenobiology',
  'refining', 'fabrication', 'chemistry', 'engineering', 'trading', 'research', 'piloting', 'logbook', 'stats', 'settings',
];

const errors = [];
const browser = await chromium.launch();

async function run(name, viewport, mobile) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(BASE);
  await page.waitForSelector('#intro:not([hidden])');
  await page.fill('#cmdr-name', 'Smoke');
  await page.click('#launch');
  await page.waitForSelector('#app:not([hidden])');
  await page.goto(`${BASE}#/mining`);
  await page.click('[data-act="start"][data-action="ferrite"]');
  await page.waitForTimeout(3500);
  const profiles = await page.evaluate(() => {
    const idx = JSON.parse(localStorage.getItem('andromeda-idle/index'));
    return idx.profiles.length;
  });
  if (profiles !== 1) errors.push(`${name}: expected one saved profile`);
  for (const r of ROUTES) {
    await page.goto(`${BASE}#/${r}`);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.getElementById('content').scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) errors.push(`${name}: #/${r} overflows horizontally by ${overflow}px`);
  }
  await ctx.close();
}

await run('desktop', { width: 1440, height: 900 }, false);
await run('phone', { width: 360, height: 760 }, true);
await browser.close();

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Smoke test passed.');
