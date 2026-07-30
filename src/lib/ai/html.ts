import * as cheerio from "cheerio";
import type { GeneratedImage } from "./types";

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function ensureImageAlt(html: string, fallbackAlt: string): string {
  const $ = cheerio.load(html, null, false);
  const fallback = fallbackAlt.trim() || "Hình minh họa bài viết";

  $("img").each((_index, element) => {
    const image = $(element);
    const alt = image.attr("alt")?.trim();
    image.attr("alt", alt || fallback);
    image.attr("loading", image.attr("loading") || "lazy");
  });

  return $.root().html() || "";
}

export function insertInlineImages(
  html: string,
  images: Array<GeneratedImage & { afterHeading?: string }>,
): string {
  if (images.length === 0) return html;

  const $ = cheerio.load(html, null, false);
  const headings = $("h2, h3").toArray();

  images.forEach((image, index) => {
    const requestedHeading = normalized(image.afterHeading || "");
    const fallbackHeading = headings.length
      ? headings[Math.min(index, headings.length - 1)]
      : undefined;
    const target =
      headings.find((heading) =>
        requestedHeading
          ? normalized($(heading).text()).includes(requestedHeading)
          : false,
      ) || fallbackHeading;

    const figure = $("<figure></figure>").addClass("article-image");
    const imageElement = $("<img>")
      .attr("src", image.url)
      .attr("alt", image.alt)
      .attr("loading", "lazy");
    if (image.width) imageElement.attr("width", String(image.width));
    if (image.height) imageElement.attr("height", String(image.height));
    figure.append(imageElement);
    figure.append(
      $("<figcaption></figcaption>").text(image.caption || image.alt),
    );

    if (target) {
      $(target).after(figure);
    } else {
      $.root().append(figure);
    }
  });

  return $.root().html() || "";
}

export function countImagesMissingAlt(html: string): number {
  const $ = cheerio.load(html, null, false);
  return $("img").toArray().filter((image) => !$(image).attr("alt")?.trim()).length;
}
