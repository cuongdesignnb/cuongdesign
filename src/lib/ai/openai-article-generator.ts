import { prisma } from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import {
  injectInternalLinks,
  rankInternalLinkCandidates,
  validateInternalLinks,
} from "./internal-links";
import { getAiRuntimeConfig } from "./settings";
import type {
  ArticleGenerator,
  GenerateArticleInput,
  GeneratedArticle,
} from "./types";

const WORD_TARGETS = {
  short: "900-1200",
  medium: "1400-1800",
  long: "2000-2600",
} as const;

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    content: { type: "string" },
    coverImageAlt: { type: "string" },
    coverImagePrompt: { type: "string" },
    imagePlans: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          prompt: { type: "string" },
          alt: { type: "string" },
          afterHeading: { type: "string" },
        },
        required: ["prompt", "alt", "afterHeading"],
      },
    },
  },
  required: [
    "title",
    "excerpt",
    "seoTitle",
    "seoDescription",
    "keywords",
    "content",
    "coverImageAlt",
    "coverImagePrompt",
    "imagePlans",
  ],
} as const;

function responseText(payload: unknown): string {
  const data = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (data.output_text) return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "";
}

function cleanStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  return [...new Set(value.map(String).map((item) => item.trim()).filter(Boolean))];
}

function assertGeneratedArticle(value: unknown): Omit<GeneratedArticle, "internalLinks"> {
  const article = value as Partial<GeneratedArticle>;
  const required = [
    article.title,
    article.excerpt,
    article.seoTitle,
    article.seoDescription,
    article.content,
    article.coverImageAlt,
    article.coverImagePrompt,
  ];
  if (required.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error("AI_TEXT_INVALID_RESPONSE");
  }

  const imagePlans = Array.isArray(article.imagePlans)
    ? article.imagePlans
        .filter(
          (item) =>
            item &&
            typeof item.prompt === "string" &&
            typeof item.alt === "string" &&
            item.alt.trim(),
        )
        .map((item) => ({
          prompt: item.prompt.trim(),
          alt: item.alt.trim(),
          afterHeading: String(item.afterHeading || "").trim(),
        }))
    : [];

  return {
    title: article.title!.trim(),
    excerpt: article.excerpt!.trim(),
    seoTitle: article.seoTitle!.trim(),
    seoDescription: article.seoDescription!.trim(),
    keywords: cleanStringArray(article.keywords, []),
    content: article.content!,
    coverImageAlt: article.coverImageAlt!.trim(),
    coverImagePrompt: article.coverImagePrompt!.trim(),
    imagePlans,
  };
}

export class OpenAiArticleGenerator implements ArticleGenerator {
  async generate(input: GenerateArticleInput): Promise<GeneratedArticle> {
    const [config, posts] = await Promise.all([
      getAiRuntimeConfig(),
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          seoKeywords: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 100,
      }),
    ]);

    if (!config.textApiKey) {
      throw new Error("AI_TEXT_API_KEY_MISSING");
    }

    const candidates = rankInternalLinkCandidates(
      posts,
      input.topic,
      input.sharedKeywords,
    );
    const linkPlan = candidates.map((candidate) => ({
      title: candidate.title,
      path: candidate.href,
      allowedAnchors: candidate.anchors.slice(0, 5),
    }));
    const customPrompt = config.writerPrompt.trim()
      ? `\nYêu cầu biên tập riêng:\n${config.writerPrompt.trim()}`
      : "";

    const instructions = `Bạn là biên tập viên SEO tiếng Việt của Cường Design.
Viết nội dung hữu ích, chính xác, tự nhiên và có chiều sâu. Không bịa số liệu, khách hàng hoặc trải nghiệm.
Nội dung HTML chỉ dùng h2, h3, h4, p, strong, em, ul, ol, li, blockquote, code và pre. Không dùng h1.
Không tự tạo thẻ a. Hệ thống sẽ chèn internal link sau khi kiểm tra.
Độ dài mục tiêu: ${WORD_TARGETS[input.length]} từ. Giọng văn: ${input.tone}.
Hãy nhắc tự nhiên 2-4 anchor trong danh sách internal link nếu thật sự liên quan; không nhồi từ khóa.
Mỗi ảnh phải có alt tiếng Việt mô tả đúng nội dung ảnh, không bắt đầu bằng "hình ảnh của".
Tạo đúng hoặc nhiều hơn ${input.imageCount} kế hoạch ảnh nội dung để hệ thống có thể chọn.
Alt ảnh bìa và alt ảnh nội dung phải khác nhau, cụ thể và phù hợp ngữ cảnh.${customPrompt}`;

    const userInput = JSON.stringify({
      topic: input.topic,
      sharedKeywords: input.sharedKeywords,
      internalLinkPlan: linkPlan,
      requestedInlineImages: input.imageCount,
    });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.textApiKey}`,
      },
      body: JSON.stringify({
        model: config.textModel,
        instructions,
        input: userInput,
        max_output_tokens: 16000,
        text: {
          format: {
            type: "json_schema",
            name: "seo_article",
            strict: true,
            schema: ARTICLE_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 600);
      throw new Error(`AI_TEXT_API_ERROR_${response.status}: ${detail}`);
    }

    const raw = responseText(await response.json());
    if (!raw) throw new Error("AI_TEXT_EMPTY_RESPONSE");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("AI_TEXT_INVALID_JSON");
    }

    const article = assertGeneratedArticle(parsed);
    const linked = injectInternalLinks(
      sanitizeRichHtml(article.content),
      candidates,
    );
    if (!validateInternalLinks(linked.html, candidates)) {
      throw new Error("AI_INTERNAL_LINK_VALIDATION_FAILED");
    }

    return {
      ...article,
      keywords: article.keywords.length
        ? article.keywords
        : [input.topic, ...input.sharedKeywords],
      content: linked.html,
      imagePlans: article.imagePlans.slice(0, input.imageCount),
      internalLinks: linked.links,
    };
  }
}
