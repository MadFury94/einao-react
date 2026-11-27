const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.EINAO_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
  const page = await browser.newPage();
  page.on('console',message=>{if(message.type()==='error')console.error(message.text())});
  const barModule = await (await fetch(base+'/app/components/admin/AdminBar.tsx')).text();
  const contextUrl = barModule.match(/from "(\/app\/components\/admin\/AdminContext[^"]*)"/)[1];
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Browser:',error.message); });
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('h1').waitFor();
  assert.equal(await page.getByRole('complementary',{name:'Administration'}).count(),0);
  assert.equal(await page.locator('[data-admin-section]').count(),0);

  await page.route('**/__home-admin-links-check', route => route.fulfill({contentType:'text/html',body:
   '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module">' +
   'import RefreshRuntime from "/@id/__x00__virtual:react-router/hmr-runtime"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;' +
   'const React=(await import("/node_modules/.vite/deps/react.js")).default;const {createRoot}=(await import("/node_modules/.vite/deps/react-dom_client.js")).default;' +
   'const {createMemoryRouter,RouterProvider,Outlet}=await import("/node_modules/.vite/deps/react-router.js");' +
   'const {AdminProvider}=await import("'+contextUrl+'");const {default:Home}=await import("/app/routes/home.tsx");await import("/app/app.css");' +
   'const h=React.createElement;const catalog={capabilities:{key:"capabilities",entries:[{title:"IT Consulting",body:"Example capability",link:{href:"/capabilities/it-consulting/"}}]},solutions:null,work:null};' +
   'const router=createMemoryRouter([{id:"layouts/main",path:"/",element:h(AdminProvider,{isAdmin:true,dashboardUrl:"http://127.0.0.1:5931"},h(Outlet)),children:[{id:"routes/home",index:true,element:h(Home,{loaderData:{posts:[],unavailable:false}})}]}],{hydrationData:{loaderData:{"layouts/main":{catalog,home:{blocks:[{id:4,block_type:"journey",config:{items:[]}}]}},"routes/home":{posts:[],unavailable:false}}}});createRoot(document.getElementById("root")).render(h(RouterProvider,{router}));</script></body></html>'
  }));
  await page.goto(base+'/__home-admin-links-check');
  const section=page.locator('[data-admin-section="Capabilities"]');
  await section.waitFor({timeout:15000}).catch(async error=>{console.log(await page.locator('body').innerText());throw error;});
  const badge=section.getByRole('link',{name:'Capabilities \u00b7 Manage items',exact:true});
  assert.equal(await badge.getAttribute('href'),'http://127.0.0.1:5931/capabilities');
  const cta=section.getByRole('link',{name:'Explore our capabilities'});
  assert.equal(await cta.getAttribute('href'),'/capabilities/');
  console.log(JSON.stringify({adminBadge:await badge.getAttribute('href'),publicButton:await cta.getAttribute('href')}));
  assert.equal(await page.getByRole('link',{name:'Our Journey \u00b7 Manage cards',exact:true}).getAttribute('href'),'http://127.0.0.1:5931/page-blocks/4?page=home');
  assert.equal(await page.locator('#journey-cards article').count(),0);
  console.log('PASS: Journey shortcut and explicitly empty milestone list');
  assert.deepEqual(errors,[]);
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
