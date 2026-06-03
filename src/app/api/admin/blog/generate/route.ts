import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// Helper to slugify title
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  let activeTaskId = "";
  try {
    const { searchParams } = new URL(request.url);
    const manualTaskId = searchParams.get("taskId");

    // 1. Fetch Task
    let task = null;
    if (manualTaskId) {
      task = await prisma.aiTask.findUnique({
        where: { id: manualTaskId },
      });
    } else {
      task = await prisma.aiTask.findFirst({
        where: {
          status: "PENDING",
          scheduleTime: { lte: new Date() },
        },
        orderBy: { scheduleTime: "asc" },
      });
    }

    if (!task) {
      return NextResponse.json({ message: "Không có tác vụ nào trong hàng chờ cần xử lý" }, { status: 200 });
    }

    activeTaskId = task.id;

    // Update status to generating text
    await prisma.aiTask.update({
      where: { id: task.id },
      data: { status: "GENERATING_TEXT" },
    });

    // 2. Load API Keys from settings or env
    const openAiKeySetting = await prisma.setting.findUnique({ where: { key: "openai_api_key" } });
    const apiKey = openAiKeySetting?.value || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("Chưa cấu hình OpenAI API Key trong cài đặt hệ thống.");
    }

    // 3. Generate Blog Content using GPT-4o
    const systemPrompt = `
Bạn là chuyên gia Content SEO hàng đầu. Viết bài viết blog dài tối thiểu 1500 từ chuyên sâu.
Hãy trả về một chuỗi JSON hợp lệ chứa các thuộc tính sau, KHÔNG ĐƯỢC CHỨA markdown bao quanh JSON hay bất kỳ văn bản nào khác ngoài JSON:
{
  "title": "Tiêu đề bài viết dưới 60 ký tự",
  "metaDescription": "Mô tả meta dưới 150 ký tự",
  "content": "Nội dung bài viết định dạng HTML sạch (chỉ dùng thẻ H2, H3, p, strong, ul, li, pre, code)",
  "keywords": ["từ khóa 1", "từ khóa 2"]
}
`;

    const userPrompt = `Hãy viết một bài viết chuẩn SEO tối đa cho từ khóa chính: "${task.keyword}". Chủ đề viết cần liên quan đến Thiết kế website, Lập trình hoặc UI/UX Design.`;

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
      throw new Error(`OpenAI Text API error: ${gptRes.status} - ${errorText}`);
    }

    const textData = await gptRes.json();
    const articleJson = JSON.parse(textData.choices[0].message.content);

    // Update status to generating image
    await prisma.aiTask.update({
      where: { id: task.id },
      data: { status: "GENERATING_IMAGE" },
    });

    // 4. Generate Image using DALL-E 3
    let imageUrl = "/images/og-image.jpg"; // Fallback image
    try {
      const imagePrompt = `Minimalist premium 3D flat tech graphic illustration for an article titled "${articleJson.title}", dark premium space mode style, neon pink and purple glow highlights, cyberpunk developer aesthetic.`;
      
      const dallERes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        }),
      });

      if (dallERes.ok) {
        const imageData = await dallERes.json();
        const temporaryImageUrl = imageData.data[0].url;

        // Download image buffer
        const imageDownloadRes = await fetch(temporaryImageUrl);
        const imgBytes = await imageDownloadRes.arrayBuffer();
        const imgBuffer = Buffer.from(imgBytes);

        // Compress and convert to WebP using Sharp
        const compressedWebp = await sharp(imgBuffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Save file locally
        const filename = `${Date.now()}-${slugify(articleJson.title)}.webp`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "blog");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, compressedWebp);

        imageUrl = `/uploads/blog/${filename}`;
        
        // Save uploaded file into Media library too
        await prisma.media.create({
          data: {
            name: `${articleJson.title} Cover`,
            url: imageUrl,
            size: compressedWebp.length,
          },
        });
      }
    } catch (imgErr) {
      console.warn("Lỗi sinh hình ảnh AI (Sử dụng ảnh fallback mặc định):", imgErr);
    }

    // 5. Create Blog Post in database
    const slug = slugify(articleJson.title);
    const post = await prisma.post.create({
      data: {
        title: articleJson.title,
        slug,
        excerpt: articleJson.metaDescription,
        content: articleJson.content,
        coverImage: imageUrl,
        status: "PUBLISHED",
        publishedAt: new Date(),
        categoryId: task.categoryId || null,
        seoTitle: articleJson.title,
        seoDescription: articleJson.metaDescription,
        seoKeywords: articleJson.keywords || [task.keyword],
        schemaMarkup: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": articleJson.title,
          "description": articleJson.metaDescription,
          "image": imageUrl,
        },
      },
    });

    // Mark task as completed
    await prisma.aiTask.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        generatedPostId: post.id,
      },
    });

    return NextResponse.json({ success: true, postId: post.id }, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi AI Auto Blog:", error);
    
    // Mark task as failed
    if (activeTaskId) {
      await prisma.aiTask.update({
        where: { id: activeTaskId },
        data: {
          status: "FAILED",
          errorMessage: error.message,
        },
      });
    }

    return NextResponse.json(
      { error: "Đã xảy ra lỗi sinh bài viết tự động: " + error.message },
      { status: 500 }
    );
  }
}
