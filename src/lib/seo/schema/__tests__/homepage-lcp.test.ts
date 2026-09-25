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
