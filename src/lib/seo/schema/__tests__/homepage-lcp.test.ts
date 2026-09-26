import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("homepage Hero H1 is visible HTML independent of the stagger animation", async () => {
  const source = await readFile(
    new URL("../../../../components/sections/HeroSection.tsx", import.meta.url),
    "utf8",
  );

  assert.equal((source.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(source, /<motion\.h1\b/);
  const h1OpeningTag = source.match(/<h1\b[^>]*>/)?.[0] || "";
  assert.ok(h1OpeningTag);
  assert.doesNotMatch(h1OpeningTag, /variants=/);
  assert.match(source, /<h1\b[\s\S]*?content\.headlinePrefix/);
});

test("homepage Hero rich description uses a block-safe animated wrapper", async () => {
  const source = await readFile(
    new URL("../../../../components/sections/HeroSection.tsx", import.meta.url),
    "utf8",
  );
  const descriptionIndex = source.indexOf(
    "dangerouslySetInnerHTML={{ __html: content.description }}",
  );

  assert.notEqual(descriptionIndex, -1);
  const wrapperStart = source.lastIndexOf("<motion.", descriptionIndex);
  const wrapperEnd = source.indexOf("/>", descriptionIndex);
  const wrapper = source.slice(wrapperStart, wrapperEnd + 2);

  assert.match(wrapper, /^<motion\.div\b/);
  assert.match(wrapper, /variants=\{fadeUpItem\}/);
  assert.match(
    wrapper,
    /className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl"/,
  );
  assert.doesNotMatch(wrapper, /<motion\.p\b|<span\b/);
  assert.doesNotMatch(source, /<motion\.h1\b/);
  assert.equal((source.match(/<h1\b/g) || []).length, 1);
});

test("homepage defers only below-fold sections and preserves the server-rendered page tree", async () => {
  const page = await readFile(
    new URL("../../../../app/page.tsx", import.meta.url),
    "utf8",
  );
  const globalCss = await readFile(
    new URL("../../../../app/globals.css", import.meta.url),
    "utf8",
  );
  const hero = await readFile(
    new URL("../../../../components/sections/HeroSection.tsx", import.meta.url),
    "utf8",
  );

  assert.match(globalCss, /@supports\s*\(content-visibility:\s*auto\)\s*and\s*\(contain-intrinsic-block-size:\s*auto 1px\)/);
  assert.match(globalCss, /content-visibility:\s*auto/);
  assert.match(globalCss, /contain-intrinsic-block-size:\s*auto var\(--home-deferred-mobile-size\)/);
  assert.match(globalCss, /contain-intrinsic-block-size:\s*auto var\(--home-deferred-desktop-size\)/);
  assert.doesNotMatch(hero, /home-deferred-section/);

  for (const section of [
    "AboutSection",
    "ServicesSection",
    "FeaturedProjectsSection",
    "DigitalProductsSection",
    "WorkProcessSection",
    "TechStackSection",
    "TestimonialsSection",
    "CTASection",
    "ContactSection",
  ]) {
    assert.match(page, new RegExp(`<${section}\\b`), `${section} remains in the homepage server tree`);
  }

  const sectionSources = [
    ["AboutSection.tsx", "home-deferred-section--about"],
    ["ServicesSection.tsx", "home-deferred-section--services"],
    ["FeaturedProjectsSection.tsx", "home-deferred-section--projects"],
    ["WorkProcessSection.tsx", "home-deferred-section--process"],
    ["TechStackSection.tsx", "home-deferred-section--skills"],
    ["TestimonialsSection.tsx", "home-deferred-section--testimonials"],
    ["CTASection.tsx", "home-deferred-section--cta"],
    ["ContactSection.tsx", "home-deferred-section--contact"],
  ] as const;

  for (const [filename, marker] of sectionSources) {
    const source = await readFile(
      new URL(`../../../../components/sections/${filename}`, import.meta.url),
      "utf8",
    );
    assert.ok(source.includes(marker), `${filename} opts into the shared deferred class`);
  }

  const products = await readFile(
    new URL("../../../../components/sections/DigitalProductsSection.tsx", import.meta.url),
    "utf8",
  );
  assert.match(products, /home-deferred-section--products/);
  assert.match(products, /<\/Stagger>\s*<\/div>\s*<\/div>\s*\{\/\* Free Product \/ Contact Form Modal \*\//);
  assert.match(hero, /<h1\b[\s\S]*?content\.headlinePrefix/);
  assert.match(hero, /dangerouslySetInnerHTML=\{\{ __html: content\.description \}\}/);
});
