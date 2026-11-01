const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const dependencyRequire = process.env.EINAO_TEST_MODULES ? createRequire(path.join(process.env.EINAO_TEST_MODULES, 'package.json')) : require;
const { chromium } = dependencyRequire('playwright');
const { AxeBuilder } = dependencyRequire('@axe-core/playwright');
const base = process.env.EINAO_BASE_URL || 'http://127.0.0.1:4173';
const output = path.resolve('.local/react-client');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const results = [];
  const findings = [];
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 1920, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('#closing-title').count(), 1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      // Record layout failures and finish the remaining checks before failing.
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      results.push({ width, overflow, violations: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.evaluate(async () => { await Promise.all(Array.from(document.images).map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })); });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('.menu-toggle');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.locator('.primary-nav summary').filter({ hasText: 'Capabilities' }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('details[open]').count(), 0);
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    if (!await menu.evaluate(el => el === document.activeElement)) findings.push('Mobile menu does not restore keyboard focus to its toggle after Escape');
    await page.setViewportSize({ width: 1440, height: 1000 });
    const drawer = page.locator('#einao-offcanvas');
    const sidebar = page.locator('.sidebar-toggle');
    assert.equal(await drawer.evaluate(el => el.hidden && el.inert), true);
    await page.locator('.einao-offcanvas-close').evaluate(el => el.focus());
    assert.equal(await drawer.evaluate(el => el.contains(document.activeElement)), false);
    await sidebar.click();
    await page.waitForFunction(() => document.activeElement?.classList.contains('einao-offcanvas-close'));
    assert.equal(await drawer.evaluate(el => el.hidden || el.inert), false);
    await page.keyboard.press('Escape');
    assert.equal(await sidebar.evaluate(el => el === document.activeElement), true);
    assert.equal(await drawer.evaluate(el => el.hidden && el.inert), true);
    await sidebar.click();
    await page.locator('.einao-offcanvas-close').click();
    assert.equal(await sidebar.evaluate(el => el === document.activeElement), true);
    await page.locator('.primary-nav summary').filter({ hasText: 'Capabilities' }).click();
    await page.locator('.mega-links').getByRole('link', { name: 'IT Consulting', exact: false }).click();
    await page.waitForURL('**/capabilities/it-consulting/');
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok((await page.locator('h1').innerText()).trim(), 'Capability page has a heading');
    const routes = ['/about/', '/capabilities/', '/capabilities/business-process-automation/', '/capabilities/enterprise-solutions/', '/solutions/', '/solutions/custom-enterprise-systems/', '/privacy-notice/', '/terms-of-use/', '/solutions/payx/', '/solutions/fileonn/', '/industries/', '/industries/government/', '/industries/business/', '/industries/regulatory-services/', '/work/', '/work/ipo-nigeria-portal/', '/insights/', '/contact/?enquiry=PayX'];
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator('h1').count(), 1, route);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) findings.push(`Horizontal overflow: ${route}`);
    }
    assert.equal(await page.locator('select[name=enquiry]').inputValue(), 'PayX');
    assert.equal(await page.locator('button[type=submit]').isEnabled(), true);
    assert.equal(await page.locator('.enquiry-form a[href="/privacy-notice/"]').isVisible(), true);
    await page.locator('button[type=submit]').click();
    assert.equal(await page.locator('input[name=name]').evaluate(el => el.validity.valueMissing), true);
    const unavailable = await page.request.post(base + '/contact/', { form: { name: 'Test' } });
    assert.equal(unavailable.status(), 400);
    assert.match(await unavailable.text(), /Enter a valid work email/);
    assert.equal((await page.goto(base + '/missing-page/')).status(), 404);
    assert.equal((await page.goto(base + '/privacy-notice/')).status(), 200);
    await page.goto(base + '/insights/');
    const articleHref = await page.locator('a[href^="/insights/"]').filter({ hasText: /Read / }).first().getAttribute('href');
    assert.ok(articleHref, 'A published article is required for this check');
    assert.equal((await page.goto(base + articleHref)).status(), 200);
    const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)).find(item => item['@type'] === 'Article'));
    assert.ok(schema?.headline && schema?.author?.name && schema?.image && schema?.datePublished && schema?.dateModified, 'Complete article schema');
    assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
    assert.match(await (await page.request.get(base + '/robots.txt')).text(), /Disallow: \//);
    for (const policy of ['reduced', 'save-data', 'no-js']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: policy === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: policy !== 'no-js' });
      if (policy === 'save-data') await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, addEventListener() {}, removeEventListener() {} }, configurable: true }));
      const tab = await context.newPage();
      const videos = [];
      tab.on('request', r => { if (/\.(mp4|webm)(\?|$)/.test(r.url())) videos.push(r.url()); });
      await tab.goto(base, { waitUntil: 'networkidle' });
      assert.equal(videos.length, 0, `Video requested under ${policy}`);
      assert.equal(await tab.locator('h1').isVisible(), true);
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, findings, errors, routesChecked: routes.length, videoPolicies: 3 }, null, 2));
    assert.ok(findings.length === 0 && results.every(r => !r.overflow && r.violations.length === 0), JSON.stringify({ results, findings }));
    console.log(JSON.stringify({ results, findings, errors, routesChecked: routes.length, videoPolicies: 3 }, null, 2));
  } finally {
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, findings, errors }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
