const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const base = process.env.EINAO_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const results=[]; const errors=[];
 try {
  const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
  const page = await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  assert.equal((await page.goto(base+'/work/',{waitUntil:'networkidle'})).status(),200);
  const links=await page.locator('.work-card-content h2 a').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),title:node.textContent})));
  assert.ok(links.length>=2,'Two case studies are needed to check previous/next');
  await page.locator('.primary-nav summary').filter({hasText:'Work'}).click();
  for(const item of links.filter(item=>item.href.startsWith('/work/'))) assert.equal(await page.locator('.primary-nav .mega-links').getByRole('link',{name:item.title,exact:true}).getAttribute('href'),item.href);
  await page.keyboard.press('Escape');
  const routes=['/work/',...links.filter(item=>item.href.startsWith('/work/')).map(item=>item.href)];
  for(const width of [1440,1024,768,390,320]) {
   await page.setViewportSize({width,height:1000});
   for(const route of routes) {
    assert.equal((await page.goto(base+route,{waitUntil:'networkidle'})).status(),200);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width}`);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    const violations=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
    results.push({width,route,violations});
    assert.deepEqual(violations,[],`${route} accessibility at ${width}`);
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+links[0].href,{waitUntil:'networkidle'});
  const next=page.getByRole('link',{name:`Next case study: ${links[1].title}`});
  await next.click();await page.waitForURL('**'+links[1].href);await page.waitForLoadState('networkidle');
  await page.getByRole('link',{name:`Previous case study: ${links[0].title}`}).click();await page.waitForURL('**'+links[0].href);await page.waitForLoadState('networkidle');
  await page.getByRole('link',{name:'All case studies',exact:true}).click();await page.waitForURL('**/work/');
  const animated=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await animated.goto(base+'/work/',{waitUntil:'networkidle'});
  const card=animated.locator('.work-card').first();await card.scrollIntoViewIfNeeded();await card.hover();
  await animated.waitForFunction(()=>getComputedStyle(document.querySelector('.work-card-image img')).opacity==='1');
  assert.equal(await animated.locator('.work-card-image img').first().evaluate(el=>getComputedStyle(el).filter),'blur(0px)');
  await animated.goto(base+links[0].href,{waitUntil:'networkidle'});
  const before=await animated.locator('.work-parallax').first().evaluate(el=>el.style.getPropertyValue('--project-shift'));
  await animated.evaluate(()=>scrollBy(0,350));
  await animated.waitForFunction(old=>document.querySelector('.work-parallax').style.getPropertyValue('--project-shift')!==old,before);
  await animated.close();
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({results,errors,menuEntries:links.length,previousNext:true,imageTransitions:true},null,2));
 } finally {fs.writeFileSync('.local/react-client/work-results.json',JSON.stringify({results,errors},null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
