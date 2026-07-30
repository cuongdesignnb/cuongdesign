import * as cheerio from "cheerio";
import type {
  InternalLinkCandidate,
  InternalLinkUsed,
} from "./types";

interface LinkablePost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  seoKeywords: string[];
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 2));
}

function overlap(left: Set<string>, right: Set<string>) {
  let score = 0;
  left.forEach((token) => {
    if (right.has(token)) score += 1;
  });
  return score;
}

function validAnchor(value: string) {
  const words = value.trim().split(/\s+/);
  return value.trim().length >= 4 && words.length >= 2 && words.length <= 10;
}

export function rankInternalLinkCandidates(
  posts: LinkablePost[],
  topic: string,
  sharedKeywords: string[],
  limit = 8,
): InternalLinkCandidate[] {
  const intent = tokens([topic, ...sharedKeywords].join(" "));

  const ranked = posts
    .map((post) => {
      const anchors = [...new Set([...post.seoKeywords, post.title].map((item) => item.trim()))]
        .filter(validAnchor)
        .sort((left, right) => right.length - left.length);
      const target = tokens(
        [post.title, post.excerpt || "", ...post.seoKeywords].join(" "),
      );
      const phraseBonus = anchors.some((anchor) =>
        normalize(topic).includes(normalize(anchor)),
      )
        ? 4
        : 0;

      return {
        postId: post.id,
        title: post.title,
        href: `/bai-viet/${post.slug}`,
        anchors,
        score: overlap(intent, target) + phraseBonus,
      };
    })
    .filter((candidate) => candidate.anchors.length > 0 && candidate.score > 0)
    .sort((left, right) => right.score - left.score);

  const claimedAnchors = new Set<string>();
  const candidates: InternalLinkCandidate[] = [];
  for (const candidate of ranked) {
    const anchors = candidate.anchors.filter((anchor) => {
      const key = normalize(anchor);
      if (claimedAnchors.has(key)) return false;
      claimedAnchors.add(key);
      return true;
    });
    if (anchors.length === 0) continue;
    candidates.push({ ...candidate, anchors });
    if (candidates.length >= limit) break;
  }
  return candidates;
}

function textWordCount(html: string) {
  const $ = cheerio.load(html, null, false);
  return $.root().text().trim().split(/\s+/).filter(Boolean).length;
}

function findAnchor(text: string, anchors: string[]) {
  const lowered = text.toLocaleLowerCase("vi");
  for (const anchor of anchors) {
    const index = lowered.indexOf(anchor.toLocaleLowerCase("vi"));
    if (index < 0) continue;
    const before = index === 0 ? "" : lowered[index - 1];
    const after = lowered[index + anchor.length] || "";
    if (before && /[\p{L}\p{N}]/u.test(before)) continue;
    if (after && /[\p{L}\p{N}]/u.test(after)) continue;
    return { index, length: anchor.length };
  }
  return null;
}

export function injectInternalLinks(
  html: string,
  candidates: InternalLinkCandidate[],
): { html: string; links: InternalLinkUsed[] } {
  const $ = cheerio.load(html, null, false);
  $("a").each((_index, element) => {
    $(element).replaceWith($(element).text());
  });

  const wordCount = textWordCount($.root().html() || "");
  const maxLinks = Math.min(4, Math.max(1, Math.floor(wordCount / 450)));
  const links: InternalLinkUsed[] = [];
  const textNodes = $("p, li")
    .contents()
    .toArray()
    .filter((node) => node.type === "text");

  for (const candidate of candidates) {
    if (links.length >= maxLinks) break;

    for (const node of textNodes) {
      if ($(node).parents("a, code, pre").length > 0) continue;
      const value = $(node).text();
      const match = findAnchor(value, candidate.anchors);
      if (!match) continue;

      const before = value.slice(0, match.index);
      const anchor = value.slice(match.index, match.index + match.length);
      const after = value.slice(match.index + match.length);
      const replacement = $("<span></span>");
      replacement.append(documentText($, before));
      replacement.append(
        $("<a></a>")
          .attr("href", candidate.href)
          .attr("data-internal-link", "true")
          .text(anchor),
      );
      replacement.append(documentText($, after));
      $(node).replaceWith(replacement.contents());
      links.push({
        anchor,
        href: candidate.href,
        postId: candidate.postId,
      });
      break;
    }
  }

  return { html: $.root().html() || "", links };
}

function documentText(
  $: cheerio.CheerioAPI,
  value: string,
) {
  return $("<span></span>").text(value).contents();
}

export function validateInternalLinks(
  html: string,
  candidates: InternalLinkCandidate[],
): boolean {
  const allowed = new Map(
    candidates.flatMap((candidate) =>
      candidate.anchors.map((anchor) => [
        `${normalize(anchor)}|${candidate.href}`,
        true,
      ]),
    ),
  );
  const $ = cheerio.load(html, null, false);

  return $("a[data-internal-link='true']")
    .toArray()
    .every((link) =>
      allowed.has(`${normalize($(link).text())}|${$(link).attr("href") || ""}`),
    );
}
