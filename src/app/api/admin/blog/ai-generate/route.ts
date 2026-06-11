import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface AiGenerateRequest {
  title: string;
  categoryId?: string;
  generateImage?: boolean;
}

interface GeneratedContent {
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiGenerateRequest;
    const { title, categoryId, generateImage } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề bài viết không được để trống." },
        { status: 400 }
      );
    }

    // 1. Load API key from DB Setting or env
    const openAiKeySetting = await prisma.setting.findUnique({
      where: { key: "openai_api_key" },
    });
    const apiKey = openAiKeySetting?.value || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Chưa cấu hình OpenAI API Key. Vui lòng thêm key trong Cài đặt hệ thống hoặc biến môi trường OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    // 2. Generate content using GPT-4.1-mini
    const systemPrompt = `Bạn là chuyên gia Content SEO hàng đầu Việt Nam. Hãy viết bài viết blog chuyên sâu tối thiểu 1500 từ.
Trả về một chuỗi JSON hợp lệ với cấu trúc sau (KHÔNG bao quanh bằng markdown hay text nào khác):
{
  "content": "Nội dung bài viết định dạng HTML sạch (dùng thẻ h2, h3, h4, p, strong, em, ul, ol, li, pre, code, blockquote). Không dùng h1. Nội dung phải tối thiểu 1500 từ, chuyên sâu, có giá trị SEO cao.",
  "excerpt": "Mô tả ngắn gọn hấp dẫn dưới 160 ký tự để hiển thị trong danh sách bài viết",
  "seoTitle": "Tiêu đề SEO tối ưu dưới 60 ký tự",
  "seoDescription": "Mô tả meta SEO dưới 155 ký tự, chứa từ khóa chính",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4", "từ khóa 5"]
}`;

    const userPrompt = `Viết một bài viết chuẩn SEO cho tiêu đề: "${title.trim()}"`;

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!gptRes.ok) {
      const errorText = await gptRes.text();
      console.error("OpenAI Text API error:", gptRes.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi từ OpenAI Text API (${gptRes.status}): ${errorText}`,
        },
        { status: 500 }
      );
    }

    const textData = await gptRes.json();
    const rawContent = textData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: "OpenAI không trả về nội dung." },
        { status: 500 }
      );
    }

    let generated: GeneratedContent;
    try {
      generated = JSON.parse(rawContent) as GeneratedContent;
    } catch {
      console.error("Failed to parse GPT response JSON:", rawContent);
      return NextResponse.json(
        {
          success: false,
          error: "Không thể phân tích phản hồi JSON từ OpenAI.",
        },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!generated.content || !generated.excerpt || !generated.seoTitle) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Phản hồi từ OpenAI thiếu trường bắt buộc (content, excerpt, hoặc seoTitle).",
        },
        { status: 500 }
      );
    }

    // 3. Generate cover image if requested
    let coverImage: string | null = null;

    if (generateImage) {
      try {
        const imagePrompt = `Premium tech blog header image for an article titled "${title.trim()}". Minimalist dark design with subtle neon pink and purple glow accents. Abstract geometric shapes, clean modern aesthetic. No text or words in the image.`;

        const imageRes = await fetch(
          "https://api.openai.com/v1/images/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: imagePrompt,
              n: 1,
              size: "1536x1024",
            }),
          }
        );

        if (imageRes.ok) {
          const imageData = await imageRes.json();

          // gpt-image-1 returns base64 data by default
          const imageB64: string | undefined =
            imageData.data?.[0]?.b64_json;
          const imageUrl: string | undefined =
            imageData.data?.[0]?.url;

          let imgBuffer: Buffer;

          if (imageB64) {
            imgBuffer = Buffer.from(imageB64, "base64");
          } else if (imageUrl) {
            // Fallback: download from URL
            const downloadRes = await fetch(imageUrl);
            const bytes = await downloadRes.arrayBuffer();
            imgBuffer = Buffer.from(bytes);
          } else {
            throw new Error("No image data returned from API");
          }

          // Convert to WebP using Sharp
          const compressedWebp = await sharp(imgBuffer)
            .webp({ quality: 80 })
            .toBuffer();

          // Save file locally
          const filename = `${Date.now()}-${slugify(title.trim())}.webp`;
          const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "blog"
          );
          await fs.mkdir(uploadDir, { recursive: true });

          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, compressedWebp);

          coverImage = `/uploads/blog/${filename}`;

          // Get dimensions for Media record
          const metadata = await sharp(compressedWebp).metadata();

          // Create Media record
          await prisma.media.create({
            data: {
              name: `${title.trim()} - Cover`,
              url: coverImage,
              size: compressedWebp.length,
              width: metadata.width || null,
              height: metadata.height || null,
            },
          });
        } else {
          const imgError = await imageRes.text();
          console.warn(
            "Image generation failed (non-blocking):",
            imageRes.status,
            imgError
          );
        }
      } catch (imgErr) {
        console.warn(
          "Lỗi sinh hình ảnh AI (tiếp tục trả kết quả không có ảnh):",
          imgErr
        );
      }
    }

    // 4. Return generated content
    return NextResponse.json({
      success: true,
      content: generated.content,
      excerpt: generated.excerpt,
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      seoKeywords: generated.keywords || [],
      coverImage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("AI Generate API error:", error);
    return NextResponse.json(
      { success: false, error: `Đã xảy ra lỗi: ${message}` },
      { status: 500 }
    );
  }
}
