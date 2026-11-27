const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.EINAO_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
  const page = await browser.newPage();
  const barModule = await (await fetch(base+'/app/components/admin/AdminBar.tsx')).text();
  const contextUrl = barModule.match(/from "(\/app\/components\/admin\/AdminContext[^"]*)"/)[1];
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Browser:',error.message); });
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('h1').waitFor();
  assert.equal(await page.getByRole('complementary',{name:'Administration'}).count(),0);
  assert.equal(await page.locator('[data-admin-section]').count(),0);
  // Exercise real components with a simulated authenticated context, without bypassing server auth.
  await page.route('**/__admin-shortcuts-check', route => route.fulfill({contentType:'text/html',body:
   '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module">' +
   'import RefreshRuntime from "/@id/__x00__virtual:react-router/hmr-runtime"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;' +
   'const React=(await import("/node_modules/.vite/deps/react.js")).default;const {createRoot}=(await import("/node_modules/.vite/deps/react-dom_client.js")).default;' +
   'const {MemoryRouter}=await import("/node_modules/.vite/deps/react-router.js");' +
   'const {AdminProvider}=await import("'+contextUrl+'");const {AdminBar}=await import("/app/components/admin/AdminBar.tsx");' +
   'const {SectionShortcut}=await import("/app/components/admin/SectionShortcut.tsx");const {Header}=await import("/app/components/layout/Header.tsx");await import("/app/app.css");' +
   'const h=React.createElement;createRoot(document.getElementById("root")).render(h(MemoryRouter,null,h(AdminProvider,{isAdmin:true,dashboardUrl:"http://localhost:5931"},h("div",{style:{"--admin-bar-height":"44px"}},h(AdminBar),h(Header),...["Hero","Capabilities","Solutions","Work","Platform"].map((name,i)=>h(SectionShortcut,{key:name,name,hero:i===0,path:["/page-blocks?page=home","/capabilities","/solutions","/work","/solutions"][i],action:i===0?"Section settings":"Manage items"},h("section",{style:{height:600,padding:"180px 24px 24px",background:i%2?"#eee":"#173322",color:i%2?"#111":"white"}},h("h1",null,name))))))));</script></body></html>'
  }));
  await page.goto(base+'/__admin-shortcuts-check');
  const toggle=page.getByRole('switch');
  await toggle.waitFor({timeout:15000}).catch(async error=>{console.log(await page.locator('body').innerText());throw error;});
  assert.equal(await toggle.getAttribute('aria-checked'),'true');
  assert.equal(await page.locator('[data-admin-section] a').count(),5);
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>scrollTo(0,0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
   const bar=await page.getByRole('complementary',{name:'Administration'}).boundingBox();
   const header=await page.locator('header').boundingBox();
   assert.equal(bar.height,44);
   assert.equal(header.y,44);
   const badge=page.locator('[data-admin-section="Hero"] a');
   await toggle.focus();
   await badge.focus();
   const tooltip=page.getByRole('tooltip').first();
   assert.equal(await tooltip.isVisible(),true);
   const box=await tooltip.boundingBox();
   assert.ok(box.x>=0 && box.x+box.width<=width);
   await page.keyboard.press('Escape');
   assert.equal(await tooltip.isVisible(),false);
   if(width===390){
    await page.getByRole('button',{name:'Open menu'}).click();
    const drawer=await page.getByRole('navigation',{name:'Mobile navigation'}).boundingBox();
    assert.ok(drawer.y+drawer.height<=901);
    await page.getByRole('button',{name:'Close menu'}).click();
   }
   fs.mkdirSync('.local/admin-shortcuts',{recursive:true});
   await page.screenshot({path:'.local/admin-shortcuts/preview-'+width+'.png'});
  }
  const before=await page.locator('[data-admin-section="Capabilities"]').boundingBox();
  await toggle.click();
  assert.equal(await page.locator('[data-admin-section] a').count(),0);
  const after=await page.locator('[data-admin-section="Capabilities"]').boundingBox();
  assert.equal(before.height,after.height);
  assert.equal(before.y,after.y);
  await page.reload();
  await toggle.waitFor();
  await page.waitForFunction(()=>document.querySelector('[role="switch"]').getAttribute('aria-checked')==='false');
  assert.equal(await page.locator('[data-admin-section] a').count(),0);
  await toggle.click();
  assert.equal(await page.locator('[data-admin-section] a').count(),5);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('[data-admin-section]').first().evaluate(el=>getComputedStyle(el,'::after').transitionDuration),'0s');
  assert.deepEqual(errors,[]);
  console.log('PASS: public view; 5 shortcuts; desktop/390/320 layout; header and menu offsets; keyboard tooltip and Escape; toggle persistence; stable layout; reduced motion.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});

