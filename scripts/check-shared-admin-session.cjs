const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const { proxyApiResponse } = await import('../apps/admin/app/lib/proxy-response.ts');
  const admin = 'https://einao-admin.einaodevv.workers.dev';
  const client = 'https://einao-client-v2.einaodevv.workers.dev';
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const context = await browser.newContext();
    await context.addCookies([{name:'einao_session',value:'legacy',url:admin,httpOnly:true,secure:true,sameSite:'Lax'}]);
    const page = await context.newPage();
    let logout = false;
    await page.route(admin + '/__session-test', async route => {
      const cookie = logout ? 'einao_session=; Max-Age=0; Path=/; Domain=.einaodevv.workers.dev' : 'einao_session=shared-test; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax; Domain=.einaodevv.workers.dev';
      const response = proxyApiResponse(new Response('test',{headers:{'Set-Cookie':cookie}}),new Request(route.request().url()));
      await route.fulfill({body:'test',headers:{'set-cookie':response.headers.getSetCookie().join('\n')}});
    });
    await page.goto(admin + '/__session-test');
    const adminCookies = (await context.cookies(admin)).filter(cookie => cookie.name === 'einao_session');
    const clientCookies = (await context.cookies(client)).filter(cookie => cookie.name === 'einao_session');
    assert.equal(adminCookies.length,1);
    assert.equal(clientCookies.length,1);
    assert.equal(adminCookies[0].value,'shared-test');
    assert.equal(clientCookies[0].httpOnly,true);
    assert.equal(clientCookies[0].secure,true);
    await page.route(client + '/__session-test', async route => {
      assert.equal((await route.request().allHeaders()).cookie,'einao_session=shared-test');
      await route.fulfill({body:'test'});
    });
    await page.goto(client + '/__session-test');
    logout = true;
    await page.goto(admin + '/__session-test');
    assert.equal((await context.cookies(admin,client)).filter(cookie => cookie.name === 'einao_session').length,0);
    console.log('PASS: legacy cookie removed; shared session sent to client-v2; logout clears both apps.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
