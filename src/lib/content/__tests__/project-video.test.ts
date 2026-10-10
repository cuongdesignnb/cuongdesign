import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import postcss from "postcss";
import { getYouTubeVideo, normalizeYouTubeUrl, YouTubeUrlValidationError } from "../../video/youtube";
import YouTubeVideo from "../../../components/media/YouTubeVideo";
import YouTubeUrlField from "../../../components/admin/content/YouTubeUrlField";
import { sanitizeRichHtml } from "../sanitize";

const id = "M7lc1UVf-VE";
const canonical = `https://www.youtube.com/watch?v=${id}`;
const valid = [canonical, `https://youtube.com/watch?v=${id}&list=ignored&t=2#fragment`, `https://m.youtube.com/watch?v=${id}`, `https://youtu.be/${id}?si=ignored`, `https://www.youtube.com/shorts/${id}`, `https://www.youtube.com/embed/${id}`, `  ${canonical}  `];
const invalid: unknown[] = ["http://youtu.be/M7lc1UVf-VE", "//youtu.be/M7lc1UVf-VE", "javascript:alert(1)", "data:text/html,test", "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE", "https://evilyoutube.com/watch?v=M7lc1UVf-VE", "https://youtube.com@evil.test/watch?v=M7lc1UVf-VE", "https://user@youtube.com/watch?v=M7lc1UVf-VE", "https://youtube.com:444/watch?v=M7lc1UVf-VE", "https://youtube.com/playlist?list=123", "https://youtube.com/channel/M7lc1UVf-VE", "https://youtu.be/M7lc1UVf-VE/extra", "https://youtube.com/embed/M7lc1UVf-VE/", "https://youtube.com/watch?v=short", "https://youtube.com/watch?v=M7lc1UVf-VE&v=dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE", "<iframe src='https://youtu.be/M7lc1UVf-VE'></iframe>", "<script>alert(1)</script>", "https://youtu.be/1234567890%41", "https://youtu.be\\M7lc1UVf-VE", 42, {}, true];

