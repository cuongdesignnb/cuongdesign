import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

const { chromium } = await import(pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href);
const out = path.resolve(process.env.QA_OUTPUT_DIR);
await fs.mkdir(out, { recursive: true });
const before = 'http://127.0.0.1:13442', after = 'http://127.0.0.1:13440';
const viewports = [{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:320,height:740},{width:767,height:844},{width:1023,height:768}];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const comparisons = [];
const htmlSnapshots = {};
const diagnostics = [];
async function sample(page, articleSelector) {
  return page.evaluate((selector) => {
    const article = document.querySelector(selector);
    const elements = article ? [...article.querySelectorAll('h2'), ...article.querySelectorAll('h3'), ...article.querySelectorAll('p').values()].slice(0, 20) : [];
    const styles = elements.map(element => {
      const s = getComputedStyle(element);
      return { selector: `${selector} ${element.tagName.toLowerCase()}`, text: element.textContent, fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,marginTop:s.marginTop,marginBottom:s.marginBottom };
    });
    const rect = article?.getBoundingClientRect();
    const clipped = article ? [...article.querySelectorAll('h2,h3,p,li,img,figcaption,a,pre')].filter(el => {
      if (el.closest('pre') && el.tagName !== 'PRE') return false;
      const r = el.getBoundingClientRect(); return r.right > rect.right + 1 || r.left < rect.left - 1;
    }).map(el => ({ tag:el.tagName,text:el.textContent?.slice(0,80) })) : [];
    const iframe = document.querySelector('.youtube-video iframe');
    const frame = iframe?.getBoundingClientRect();
    const main = document.querySelector('main');
    const caption = article?.querySelector('figcaption');
    const backgroundStack=[];
    for(let el=article;el;el=el.parentElement) backgroundStack.push(getComputedStyle(el).backgroundColor);
    const colors={};
    for(const tag of ['h2','h3','p','li','figcaption','a']){const el=article?.querySelector(tag);if(el)colors[tag]=getComputedStyle(el).color;}
    return { backgroundStack,colors,url:location.href,environment:'LOCAL isolated QA fixtures (not production CMS)',timestamp:new Date().toISOString(),viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},styles,h1Count:document.querySelectorAll('main h1').length,docWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,mainScrollWidth:main?.scrollWidth,mainWidth:main?.clientWidth,clipped,videoCount:document.querySelectorAll('.youtube-video').length,iframe:frame ? { width:frame.width,height:frame.height,clientWidth:iframe.clientWidth,clientHeight:iframe.clientHeight,src:iframe.src,title:iframe.title,loading:iframe.loading } : null,caption:caption ? {fontSize:getComputedStyle(caption).fontSize,lineHeight:getComputedStyle(caption).lineHeight,color:getComputedStyle(caption).color} : null,metrics:window.__qaMetrics,brokenImages:[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src),preOverflow:article?.querySelector('pre') ? {scrollWidth:article.querySelector('pre').scrollWidth,clientWidth:article.querySelector('pre').clientWidth} : null };
  }, articleSelector);
}
async function capture(base, version, route, viewport, slug) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const youtubeRequests = [];
  page.on('request', request => { if (/youtube|ytimg|googlevideo/.test(request.url())) youtubeRequests.push({url:request.url(),at:Date.now()}); });
  page.on('pageerror',error=>diagnostics.push({version,route,error:error.message}));
  await page.addInitScript(() => {
    window.__qaMetrics = {cls:0,lcp:null};
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaMetrics.cls += entry.value; }).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__qaMetrics.lcp = {startTime:entry.startTime,element:entry.element?.tagName}; }).observe({type:'largest-contentful-paint',buffered:true});
  });
  const response = await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
  assert.equal(response.status(),200,route);
  const html = await response.text();
  const $ = load(html);
  if (viewport.width === 1440) htmlSnapshots[`${version}:${route}`] = {body:$('main article').html(),title:$('title').text(),meta:$('meta[name="description"]').attr('content'),robots:$('meta[name="robots"]').attr('content'),canonical:$('link[rel="canonical"]').attr('href'),h1:$('main h1').text(),images:$('main img').map((_,el)=>$(el).attr('src')).get(),jsonLd:$('script[type="application/ld+json"]').map((_,el)=>$(el).text()).get()};
  await page.evaluate(async()=>{await document.fonts.ready;});
  const coldMetrics=await page.evaluate(()=>({...window.__qaMetrics}));
  const hasArticle=await page.locator('main article').count()>0;
  if(hasArticle) await page.locator('main article h2').first().evaluate(el=>scrollTo(0,el.getBoundingClientRect().top+scrollY-120));
  await page.evaluate(async()=>{await Promise.all([...document.images].filter(img=>img.complete).map(img=>img.decode().catch(()=>{})));});
  const firstSection = await sample(page,'main article');
  if (version === 'after' && route.startsWith('/du-an/qa-') && !route.endsWith('video') && !route.endsWith('snapshot')) {
    assert.equal(firstSection.h1Count,1);
    assert.equal(firstSection.scrollWidth,firstSection.docWidth);
    assert.deepEqual(firstSection.clipped,[]);
    assert.equal(firstSection.styles.filter(s=>s.selector.endsWith('h2')).length,7);
    for (const s of firstSection.styles.filter(s=>s.selector.endsWith('h2'))) {
      assert.equal(s.fontSize,viewport.width >= 768 ? '28px' : '24px'); assert.equal(s.fontWeight,'700');
    }
    assert.equal(firstSection.styles.find(s=>s.selector.endsWith('h3')).fontSize,viewport.width>=768?'22px':'20px');
    assert.equal(firstSection.styles.find(s=>s.selector.endsWith('p')).fontSize,'16px');
    assert.equal(firstSection.caption.fontSize,'14px');
  }
  if (route.endsWith('no-video') || route.includes('equivalent') || route.includes('second-project')) {
    assert.equal(firstSection.videoCount,0); assert.equal(youtubeRequests.length,0);
  }
  if (version==='after' && route.endsWith('-video') && !route.endsWith('no-video')) {
    assert.equal(firstSection.videoCount,1); assert.ok(firstSection.iframe.clientWidth >= 200); assert.ok(firstSection.iframe.clientHeight >= 200);
    assert.equal(firstSection.scrollWidth,firstSection.docWidth);
    assert.doesNotMatch(html,/"@type":"VideoObject"/);
  }
  await page.screenshot({path:path.join(out,`${version}-${slug}-${viewport.width}-section.png`)});
  if(await page.locator('main article figure').count()>0){
    await page.locator('main article figure').first().scrollIntoViewIfNeeded();
    await page.locator('main article figure img').first().evaluate(img=>img.decode().catch(()=>{}));
  }
  if(await page.locator('.youtube-video').count()>0) await page.locator('.youtube-video').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${version}-${slug}-${viewport.width}-caption.png`)});
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(out,`${version}-${slug}-${viewport.width}-full.png`),fullPage:true});
  const final = await sample(page,'main article');
  results.push({version,route,requestedViewport:viewport,...final,coldMetrics,youtubeRequests});
  console.log(`${version} ${route} ${viewport.width}: H2=${final.styles.find(s=>s.selector.endsWith('h2'))?.fontSize || 'N/A'}, CLS=${final.metrics.cls}`);
  await context.close();
}
try {
  for (const route of ['/du-an/qa-nail-equivalent','/du-an/qa-second-project',...(process.env.QA_EXISTING_PROJECT==='true'?['/du-an/qa-ahiu-public-snapshot']:[])]) {
    for (const viewport of viewports) for (const [base,version] of [[before,'before'],[after,'after']]) await capture(base,version,route,viewport,route.split('/').at(-1));
    const a=htmlSnapshots[`before:${route}`],b=htmlSnapshots[`after:${route}`];
    assert.deepEqual(a,b,'Project body, metadata, media and original schemas must stay unchanged');
    comparisons.push({route,result:'exact saved body / title / meta / robots / canonical / H1 / image order / JSON-LD unchanged'});
  }
  for (const route of ['/du-an/qa-project-video','/san-pham/qa-product-video','/san-pham/qa-product-no-video']) for (const viewport of viewports.slice(0,5)) await capture(after,'after',route,viewport,route.split('/').at(-1));
  for (const route of ['/san-pham/qa-product-video','/san-pham/qa-product-no-video']) await capture(before,'before',route,viewports[0],route.split('/').at(-1));
  for (const route of ['/san-pham/qa-product-video','/san-pham/qa-product-no-video']){
    assert.deepEqual(htmlSnapshots[`before:${route}`],htmlSnapshots[`after:${route}`]);
    comparisons.push({route,result:'original Product/Offer/review schemas and title/meta/robots/canonical/H1/cover unchanged'});
  }
  for (const route of ['/','/du-an','/bai-viet/qa-blog-fixture']) for (const viewport of [viewports[0],viewports[3]]) for (const [base,version] of [[before,'before'],[after,'after']]) await capture(base,version,route,viewport,route==='/'?'home':route.split('/').at(-1));
  for (const route of ['/','/du-an','/bai-viet/qa-blog-fixture']) {
    const a=htmlSnapshots[`before:${route}`],b=htmlSnapshots[`after:${route}`];
    assert.deepEqual(a,b); comparisons.push({route,result:'same HTML content / metadata / media / JSON-LD'});
  }
  const page = await browser.newPage({viewport:viewports[0]});
  await page.goto(`${after}/du-an/qa-nail-equivalent`);
  const anchor=page.locator('main article a').first();
  await anchor.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  assert.equal(await anchor.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
  await page.screenshot({path:path.join(out,'after-keyboard-focus.png')});
  // Chromium device metrics emulate 200% reflow; native browser-menu zoom is reported separately.
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:720,height:450,deviceScaleFactor:2,mobile:false});
  const zoom=await sample(page,'main article');
  assert.equal(zoom.scrollWidth,zoom.docWidth); assert.deepEqual(zoom.clipped,[]);
  results.push({version:'after',zoom:'200% equivalent reflow (not native menu zoom)',...zoom});
  await page.screenshot({path:path.join(out,'after-200-percent-equivalent.png'),fullPage:true});
  await page.close();
  console.log('PASS: real Next templates in Chrome, viewport matrix, exact HTML comparisons, local no-video requests, video DOM/layout and keyboard focus.');
} finally {
  await fs.writeFile(path.join(out,'computed-styles-and-network.json'),JSON.stringify({results,comparisons,diagnostics},null,2));
  await fs.writeFile(path.join(out,'html-snapshots.json'),JSON.stringify(htmlSnapshots,null,2));
  await browser.close();
}
