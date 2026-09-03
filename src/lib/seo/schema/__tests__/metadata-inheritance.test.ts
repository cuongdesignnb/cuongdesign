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
  assert.equal(loginMetadata.alternates?.canonical, undefined);
  assert.equal(loginMetadata.openGraph?.url, undefined);
});
