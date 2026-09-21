import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { metadata as loginMetadata } from "../../../../app/login/page";
import {
  createMetadataFromSeoFields,
  createSitewideMetadata,
} from "../../metadata";

test("sitewide metadata does not establish a canonical, Open Graph URL, or robots policy", () => {
  const metadata = createSitewideMetadata({
    title: "Cường Design",
    titleTemplate: "%s | Cường Design",
    description: "Thiết kế và phát triển website.",
  });

  assert.equal(metadata.alternates?.canonical, undefined);
  assert.equal(metadata.openGraph?.url, undefined);
  assert.equal(metadata.robots, undefined);
});

test("root HTML declares Vietnamese language and the standard viewport", async () => {
  const source = await readFile(new URL("../../../../app/layout.tsx", import.meta.url), "utf8");

  assert.match(source, /export const viewport:\s*Viewport/);
  assert.match(source, /width:\s*["']device-width["']/);
  assert.match(source, /initialScale:\s*1/);
  assert.match(source, /<html[\s\S]*lang="vi"/);
});

test("homepage metadata remains explicit, canonical, and indexable", () => {
  const metadata = createMetadataFromSeoFields({
    seo: { title: "Cường Design" },
    fallback: { title: "Cường Design", description: "Thiết kế và phát triển website." },
    path: "/",
  });
  const robots = metadata.robots as { index?: boolean; follow?: boolean };

  assert.equal(metadata.alternates?.canonical, "https://cuongdesign.net");
  assert.equal(metadata.openGraph?.url, "https://cuongdesign.net");
  assert.equal(robots.index, true);
  assert.equal(robots.follow, true);
});

test("not-found routes leave the single noindex signal to Next.js", async () => {
  const routes = [
    "du-an/[slug]/page.tsx",
    "san-pham/[slug]/page.tsx",
    "dich-vu/[slug]/page.tsx",
    "bai-viet/[slug]/page.tsx",
    "bai-viet/chuyen-muc/[slug]/page.tsx",
    "(website)/[slug]/page.tsx",
    "not-found.tsx",
  ];

  for (const route of routes) {
    const source = await readFile(new URL(`../../../../app/${route}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /robots:\s*\{\s*index:\s*false/);
  }
});

test("login remains explicitly noindex and nofollow without a canonical URL", () => {
  assert.deepEqual(loginMetadata.robots, { index: false, follow: false });
  assert.deepEqual(loginMetadata.title, { absolute: "Đăng nhập | CUONG DESIGN" });
  assert.equal(loginMetadata.alternates?.canonical, undefined);
  assert.equal(loginMetadata.openGraph?.url, undefined);
});

test("404 metadata does not add homepage canonical or Open Graph URL", async () => {
  const source = await readFile(new URL("../../../../app/not-found.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /alternates\s*:/);
  assert.doesNotMatch(source, /openGraph\s*:/);
  assert.match(source, /title:\s*["']Không tìm thấy trang["']/);
});
