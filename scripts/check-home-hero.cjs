const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('.local/home-hero', { recursive: true });
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const errors = [];
 try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
   await page.setViewportSize({ width, height: 1100 });
   await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
   const hero = page.locator('[data-home-section="hero"]');
   assert.equal(await hero.locator('h1').count(), 1);
   assert.equal(await hero.locator('ul a').count(), 4);
   assert.equal(await hero.locator('video').count(), 1);
   assert.ok(await hero.locator('video').evaluate(video => video.paused), 'Reduced motion keeps the background paused');
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
   assert.equal(await page.locator('link[href*="theme-reference"],script[src*="theme-reference"],link[href*="orixo-home-assets"],script[src*="orixo-home-assets"]').count(), 0);
   await hero.evaluate(async el => { await Promise.all([...el.querySelectorAll('img')].map(img => img.decode())); });
   assert.equal(await hero.locator('h1').evaluate(el => el.scrollWidth > el.clientWidth), false, 'Heading fits at '+width);
   await hero.screenshot({ path: `.local/home-hero/hero-${width}.png` });
   console.log(`Hero 3 layout passed at ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
   window.__heroMotion = [];
   const original = Element.prototype.animate;
   Element.prototype.animate = function(...args) {
    if (this.closest('[data-home-section="hero"]')) window.__heroMotion.push({delay:args[1]?.delay,duration:args[1]?.duration});
    return original.apply(this,args);
   };
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__heroMotion?.length > 10);
  const pill=page.locator('[data-home-section="hero"] ul a').first();
  await pill.focus();
  await page.waitForTimeout(500);
  assert.equal(await pill.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(149, 193, 31)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(30);
  assert.equal(await page.locator('[data-home-section="hero"]').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
  assert.deepEqual(errors, []);
  console.log('Hero 3 native entrance animation, keyboard hover, reduced motion and runtime isolation passed.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
