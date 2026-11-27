const assert = require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>console.error(e.message));
 await page.route('**/__journey-editor-check',route=>route.fulfill({contentType:'text/html',body:
 '<html><body><div id="root"></div><script type="module">'+
 'import RefreshRuntime from "/@id/__x00__virtual:react-router/hmr-runtime";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;'+
 'const React=(await import("/node_modules/.vite/deps/react.js")).default;const {createRoot}=(await import("/node_modules/.vite/deps/react-dom_client.js")).default;const {createMemoryRouter,RouterProvider}=await import("/node_modules/.vite/deps/react-router.js");'+
 'const {default:Editor}=await import("/app/routes/page-blocks.$id.tsx");const h=React.createElement;const block={id:4,page_slug:"home",block_type:"journey",visible:true,config:{title:"Our Journey",items:[{years:"2011",label:"Foundation",title:"First milestone",body:"Description",image:"/example.jpg"}]}};'+
 'const router=createMemoryRouter([{id:"editor",path:"/",element:h(Editor)}],{hydrationData:{loaderData:{editor:{block}}}});createRoot(document.getElementById("root")).render(h(RouterProvider,{router}));</script></body></html>'
 }));
 await page.goto('http://127.0.0.1:5931/__journey-editor-check');
 await page.locator('summary').filter({hasText:'Journey cards'}).first().click();
 await page.getByRole('button',{name:'Add milestone',exact:true}).click();
 let config=JSON.parse(await page.locator('input[name="config"]').inputValue());
 assert.equal(config.items.length,2);
 const rows=page.locator('details').filter({has:page.getByRole('button',{name:'Delete milestone 1',exact:true})});
 await page.locator('summary').filter({hasText:'2011'}).click();
 await page.getByRole('button',{name:'Delete milestone 1',exact:true}).click();
 if (!(await page.getByRole('button',{name:'Delete milestone 1',exact:true}).isVisible())) await page.locator('summary').filter({hasText:'Item 1'}).click();
 await page.getByRole('button',{name:'Delete milestone 1',exact:true}).click();
 config=JSON.parse(await page.locator('input[name="config"]').inputValue());
 assert.deepEqual(config.items,[]);
 console.log('PASS: add/delete Journey milestones; save payload preserves items: []; no live data modified');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
