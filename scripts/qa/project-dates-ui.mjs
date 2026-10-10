import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { load } from 'cheerio';

const testUrl = 'postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if (process.env.TEST_DATABASE_URL !== testUrl) throw new Error('Only the owned isolated LOCAL QA database is allowed.');
const base = 'http://127.0.0.1:13440';
const phase = process.env.QA_DATE_PHASE;
if (!['before', 'after'].includes(phase)) throw new Error('Set QA_DATE_PHASE to before or after.');
const { chromium } = await import(pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href);
const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const out = path.resolve(process.env.QA_OUTPUT_DIR);
await fs.mkdir(out, { recursive: true });
const results = [];
const timestamps = phase === 'before' ? ['2026-05-15T00:00:00.000Z'] : ['2026-05-15T00:00:00.000Z', '2026-05-15T23:30:00.000Z', '2024-02-29T00:00:00.000Z', null];
const stable = row => Object.fromEntries(Object.entries(row).filter(([key]) => !['seoTitle', 'updatedAt'].includes(key)));
const projectSchema = html => {
  const $ = load(html);
  return $('script[type="application/ld+json"]').toArray().map(node => JSON.parse($(node).text())).find(schema => String(schema['@id']).endsWith('#project'));
};
try {
  for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Bangkok']) {
    const context = await browser.newContext({ timezoneId: timezone, viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${base}/login`);
    await page.locator('input[type=email]').fill('qa-admin@local.test');
    await page.locator('input[type=password]').fill('local-qa-password');
    await page.locator('form button[type=submit]').click();
    await page.waitForURL(`${base}/admin`);
    for (const [index, timestamp] of timestamps.entries()) {
      const row = await db.project.create({ data: {
        slug: `qa-date-${phase}-${timezone.toLowerCase().replaceAll('/', '-').replaceAll('_', '-')}-${Date.now()}-${index}`,
        title: 'LOCAL date-only QA', description: 'Synthetic LOCAL only', content: '<h2>Fixture</h2><p>Unchanged <a href="/lien-he" rel="noopener noreferrer">link</a></p>',
        coverImage: 'http://127.0.0.1:13441/screen.webp', images: ['http://127.0.0.1:13441/screen.webp'],
        techStack: ['PHP', 'MySQL'], isPublished: true, robotsIndex: false, robotsFollow: true,
        completedAt: timestamp ? new Date(timestamp) : null, publishedAt: new Date('2026-08-02T00:15:00.000Z'),
        seoTitle: 'LOCAL original title', youtubeUrl: null, order: 7,
      } });
      const expectedDay = timestamp?.slice(0, 10) ?? '';
      const captures = [];
      const onRequest = request => {
        if (request.method() === 'POST' && request.url() === `${base}/admin/projects/${row.id}` && request.headers()['next-action']) {
          const body = request.postDataJSON();
          captures.push({ completedAt: body[0].completedAt, seoTitle: body[0].seoTitle });
        }
      };
      page.on('request', onRequest);
      const samples = [];
      if (phase === 'after' && index === 0) {
        await page.goto(`${base}/admin/projects/${row.id}`);
        await page.waitForFunction(() => document.querySelector('input[name=title]')?.value === 'LOCAL date-only QA');
        const actionUrl = `${base}/admin/projects/${row.id}`;
        await page.route(actionUrl, async route => {
          const request = route.request();
          if (request.method() !== 'POST' || !request.headers()['next-action']) return route.continue();
          const payload = request.postDataJSON();
          payload[0].completedAt = 'Tue May 15';
          await route.continue({ postData: JSON.stringify(payload) });
        });
        await page.getByLabel('SEO title', { exact: true }).fill('Must not be saved');
        await page.getByRole('button', { name: 'Lưu dự án', exact: true }).click();
        await page.locator('#project-completed-at-error').waitFor();
        assert.equal(await page.locator('input[name=completedAt]').getAttribute('aria-invalid'), 'true');
        assert.deepEqual(await db.project.findUniqueOrThrow({ where: { id: row.id } }), row);
        await page.locator('#project-completed-at-error').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(out, `${timezone.replaceAll('/', '-')}-date-field-error.png`) });
        await page.unroute(actionUrl);
        await page.locator('input[name=completedAt]').fill('');
        await page.locator('input[name=completedAt]').fill(expectedDay);
      }
      for (let round = 1; round <= 3; round++) {
        await page.goto(`${base}/admin/projects/${row.id}`);
        await page.waitForFunction(() => document.querySelector('input[name=title]')?.value === 'LOCAL date-only QA');
        const field = page.locator('input[name=completedAt]');
        const state = await field.evaluate(el => ({ value: el.value, attribute: el.getAttribute('value'), type: el.type }));
        if (phase === 'after') assert.equal(state.value, expectedDay, `${timezone} ${timestamp}`);
        assert.equal(await page.locator('input[name=isPublished]').isChecked(), true);
        await page.getByLabel('SEO title', { exact: true }).fill(`LOCAL SEO round ${round}`);
        await page.getByRole('button', { name: 'Lưu dự án', exact: true }).click();
        await page.waitForURL(`${base}/admin/projects`);
        const saved = await db.project.findUniqueOrThrow({ where: { id: row.id } });
        const response = await fetch(`${base}/du-an/${row.slug}`);
        assert.equal(response.status, 200);
        const html = await response.text();
        const schema = projectSchema(html);
        assert.ok(schema, 'SSR project schema must be present');
        const dom = load(html);
        const sample = { round, input: state, payload: captures.at(-1), dbCompletedAt: saved.completedAt?.toISOString() ?? null, dbPublishedAt: saved.publishedAt?.toISOString() ?? null, schemaDatePublished: schema.datePublished ?? null, publicTitle: dom('title').text(), robots: dom('meta[name=robots]').attr('content'), canonical: dom('link[rel=canonical]').attr('href'), h1: dom('h1').length };
        if (phase === 'after') {
          assert.deepEqual(stable(saved), stable(row));
          assert.equal(sample.payload.completedAt, expectedDay);
          assert.equal(sample.schemaDatePublished, row.publishedAt.toISOString());
          assert.match(sample.publicTitle, new RegExp(`LOCAL SEO round ${round}`));
          assert.equal(sample.h1, 1);
          assert.match(sample.robots, /noindex.*follow/);
          assert.equal(sample.canonical, `https://cuongdesign.net/du-an/${row.slug}`);
        } else {
          assert.equal(state.value, '');
          assert.notEqual(sample.dbCompletedAt, timestamp);
        }
        samples.push(sample);
      }
      await page.goto(`${base}/admin/projects/${row.id}`);
      await page.waitForFunction(() => document.querySelector('input[name=title]')?.value === 'LOCAL date-only QA');
      if (phase === 'after') assert.equal(await page.locator('input[name=completedAt]').inputValue(), expectedDay);
      await page.locator('input[name=completedAt]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(out, `${phase}-${timezone.replaceAll('/', '-')}-${index}-date.png`) });
      if (phase === 'after' && index === 0) {
        await page.getByRole('button', { name: 'Xóa ngày hoàn thành', exact: true }).click();
        await page.getByRole('button', { name: 'Lưu dự án', exact: true }).click();
        await page.waitForURL(`${base}/admin/projects`);
        const cleared = await db.project.findUniqueOrThrow({ where: { id: row.id } });
        assert.equal(cleared.completedAt, null);
        assert.deepEqual({ ...stable(cleared), completedAt: row.completedAt }, stable(row));
        await page.goto(`${base}/admin/projects/${row.id}`);
        await page.waitForFunction(() => document.querySelector('input[name=title]')?.value === 'LOCAL date-only QA');
        assert.equal(await page.locator('input[name=completedAt]').inputValue(), '');
      }
      if (phase === 'after' && index === timestamps.length - 1) {
        await db.project.update({ where: { id: row.id }, data: { publishedAt: null } });
        const unknown = await fetch(`${base}/du-an/${row.slug}`);
        assert.equal(unknown.status, 200);
        assert.equal(Object.hasOwn(projectSchema(await unknown.text()), 'datePublished'), false);
      }
      page.off('request', onRequest);
      results.push({ phase, timezone, browserTimezone: await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone), originalCompletedAt: timestamp, originalPublishedAt: row.publishedAt.toISOString(), rounds: samples, explicitClear: phase === 'after' && index === 0 ? 'PASS' : 'NOT_RUN_THIS_ROW', unknownPublicationSsr: phase === 'after' && index === timestamps.length - 1 ? 'datePublished OMITTED' : 'NOT_RUN_THIS_ROW' });
    }
    await context.close();
  }
  console.log(`PASS: ${phase} real Chrome / UTC, negative, positive browser timezones / 3 consecutive SEO saves / DOM date + action payload + isolated DB + anonymous SSR JSON-LD${phase === 'after' ? ' / server field error + explicit clear-reopen' : ' / legacy date corruption reproduced'}.`);
} finally {
  await fs.writeFile(path.join(out, `project-dates-ui-${phase}.json`), JSON.stringify(results, null, 2));
  await browser.close();
  await db.$disconnect();
}
