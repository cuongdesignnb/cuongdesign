import assert from "node:assert/strict";
import test from "node:test";
import * as cheerio from "cheerio";
import {
  injectInternalLinks,
  rankInternalLinkCandidates,
  validateInternalLinks,
} from "../internal-links";
import type { InternalLinkCandidate } from "../types";
import { sanitizeRichHtml } from "@/lib/content/sanitize";

test("maps anchor text only to the post that owns the keyword", () => {
  const candidates = rankInternalLinkCandidates(
    [
      {
        id: "website-post",
        targetType: "article",
        title: "Thiết kế website bán hàng chuyên nghiệp",
        href: "/bai-viet/thiet-ke-website-ban-hang",
        searchText: "Giải pháp website chuyển đổi cao.",
        seoKeywords: ["thiết kế website bán hàng", "website bán hàng"],
      },
      {
        id: "seo-post",
        targetType: "article",
        title: "Dịch vụ SEO tổng thể",
        href: "/bai-viet/dich-vu-seo-tong-the",
        searchText: "Tăng trưởng organic traffic.",
        seoKeywords: ["dịch vụ SEO tổng thể", "SEO website"],
      },
    ],
    "Kinh nghiệm thiết kế website bán hàng",
    ["website bán hàng"],
  );

  const result = injectInternalLinks(
    "<p>Dịch vụ thiết kế website bán hàng cần tối ưu trải nghiệm mua sắm.</p>",
    candidates,
  );
  const $ = cheerio.load(result.html, null, false);
  const link = $("a[data-internal-link='true']");

  assert.equal(link.length, 1);
  assert.equal(link.attr("href"), "/bai-viet/thiet-ke-website-ban-hang");
  assert.equal(link.text().toLocaleLowerCase("vi"), "thiết kế website bán hàng");
  assert.equal(validateInternalLinks(result.html, candidates), true);
  assert.equal(
    validateInternalLinks(sanitizeRichHtml(result.html), candidates),
    true,
  );
});

test("keeps internal-link density bounded and rejects a mismatched target", () => {
  const candidates: InternalLinkCandidate[] = [
    {
      targetId: "one",
      targetType: "article",
      title: "Thiết kế giao diện",
      href: "/bai-viet/thiet-ke-giao-dien",
      anchors: ["thiết kế giao diện"],
      score: 3,
    },
    {
      targetId: "two",
      targetType: "article",
      title: "Tối ưu chuyển đổi",
      href: "/bai-viet/toi-uu-chuyen-doi",
      anchors: ["tối ưu chuyển đổi"],
      score: 2,
    },
    {
      targetId: "three",
      targetType: "article",
      title: "Nghiên cứu người dùng",
      href: "/bai-viet/nghien-cuu-nguoi-dung",
      anchors: ["nghiên cứu người dùng"],
      score: 1,
    },
  ];
  const filler = Array.from({ length: 950 }, () => "nội dung").join(" ");
  const result = injectInternalLinks(
    `<p>thiết kế giao diện ${filler}</p><p>tối ưu chuyển đổi và nghiên cứu người dùng</p>`,
    candidates,
  );
  const $ = cheerio.load(result.html, null, false);

  assert.equal($("a[data-internal-link='true']").length, 2);
  assert.equal(validateInternalLinks(result.html, candidates), true);
  assert.equal(
    validateInternalLinks(
      '<p><a data-internal-link="true" href="/bai-viet/sai">thiết kế giao diện</a></p>',
      candidates,
    ),
    false,
  );
});

test("assigns a duplicated keyword to only the most relevant post", () => {
  const candidates = rankInternalLinkCandidates(
    [
      {
        id: "best",
        targetType: "article",
        title: "Thiết kế website bán hàng",
        href: "/bai-viet/website-ban-hang",
        searchText: "Thiết kế website bán hàng tối ưu chuyển đổi.",
        seoKeywords: ["website bán hàng"],
      },
      {
        id: "other",
        targetType: "article",
        title: "SEO cho cửa hàng trực tuyến",
        href: "/bai-viet/seo-cua-hang",
        searchText: "SEO website thương mại điện tử.",
        seoKeywords: ["website bán hàng"],
      },
    ],
    "Kinh nghiệm thiết kế website bán hàng",
    [],
  );
  const owners = candidates.filter((candidate) =>
    candidate.anchors.includes("website bán hàng"),
  );

  assert.equal(owners.length, 1);
  assert.equal(owners[0].targetId, "best");
});

test("supports product targets without mixing their anchors with articles", () => {
  const candidates = rankInternalLinkCandidates(
    [
      {
        id: "product-one",
        targetType: "product",
        title: "Template website portfolio",
        href: "/san-pham/template-website-portfolio",
        searchText: "Source code portfolio dành cho designer.",
        seoKeywords: ["template website portfolio", "source code portfolio"],
      },
    ],
    "Cách chọn template website portfolio",
    ["source code portfolio"],
  );
  const result = injectInternalLinks(
    "<p>Một template website portfolio tốt cần tải nhanh và dễ chỉnh sửa.</p>",
    candidates,
  );

  assert.equal(candidates[0].targetType, "product");
  assert.equal(candidates[0].href, "/san-pham/template-website-portfolio");
  assert.match(result.html, /href="\/san-pham\/template-website-portfolio"/);
  assert.equal(validateInternalLinks(result.html, candidates), true);
});
