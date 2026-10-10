import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { PrismaClient } from '@prisma/client';

const testUrl = 'postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if (process.env.TEST_DATABASE_URL !== testUrl) throw new Error('Only the owned isolated LOCAL QA database is allowed.');
const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
global.__projectDatesDb = db;
global.__projectDatesSession = { user: { id: 'qa-admin', role: 'ADMIN' } };
global.__projectDatesPaths = [];
const out = path.resolve('.next/qa/project-dates-actions.cjs');
const results = [];
const input = {
  title: 'LOCAL date fixture', slug: '', description: 'Synthetic LOCAL test only',
  content: '<h2>Preserved</h2><p>Fixture <a href="/lien-he">link</a></p>',
  coverImage: 'http://127.0.0.1:13441/screen.webp', images: ['http://127.0.0.1:13441/screen.webp'],
  techStack: ['PHP', 'MySQL'], category: 'Web Application', isFeatured: false,
  isPublished: true, robotsIndex: false, robotsFollow: true, order: 7,
  youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', seoTitle: 'LOCAL original title',
};

try {
  await build({ stdin: { contents: `export { upsertProject } from './src/app/actions/projects'; export { projectCompletedAtFormState } from './src/lib/content/project-dates'; export { buildProjectSchema } from './src/lib/seo/schema/project';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: out, plugins: [{ name: 'local-test-boundaries', setup(builder) {
    builder.onResolve({ filter: /^(@\/lib\/db|@\/auth|next\/cache)$/ }, args => ({ path: args.path, namespace: 'qa' }));
    builder.onLoad({ filter: /.*/, namespace: 'qa' }, args => ({ contents: args.path === '@/lib/db' ? 'export const prisma = globalThis.__projectDatesDb;' : args.path === '@/auth' ? 'export async function auth() { return globalThis.__projectDatesSession; }' : 'export function revalidatePath(path) { globalThis.__projectDatesPaths.push(path); }', loader: 'js' }));
  }}] });
  const { upsertProject, projectCompletedAtFormState, buildProjectSchema } = createRequire(import.meta.url)(out);
  const schema = row => buildProjectSchema({ ...row, image: row.coverImage });
  const stable = row => Object.fromEntries(Object.entries(row).filter(([key]) => !['seoTitle', 'updatedAt'].includes(key)));
  for (const [index, completedAt] of [undefined, null, '', '  ', '2024-02-29', '2026-05-15'].entries()) {
    const created = await upsertProject({ ...input, slug: `qa-date-integration-${Date.now()}-${index}`, completedAt });
    assert.equal(created.success, true, JSON.stringify(created));
    const row = created.project;
    assert.equal(row.completedAt?.toISOString() ?? null, index < 4 ? null : `${completedAt}T00:00:00.000Z`);
    assert.equal(schema(row).datePublished, row.publishedAt.toISOString());
    if (index !== 5) continue;
    // Retain the full historical timestamp if the calendar-day field was not edited.
    const original = await db.project.update({ where: { id: row.id }, data: {
      completedAt: new Date('2026-05-15T23:30:00.000Z'), publishedAt: new Date('2026-08-02T00:15:00.000Z'),
    } });
    const fixed = { ...input, id: row.id, slug: row.slug, completedAt: projectCompletedAtFormState(original.completedAt).value };
    for (let round = 1; round <= 3; round++) {
      const saved = await upsertProject({ ...fixed, seoTitle: `LOCAL SEO edit ${round}` });
      assert.equal(saved.success, true, JSON.stringify(saved));
      const current = await db.project.findUniqueOrThrow({ where: { id: row.id } });
      assert.deepEqual(stable(current), stable(original));
      assert.equal(schema(current).datePublished, original.publishedAt.toISOString());
    }
    const omitted = { ...fixed }; delete omitted.completedAt;
    assert.equal((await upsertProject(omitted)).success, true);
    assert.equal((await db.project.findUniqueOrThrow({ where: { id: row.id } })).completedAt.toISOString(), original.completedAt.toISOString());
    const beforeInvalid = await db.project.findUniqueOrThrow({ where: { id: row.id } });
    const pathsBefore = global.__projectDatesPaths.length;
    for (const bad of ['Tue May 15', '15/05/2026', '2026-02-29', '1900-02-29', '2026-04-31', '2026-05-15T00:00:00Z', 42, {}, true, new Date(NaN)]) {
      const rejected = await upsertProject({ ...fixed, title: 'Must not be saved', completedAt: bad });
      assert.equal(rejected.success, false, String(bad));
      assert.ok(rejected.fieldErrors?.completedAt);
      assert.deepEqual(await db.project.findUniqueOrThrow({ where: { id: row.id } }), beforeInvalid);
    }
    assert.equal(global.__projectDatesPaths.length, pathsBefore);
    for (const empty of [null, '', '  ']) {
      assert.equal((await upsertProject({ ...fixed, completedAt: empty })).success, true);
      const cleared = await db.project.findUniqueOrThrow({ where: { id: row.id } });
      assert.equal(cleared.completedAt, null);
      assert.equal(cleared.publishedAt.toISOString(), original.publishedAt.toISOString());
    }
    assert.equal((await upsertProject({ ...fixed, completedAt: '2024-02-29' })).success, true);
    const leap = await db.project.findUniqueOrThrow({ where: { id: row.id } });
    assert.equal(leap.completedAt.toISOString(), '2024-02-29T00:00:00.000Z');
    assert.equal(schema(leap).datePublished, original.publishedAt.toISOString());
    // Audit only: this is the existing lifecycle, deliberately not changed by the fix.
    const unpublished = await upsertProject({ ...fixed, isPublished: false });
    assert.equal(unpublished.success, true);
    assert.equal(unpublished.project.publishedAt, null);
    const republished = await upsertProject(fixed);
    assert.equal(republished.success, true);
    assert.notEqual(republished.project.publishedAt.toISOString(), original.publishedAt.toISOString());
    results.push({ omitted: 'PRESERVED', invalidAtomicity: 'PASS', consecutiveSeoSaves: 3, clear: 'PASS', leap: 'PASS', fullTimestampPreserved: original.completedAt.toISOString(), existingUnpublish: 'publishedAt=null', existingRepublish: 'new publishedAt; owner decision needed for first-publication history' });
    const nullPublication = await db.project.update({ where: { id: row.id }, data: { publishedAt: null } });
    assert.equal(Object.hasOwn(schema(nullPublication), 'datePublished'), false);
    for (const session of [null, { user: { role: 'CUSTOMER' } }]) {
      global.__projectDatesSession = session;
      assert.equal((await upsertProject(fixed)).success, false);
      assert.deepEqual(await db.project.findUniqueOrThrow({ where: { id: row.id } }), nullPublication);
    }
    global.__projectDatesSession = { user: { id: 'qa-admin', role: 'ADMIN' } };
    assert.ok(global.__projectDatesPaths.includes(`/du-an/${row.slug}`));
  }
  console.log('PASS: real isolated PostgreSQL / completion lifecycle / strict date rejection / atomicity / 3 SEO saves / exact old timestamps / schema publication source / auth / cache paths. Publication lifecycle audited, not changed.');
} finally {
  if (process.env.QA_OUTPUT_DIR) {
    await fs.mkdir(process.env.QA_OUTPUT_DIR, { recursive: true });
    await fs.writeFile(path.join(process.env.QA_OUTPUT_DIR, 'project-date-integration.json'), JSON.stringify(results, null, 2));
  }
  await db.$disconnect();
}
