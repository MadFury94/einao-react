const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('.local/portfolio-stage', { recursive: true });
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load', timeout: 120000 });
  const section = page.locator('[data-home-section="institutional-experience"]');
  await page.waitForFunction(() => document.querySelector('[data-home-section="institutional-experience"]')?.parentElement.classList.contains('pin-spacer'));
  await section.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  await page.waitForTimeout(2000);
  const measurements = () => section.evaluate(el => {
   const track = el.querySelector('ul'); const viewport = track.parentElement; const intro = el.querySelector('h2').parentElement;
   return { start: el.parentElement.getBoundingClientRect().top + scrollY, travel: track.lastElementChild.offsetTop - track.firstElementChild.offsetTop, cardTops: Array.from(track.children, card => card.getBoundingClientRect().top), offsets: Array.from(track.children, card => card.offsetTop - track.firstElementChild.offsetTop), introTop: intro.getBoundingClientRect().top, firstTop: track.firstElementChild.getBoundingClientRect().top, lastBottom: track.lastElementChild.getBoundingClientRect().bottom, viewportBottom: viewport.getBoundingClientRect().bottom, sectionTop: el.getBoundingClientRect().top };
  });
  for (const width of [1440, 1024]) {
   await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
   await page.setViewportSize({ width, height: 1000 }); await page.waitForTimeout(1000);
   const initial = await measurements();
   assert.ok(initial.travel > 0, 'List has scroll travel');
   let anchor;
   for (const progress of [.1, .5, .95, .999]) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), initial.start + initial.travel * progress);
    await page.waitForTimeout(300);
    const state = await measurements();
    anchor ??= state.introTop;
    assert.ok(Math.abs(state.introTop - anchor) < 3, `RHS stays fixed at ${progress}, width ${width}: ${state.introTop} vs ${anchor}`);
    assert.ok(Math.abs(state.sectionTop) < 3, 'Entire section stays pinned: '+JSON.stringify({width,progress,initial,state}));
    for (let i = 0; i < state.cardTops.length; i++) {
     const expected = state.firstTop + Math.max(0, state.offsets[i] - initial.travel * progress);
     assert.ok(Math.abs(state.cardTops[i] - expected) < 3, `Card ${i + 1} slides into its stack at ${progress}: ${JSON.stringify({state, initial, expected})}`);
    }
    if (progress === .999) assert.ok(Math.abs(state.cardTops.at(-1) - state.firstTop) < 3, 'Final card reaches the top of the stack before release');
    if (width === 1440 && progress === .5) await page.screenshot({ path: '.local/portfolio-stage/mid-scroll.jpg', type: 'jpeg', quality: 60 });
   }
   await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), initial.start + initial.travel * .15);
   await page.waitForTimeout(300);
   assert.equal(await section.evaluate(el => getComputedStyle(el).position), 'fixed');
   assert.equal(await section.evaluate(el => el.parentElement === document.body), true, JSON.stringify(await measurements()));
   await page.evaluate(() => {
    window.portfolioFrames = [];
    window.portfolioSampling = true;
    const sample = () => {
     const el = document.querySelector('#project-showcase-title').parentElement;
     window.portfolioFrames.push(Array.from(el.children, child => { const r = child.getBoundingClientRect(); return [r.x, r.y]; }));
     if (window.portfolioSampling) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
   });
   for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, initial.travel * .07);
    await page.waitForTimeout(100);
   }
   const frames = await page.evaluate(() => { window.portfolioSampling = false; return window.portfolioFrames; });
   assert.ok(frames.length > 1);
   for (const frame of frames) assert.deepEqual(frame, frames[0], 'Every RHS element stays at identical coordinates during wheel scrolling');
   console.log(`No RHS movement across ${frames.length} animation frames at ${width}px`);
   await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), initial.start + initial.travel);
   await page.evaluate(() => scrollBy({ top: 180, behavior: 'instant' })); await page.waitForTimeout(300);
   assert.ok((await measurements()).introTop < anchor - 150, 'Section releases only after final card');
   console.log(`Pinned stage and fixed RHS passed at ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('[data-home-section="institutional-experience"]').parentElement.classList.contains('pin-spacer'));
  for (const width of [1920, 1440, 1200, 1024, 768, 390, 320]) {
   await page.setViewportSize({ width, height: 1000 });
   await section.scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`);
   assert.equal(await section.locator('h2').evaluate(el => el.scrollWidth > el.clientWidth), false);
   assert.equal(await section.locator('ul').evaluate(el => el.parentElement.style.height), '', 'Viewport height restored');
   assert.ok(await section.locator('ul').evaluate(el => ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(el).transform)), 'List has no offset');
   console.log(`Responsive/reduced-motion flow passed at ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal(await section.evaluate(el => el.parentElement.classList.contains('pin-spacer')), false, 'No mobile pin');
  await section.getByRole('link', { name: 'Explore our work', exact: true }).click();
  await page.waitForURL('**/work/');
  await section.waitFor({ state: 'detached' });
  assert.deepEqual(errors, []);
  console.log('Navigation cleanup passed.');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2000);
  await page.evaluate(async () => { scrollTo({ top: 0, behavior: 'instant' }); await document.fonts.ready; });
  await section.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  await page.waitForTimeout(1500);
  const desktop = await measurements();
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), desktop.start + desktop.travel * .5);
  await page.waitForTimeout(300);
  assert.equal(await section.evaluate(el => el.parentElement === document.body), true, JSON.stringify(await measurements()));
  await section.getByRole('link', { name: 'Explore our work', exact: true }).click();
  await page.waitForURL('**/work/');
  await section.waitFor({ state: 'detached' });
  assert.deepEqual(errors, []);
  console.log('Navigation while fixed passed.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
