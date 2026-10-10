import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';

const testUrl = 'postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if (process.env.TEST_DATABASE_URL !== testUrl) throw new Error('Only the isolated local QA database is permitted.');
const { chromium } = await import(pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href);
const out = path.resolve(process.env.QA_OUTPUT_DIR);
const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
const profile = path.resolve('.next/qa/chrome-200-percent');
await fs.mkdir(path.join(profile, 'Default'), { recursive: true });
await fs.writeFile(path.join(profile, 'Default', 'Preferences'), JSON.stringify({ partition: { default_zoom_level: Math.log(2) / Math.log(1.2) } }));
const zoomContext = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: true, viewport: null, args: ['--window-size=1440,900'] });
const results = { timestamp: new Date().toISOString(), environment: 'LOCAL isolated fixtures only', zoom: [], players: [] };
try {
  for (const route of ['/du-an/qa-nail-equivalent', '/du-an/qa-project-video', '/san-pham/qa-product-video']) {
    const page = await zoomContext.newPage();
    await page.goto(`http://127.0.0.1:13440${route}`, { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => ({ innerWidth, outerWidth, dpr: devicePixelRatio, docWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, video: document.querySelector('.youtube-video iframe') ? { width: document.querySelector('.youtube-video iframe').clientWidth, height: document.querySelector('.youtube-video iframe').clientHeight } : null }));
    state.nativeZoomConfirmed = state.dpr === 2 && state.innerWidth <= state.outerWidth / 2;
    if (state.nativeZoomConfirmed) {
      assert.equal(state.docWidth, state.scrollWidth);
      if (state.video) { assert.ok(state.video.width >= 200); assert.ok(state.video.height >= 200); }
    }
    await page.screenshot({ path: path.join(out, `native-zoom-${route.split('/').at(-1)}.png`), fullPage: true });
    results.zoom.push({ route, ...state });
    await page.close();
  }
} finally { await zoomContext.close(); }

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const entity of ['project', 'product']) {
    const original = await db[entity].findUniqueOrThrow({ where: { slug: `qa-${entity}-video` } });
    const { id, createdAt, updatedAt, ...copy } = original;
    assert.ok(id && createdAt && updatedAt);
    await db[entity].upsert({ where: { slug: `qa-${entity}-unavailable` }, create: { ...copy, slug: `qa-${entity}-unavailable`, youtubeUrl: 'https://www.youtube.com/watch?v=00000000000' }, update: { youtubeUrl: 'https://www.youtube.com/watch?v=00000000000' } });
    for (const state of ['video', 'unavailable']) {
      const route = `/${entity === 'project' ? 'du-an' : 'san-pham'}/qa-${entity}-${state}`;
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [], failedRequests = [], responses = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => { if (/youtube|ytimg/.test(request.url())) failedRequests.push({ url: request.url(), error: request.failure()?.errorText }); });
      page.on('response', response => { if (/youtube-nocookie.com\/embed\//.test(response.url())) responses.push({ url: response.url(), status: response.status() }); });
      await page.goto(`http://127.0.0.1:13440${route}`, { waitUntil: 'networkidle' });
      await page.locator('.youtube-video').scrollIntoViewIfNeeded();
      const frame = page.frames().find(frame => frame.url().includes('youtube-nocookie.com/embed/'));
      const playerReady = frame ? await frame.locator('.html5-video-player').waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false) : false;
      const playerText = frame ? await frame.locator('body').innerText({ timeout: 5000 }).catch(() => '') : '';
      const buttons = frame ? await frame.locator('button').evaluateAll(elements => elements.map(el => ({ label: el.getAttribute('aria-label'), title: el.getAttribute('title'), visible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 }))).catch(() => []) : [];
      const fallback = await page.locator('.youtube-video a').getAttribute('href');
      await page.locator('.youtube-video a').focus();
      assert.equal(await page.locator('.youtube-video a').evaluate(el => document.activeElement === el), true);
      assert.equal(await page.locator('.youtube-video').count(), 1);
      assert.deepEqual(errors, []);
      assert.equal(fallback, `https://www.youtube.com/watch?v=${state === 'video' ? 'M7lc1UVf-VE' : '00000000000'}`);
      await page.screenshot({ path: path.join(out, `${entity}-${state}-player-settled.png`) });
      results.players.push({ route, playerReady, playerText, buttons, fallback, errors, failedRequests, responses });
      await page.close();
    }
  }
} finally {
  await browser.close();
  await db.$disconnect();
  await fs.writeFile(path.join(out, 'edge-cases.json'), JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
