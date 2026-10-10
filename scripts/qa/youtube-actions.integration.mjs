import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { PrismaClient } from '@prisma/client';
const loadBundle = createRequire(import.meta.url);

const testUrl = 'postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if (process.env.TEST_DATABASE_URL !== testUrl) throw new Error('Only the explicitly isolated local QA container is allowed.');
const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
global.__youtubeQaDb = db;
global.__youtubeQaSession = { user: { id: 'qa-admin', role: 'ADMIN' } };
global.__youtubeQaPaths = [];

async function main() {
  // Insert old rows before applying the exact additive migration.
  await db.$executeRawUnsafe(`INSERT INTO "Project" (id,title,slug,description,content,"coverImage",images,"techStack","seoKeywords","updatedAt") VALUES ('old-project','Old','old-project','Old','<p>Old</p>','/fixture.webp',ARRAY[]::TEXT[],ARRAY['PHP','MySQL'],ARRAY[]::TEXT[],NOW())`);
  await db.$executeRawUnsafe(`INSERT INTO "Product" (id,title,slug,description,price,features,"techStack","coverImage",images,"seoKeywords","updatedAt") VALUES ('old-product','Old','old-product','Old',150000,ARRAY['Feature'],ARRAY['PHP'], '/fixture.webp',ARRAY[]::TEXT[],ARRAY[]::TEXT[],NOW())`);
  const before = await db.$queryRawUnsafe('SELECT id,title,slug FROM "Project" UNION ALL SELECT id,title,slug FROM "Product" ORDER BY id');
  const sql = fs.readFileSync('prisma/migrations/202610100001_optional_youtube_video/migration.sql', 'utf8');
  for (const statement of sql.split(';').filter((value) => value.trim())) await db.$executeRawUnsafe(statement);
  assert.deepEqual(await db.$queryRawUnsafe('SELECT id,title,slug FROM "Project" UNION ALL SELECT id,title,slug FROM "Product" ORDER BY id'), before);
  assert.equal((await db.project.findUnique({ where: { id: 'old-project' } })).youtubeUrl, null);
  assert.equal((await db.product.findUnique({ where: { id: 'old-product' } })).youtubeUrl, null);
  const out = path.resolve('.next/qa/youtube-actions.cjs');
  await build({ stdin: { contents: `export { upsertProject } from './src/app/actions/projects'; export { upsertProduct } from './src/app/actions/products'; export { getProjectBySlug, getProductBySlug } from './src/lib/seo/queries';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: out, plugins: [{ name: 'qa-only-boundaries', setup(builder) {
    builder.onResolve({ filter: /^(@\/lib\/db|@\/auth|next\/cache)$/ }, args => ({ path: args.path, namespace: 'qa' }));
    builder.onLoad({ filter: /.*/, namespace: 'qa' }, args => ({ contents: args.path === '@/lib/db' ? 'export const prisma = globalThis.__youtubeQaDb;' : args.path === '@/auth' ? 'export async function auth() { return globalThis.__youtubeQaSession; }' : 'export function revalidatePath(path) { globalThis.__youtubeQaPaths.push(path); }', loader: 'js' }));
  }}] });
  const actions = loadBundle(out);
  const common = { title: 'Local QA fixture', slug: '', description: 'Test only', content: '<h2>Preserved body</h2><p>Fixture</p>', coverImage: '/fixture.webp', images: ['/fixture.webp'], techStack: ['PHP','MySQL'], isFeatured: false, isPublished: true, robotsIndex: false, robotsFollow: true, seoKeywords: ['fixture'], canonicalPath: '', order: 3 };
  const project = { ...common, category: 'Web Application' };
  const product = { ...common, price: 150000, salePrice: 120000, type: 'SOURCE_CODE', features: ['Feature'], maxDownloads: 7, currency: 'VND', pricingMode: 'FIXED', availability: 'IN_STOCK', sku: 'QA-VIDEO', licenseName: 'Fixture' };
  const a = 'M7lc1UVf-VE', b = 'dQw4w9WgXcQ';
  for (const [entity, input, action] of [['project', project, actions.upsertProject], ['product', product, actions.upsertProduct]]) {
    for (const [index, url] of [undefined, null, '', '   ', `https://youtube.com/watch?v=${a}`, `https://youtu.be/${a}?t=20`, `https://youtube.com/shorts/${a}`, `https://youtube.com/embed/${a}`].entries()) {
      const data = { ...input, slug: `qa-${entity}-${index}`, ...(entity === 'product' ? { sku: `QA-VIDEO-${index}` } : {}), youtubeUrl: url };
      const created = await action(data);
      assert.equal(created.success, true, JSON.stringify(created));
      const record = created[entity];
      const saved = await db[entity].findUnique({ where: { id: record.id } });
      assert.equal(saved.youtubeUrl, index < 4 ? null : `https://www.youtube.com/watch?v=${a}`);
      if (index !== 4) continue;
      const fixed = { ...data, id: saved.id };
      const untouched = (value) => Object.fromEntries(Object.entries(value).filter(([key]) => !['youtubeUrl', 'updatedAt'].includes(key)));
      await action({ ...fixed, youtubeUrl: `https://youtu.be/${b}` });
      let current = await db[entity].findUnique({ where: { id: saved.id } });
      assert.equal(current.youtubeUrl, `https://www.youtube.com/watch?v=${b}`);
      assert.deepEqual(untouched(current), untouched(saved));
      const omitted = { ...fixed }; delete omitted.youtubeUrl;
      assert.equal((await action(omitted)).success, true);
      assert.equal((await db[entity].findUnique({ where: { id: saved.id } })).youtubeUrl, current.youtubeUrl);
      for (const value of [null, '', '   ']) {
        assert.equal((await action({ ...fixed, youtubeUrl: value })).success, true);
        assert.equal((await db[entity].findUnique({ where: { id: saved.id } })).youtubeUrl, null);
      }
      current = await db[entity].findUnique({ where: { id: saved.id } });
      const pathsBefore = global.__youtubeQaPaths.length;
      for (const bad of ['https://youtube.com.evil.test/watch?v=M7lc1UVf-VE', '<iframe/>', 'javascript:alert(1)', 'https://youtube.com/playlist?list=123']) {
        const rejected = await action({ ...fixed, title: 'Must not be saved', youtubeUrl: bad });
        assert.equal(rejected.success, false);
        assert.ok(rejected.fieldErrors.youtubeUrl);
        assert.deepEqual(await db[entity].findUnique({ where: { id: saved.id } }), current);
      }
      assert.equal(global.__youtubeQaPaths.length, pathsBefore);
      for (const session of [null, { user: { id: 'qa-user', role: 'CUSTOMER' } }]) {
        global.__youtubeQaSession = session;
        assert.equal((await action({ ...fixed, youtubeUrl: `https://youtu.be/${a}` })).success, false);
        assert.deepEqual(await db[entity].findUnique({ where: { id: saved.id } }), current);
      }
      global.__youtubeQaSession = { user: { id: 'qa-admin', role: 'ADMIN' } };
      assert.ok(global.__youtubeQaPaths.includes(entity === 'project' ? `/du-an/${saved.slug}` : `/san-pham/${saved.slug}`));
    }
    const draft = await action({ ...input, slug: `qa-draft-${entity}`, isPublished: false, ...(entity === 'product' ? { sku: 'QA-DRAFT' } : {}), youtubeUrl: `https://youtu.be/${a}` });
    assert.equal(draft.success, true);
    assert.equal(await (entity === 'project' ? actions.getProjectBySlug : actions.getProductBySlug)(`qa-draft-${entity}`), null);
  }
  for (const mode of ['FREE', 'CONTACT', 'FIXED']) {
    const input = { ...product, slug: `qa-pricing-${mode.toLowerCase()}`, sku: `QA-${mode}`, pricingMode: mode, price: mode === 'FIXED' ? 150000 : 0, salePrice: null, youtubeUrl: `https://youtu.be/${a}` };
    const created = await actions.upsertProduct(input);
    assert.equal(created.success, true);
    const original = await db.product.findUniqueOrThrow({ where: { id: created.product.id } });
    assert.equal((await actions.upsertProduct({ ...input, id: original.id, youtubeUrl: '' })).success, true);
    const cleared = await db.product.findUniqueOrThrow({ where: { id: original.id } });
    assert.equal(cleared.youtubeUrl, null);
    for (const key of ['price', 'salePrice', 'currency', 'pricingMode', 'availability', 'sku', 'maxDownloads', 'licenseName', 'features', 'techStack', 'publishedAt', 'robotsIndex', 'robotsFollow']) assert.deepEqual(cleared[key], original[key]);
  }
  console.log('PASS: additive migration / old rows / Project and Product create variants / A->B / omission / clears / auth / invalid atomicity / cache paths / DRAFT public filtering. Real isolated PostgreSQL, mocked session/cache only.');
}
main().finally(() => db.$disconnect()).catch(error => { console.error(error); process.exitCode = 1; });
