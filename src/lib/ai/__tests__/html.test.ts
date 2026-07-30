import assert from "node:assert/strict";
import test from "node:test";
import * as cheerio from "cheerio";
import {
  countImagesMissingAlt,
  ensureImageAlt,
  insertInlineImages,
} from "../html";

test("fills missing image alt while preserving a meaningful existing alt", () => {
  const html = ensureImageAlt(
    '<p><img src="/first.webp"><img src="/second.webp" alt="Bản thiết kế trang chủ"></p>',
    "Thiết kế website doanh nghiệp",
  );
  const $ = cheerio.load(html, null, false);
  const images = $("img");

  assert.equal(images.eq(0).attr("alt"), "Thiết kế website doanh nghiệp");
  assert.equal(images.eq(1).attr("alt"), "Bản thiết kế trang chủ");
  assert.equal(images.eq(0).attr("loading"), "lazy");
  assert.equal(countImagesMissingAlt(html), 0);
});

test("inserts generated images with alt and captions near requested headings", () => {
  const html = insertInlineImages(
    "<h2>Quy trình thiết kế</h2><p>Nội dung quy trình.</p>",
    [
      {
        url: "/uploads/blog/process.webp",
        alt: "Sơ đồ các bước thiết kế website",
        mediaId: "media-1",
        width: 1536,
        height: 1024,
        afterHeading: "Quy trình thiết kế",
      },
    ],
  );
  const $ = cheerio.load(html, null, false);

  assert.equal($("h2 + figure img").attr("alt"), "Sơ đồ các bước thiết kế website");
  assert.equal($("figure figcaption").text(), "Sơ đồ các bước thiết kế website");
  assert.equal(countImagesMissingAlt(html), 0);
});
