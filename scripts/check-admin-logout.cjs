const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => console.error(error.message));
    page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
    const origin = 'http://127.0.0.1:5931';
    await page.route('**/__logout-check', route => route.fulfill({contentType:'text/html',body:
      '<html><body><div id="root"></div><script type="module">' +
      'import RefreshRuntime from "/@id/__x00__virtual:react-router/hmr-runtime";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;' +
      'const React=(await import("/node_modules/.vite/deps/react.js")).default;const {createRoot}=(await import("/node_modules/.vite/deps/react-dom_client.js")).default;const {createMemoryRouter,RouterProvider}=await import("/node_modules/.vite/deps/react-router.js");' +
      'const {default:App}=await import("/app/root.tsx");const h=React.createElement;const router=createMemoryRouter([{id:"root",path:"/",element:h(App)}],{hydrationData:{loaderData:{root:{status:"authenticated",user:{id:1,name:"Test",email:"test@example.invalid",role:"admin"}}}}});createRoot(document.getElementById("root")).render(h(RouterProvider,{router}));</script></body></html>'
    }));
    let succeeds = false;
    let calls = 0;
    await page.route('**/api/v1/auth/logout', async route => {
      assert.equal(route.request().url(), origin + '/api/v1/auth/logout');
      assert.equal(route.request().method(), 'POST');
      calls++;
      await route.fulfill({status:succeeds ? 200 : 503,contentType:'application/json',body:JSON.stringify({success:succeeds})});
    });
    await page.goto(origin + '/__logout-check');
    await page.getByRole('button',{name:'Log out',exact:true}).click();
    await page.getByText('Unable to log out. Please try again.',{exact:true}).waitFor();
    assert.equal(page.url(),origin + '/__logout-check');
    succeeds = true;
    await page.getByRole('button',{name:'Log out',exact:true}).click();
    await page.waitForURL(origin + '/');
    assert.equal(calls,2);
    console.log('PASS: logout uses admin origin; errors stay visible; success returns to sign-in.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