test("YouTube formats normalize to one URL and fixed privacy embed host", () => {
  for (const value of valid) {
    assert.equal(normalizeYouTubeUrl(value), canonical);
    assert.deepEqual(getYouTubeVideo(value), { id, watchUrl: canonical, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` });
  }
});
test("unsafe hosts, credentials, protocols, IDs, HTML and ambiguous paths are rejected", () => {
  for (const value of invalid) {
    assert.equal(getYouTubeVideo(value), null, String(value));
    assert.throws(() => normalizeYouTubeUrl(value), YouTubeUrlValidationError);
  }
});
test("omission preserves on update; explicit empty/null clears; create uses null", () => {
  assert.equal(normalizeYouTubeUrl(undefined), undefined);
  assert.equal(normalizeYouTubeUrl(undefined) ?? null, null);
  for (const value of [null, "", " \t\n "]) assert.equal(normalizeYouTubeUrl(value), null);
});
test("video section is entirely absent for empty/missing/invalid legacy values", () => {
  for (const url of [undefined, null, "", "  ", ...invalid.filter((v): v is string => typeof v === "string")]) {
    assert.equal(renderToStaticMarkup(createElement(YouTubeVideo, { url, title: "Fixture", kind: "project" })), "");
  }
});
test("SSR iframe keeps keyboard/fullscreen/lazy loading and has a safe fallback", () => {
  const html = renderToStaticMarkup(createElement(YouTubeVideo, { url: canonical, title: '<Test> & "quotes"', kind: "product" }));
  const $ = load(html);
  assert.equal($("h1").length, 0);
  assert.equal($("h2").text(), "Video giới thiệu sản phẩm");
  assert.equal($("iframe").attr("src"), `https://www.youtube-nocookie.com/embed/${id}`);
  assert.equal($("iframe").attr("loading"), "lazy");
  assert.equal($("iframe").attr("referrerpolicy"), "strict-origin-when-cross-origin");
  assert.equal($("iframe").attr("allow"), "encrypted-media; picture-in-picture; fullscreen");
  assert.equal($("iframe").attr("allowfullscreen"), "");
  assert.match($("iframe").attr("title") || "", /<Test> & "quotes"/);
  assert.equal($("a").attr("href"), canonical);
  assert.equal($("script").length, 0);
});
test("schema gate stays closed without a verified metadata source (even for plausible URLs)", () => {
  for (const url of [canonical, "https://youtu.be/00000000000", "bad", null]) {
    const html = renderToStaticMarkup(createElement(YouTubeVideo, { url, title: "Not verified video metadata", kind: "project" }));
    assert.doesNotMatch(html, /VideoObject|uploadDate|thumbnailUrl|application\/ld\+json/);
  }
});
test("video field has connected label, help and accessible server error", () => {
  const $ = load(renderToStaticMarkup(createElement(YouTubeUrlField, { id: "test-video", value: "bad", error: "Invalid URL", onChange: () => {} })));
  assert.equal($("label").attr("for"), "test-video");
  assert.equal($("input").attr("aria-invalid"), "true");
  assert.equal($("input").attr("aria-describedby"), "test-video-help test-video-error");
  assert.equal($("#test-video-error").attr("role"), "alert");
});
test("admin routes remount editors by record ID so video state cannot carry across records", () => {
  for (const entity of ["project", "product"]) {
    const source = readFileSync(`src/app/(admin)/admin/${entity}s/[id]/page.tsx`, "utf8");
    assert.match(source, new RegExp(`key=\\{${entity}\\.id\\}`));
    const manager = readFileSync(`src/components/sections/Admin${entity === "project" ? "Projects" : "Products"}Manager.tsx`, "utf8");
    assert.match(manager, new RegExp(`youtubeUrl: ${entity}\\.youtubeUrl \\?\\? ""`));
  }
});
test("project CSS is scoped, with no global heading or existing renderer changes", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const addition = css.slice(css.indexOf("/* Project body only;"), css.indexOf("\n.article-content {"));
  postcss.parse(addition).walkRules((rule) => {
    assert.ok(rule.selectors.every((selector) => /^\.(project-article-content|youtube-video)\b/.test(selector)));
  });
  assert.match(addition, /min-width: 768px/);
  assert.match(addition, /overflow-x: auto/);
  const page = readFileSync("src/app/du-an/[slug]/page.tsx", "utf8");
  assert.match(page, /className="project-article-content"/);
  assert.match(page, /sanitizeRichHtml\(project.content\)/);
  assert.doesNotMatch(page, /space-y-6"\s+dangerouslySetInnerHTML/);
});
test("sanitizer preserves body hierarchy, links, images and captions, not inline font/iframe", () => {
  const html = sanitizeRichHtml('<h1>Extra</h1><h2 style="font-size:50px;text-align:center">Heading</h2><h3>Subheading</h3><ul><li>A<ol><li>B</li></ol></li></ul><blockquote><p>Quote</p></blockquote><figure><img src="/uploads/fixture.webp" alt="UI fixture" width="1200" height="800" loading="lazy"><figcaption>Caption</figcaption></figure><a href="/lien-he" target="_blank" rel="noopener noreferrer">Link</a><iframe src="https://youtube.com/embed/M7lc1UVf-VE"></iframe><script>x</script><table><tr><td>Table unsupported</td></tr></table>');
  const $ = load(html);
  assert.equal($("h1, iframe, script, table").length, 0);
  assert.equal($("h2").attr("style"), "text-align:center");
  assert.equal($("h3").text(), "Subheading");
  assert.equal($("li ol li").text(), "B");
  assert.equal($("figcaption").text(), "Caption");
  assert.equal($("img").attr("width"), "1200");
  assert.equal($("img").attr("height"), "800");
  assert.equal($("img").attr("alt"), "UI fixture");
  assert.equal($("img").attr("loading"), "lazy");
  assert.equal($("a").attr("href"), "/lien-he");
  assert.equal($("a").attr("target"), "_blank");
  assert.equal($("a").attr("rel"), "noopener noreferrer");
});
