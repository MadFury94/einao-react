const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = '.local/orixo-checks';
fs.mkdirSync(output, { recursive: true });
(async () => {
	const browser = await chromium.launch({ channel: 'chrome', headless: true });
	const errors = [];
	const findings = [];
	try {
		const page = await browser.newPage({ reducedMotion: 'reduce' });
		page.on('pageerror', e => errors.push(e.message));
		for (const width of [1440, 390, 320]) {
			await page.setViewportSize({ width, height: 900 });
			for (const route of ['/', '/about/', '/capabilities/', '/solutions/', '/insights/']) {
				await page.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' });
				assert.equal(await page.locator('h1').count(), 1, route);
				assert.equal(await page.locator('.site-footer').count(), 1, route);
				await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
				const problems = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')) }));
				if (problems.overflow || problems.broken.length) findings.push({width,route,...problems});
				console.log(JSON.stringify({width, route, ...problems, height: await page.locator('body').evaluate(el => el.scrollHeight)}));
				await page.screenshot({ path: `${output}/${route.replaceAll('/', '') || 'home'}-${width}.png` });
			}
		}
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('http://127.0.0.1:4173/about/');
		const counter = page.locator('.about-page-counter-box .animated-counter').first();
		await counter.scrollIntoViewIfNeeded();
		await page.waitForFunction(() => document.querySelector('.about-page-counter-box .animated-counter [aria-hidden]')?.textContent === '2011');
		await page.goto('http://127.0.0.1:4173/');
		const marquee = page.locator('.orixo-marquee');
		await marquee.scrollIntoViewIfNeeded();
		assert.equal(await page.locator('.orixo-marquee-group').count(), 2);
		const groups = await page.locator('.orixo-marquee-group').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().width));
		assert.equal(groups[0], groups[1]);
		assert.ok(groups[0] >= 1440);
		await page.locator('.index3-service-card').first().hover();
		await page.waitForTimeout(900);
		assert.equal(await page.locator('.index3-service-card').first().evaluate(el => getComputedStyle(el).transform), 'matrix(1, 0, 0, 1, 0, -8)');
		fs.writeFileSync(`${output}/results.json`, JSON.stringify({errors, findings}, null, 2));
		assert.deepEqual(errors, []);
		assert.deepEqual(findings, []);
		console.log('Orixo checks passed: 15 responsive page views, images, counters, marquee and card hover.');
	} finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
