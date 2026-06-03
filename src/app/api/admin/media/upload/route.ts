import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file tải lên" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to WebP using Sharp
    const processedBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // Compress to 80% WebP quality
      .toBuffer();

    // Get image metadata (width/height)
    const metadata = await sharp(processedBuffer).metadata();

    // Create unique filename
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "") // Remove original extension
      .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with hyphen
      .toLowerCase();
    const filename = `${Date.now()}-${cleanName}.webp`;

    // Define upload paths
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure uploads folder exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    
    // Write buffer to file system
    await fs.writeFile(filePath, processedBuffer);

    // Save to Database
    const mediaUrl = `/uploads/${filename}`;
    const media = await prisma.media.create({
      data: {
        name: file.name,
        url: mediaUrl,
        size: processedBuffer.length,
        width: metadata.width || null,
        height: metadata.height || null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi upload media:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý hình ảnh: " + error.message },
      { status: 500 }
    );
  }
}
