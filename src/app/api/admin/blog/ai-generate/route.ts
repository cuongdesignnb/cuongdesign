import { NextResponse } from "next/server";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { OpenAiArticleGenerator } from "@/lib/ai/openai-article-generator";
import { OpenAiImageGenerator } from "@/lib/ai/openai-image-generator";
import { AiProviderError } from "@/lib/ai/provider";

interface AiGenerateRequest {
  title: string;
  categoryId?: string;
  generateImage?: boolean;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as AiGenerateRequest;
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề bài viết không được để trống." },
        { status: 400 },
      );
    }

    const article = await new OpenAiArticleGenerator().generate({
      topic: title,
      categoryId: body.categoryId || null,
      tone: "professional",
      length: "medium",
      sharedKeywords: [],
      imageCount: 0,
    });
    let cover = null;
    const warnings: string[] = [];
    if (body.generateImage) {
      try {
        cover = await new OpenAiImageGenerator().generate({
          title: article.title,
          prompt: article.coverImagePrompt,
          alt: article.coverImageAlt,
          caption: article.coverImageAlt,
          kind: "cover",
        });
      } catch (error) {
        warnings.push(
          `Không thể sinh ảnh bìa: ${
            error instanceof Error ? error.message : "UNKNOWN_ERROR"
          }`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      content: article.content,
      excerpt: article.excerpt,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: article.keywords,
      coverImage: cover?.url || null,
      coverImageAlt: cover?.alt || article.coverImageAlt,
      coverImageCaption: cover?.caption || article.coverImageAlt,
      internalLinks: article.internalLinks,
      usage: article.usage || null,
      warnings,
    });
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("AI_EDITOR_GENERATE_FAILED", message);
    if (error instanceof AiProviderError && error.provider === "text") {
      return NextResponse.json(
        {
          success: false,
          error: message,
          providerStatus: error.providerStatus,
        },
        { status: 424 },
      );
    }
    return NextResponse.json(
      { success: false, error: `Không thể sinh bài viết: ${message}` },
      { status: 500 },
    );
  }
}
