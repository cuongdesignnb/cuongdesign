import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { promises as fs } from "fs";
import sharp from "sharp";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { resolveMediaStoragePath } from "@/lib/media/storage";
import { getMediaUsage } from "@/lib/media/usage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 8000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

function safeBaseName(name: string) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "image"
  );
}

function uploadsPath(storageKey: string) {
  return resolveMediaStoragePath(storageKey);
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const mediaList = await prisma.media.findMany({
      where: {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    const withUsage = await Promise.all(
      mediaList.map(async (media) => ({
        ...media,
        usage: await getMediaUsage(media.id, media.url),
      })),
    );
    return NextResponse.json(withUsage);
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error("Error loading media:", error);
    return NextResponse.json({ error: "Không thể tải thư viện hình ảnh." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .concat(formData.getAll("file"))
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Chưa chọn hình ảnh." }, { status: 400 });
    }

    const uploaded = [];
    for (const file of files) {
      if (!ALLOWED_MIME.has(file.type) || file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} không hợp lệ hoặc vượt quá 10 MB.` },
          { status: 400 },
        );
      }

      const source = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(source).metadata();
      if (
        !metadata.format ||
        !ALLOWED_FORMATS.has(metadata.format) ||
        !metadata.width ||
        !metadata.height ||
        metadata.width > MAX_DIMENSION ||
        metadata.height > MAX_DIMENSION
      ) {
        return NextResponse.json(
          { error: `Kích thước hoặc định dạng thực của ${file.name} không hợp lệ.` },
          { status: 400 },
        );
      }

      const processed = await sharp(source).rotate().webp({ quality: 84 }).toBuffer();
      const processedMetadata = await sharp(processed).metadata();
      const storageKey = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeBaseName(file.name)}.webp`;
      const { uploadDirectory, filePath } = uploadsPath(storageKey);
      await fs.mkdir(uploadDirectory, { recursive: true });
      await fs.writeFile(filePath, processed);

      const media = await prisma.media.create({
        data: {
          name: file.name,
          url: `/uploads/${storageKey}`,
          storageKey,
          size: processed.length,
          width: processedMetadata.width,
          height: processedMetadata.height,
          mimeType: "image/webp",
          alt: safeBaseName(file.name).replace(/-/g, " "),
          createdById: admin.id,
        },
      });
      uploaded.push(media);
    }

    return NextResponse.json(files.length === 1 ? uploaded[0] : uploaded, { status: 201 });
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error("Error uploading media:", error);
    const filesystemError = error as NodeJS.ErrnoException;
    if (filesystemError.code === "EACCES" || filesystemError.code === "EROFS") {
      return NextResponse.json(
        { error: "Thư mục upload chưa có quyền ghi." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Không thể xử lý hình ảnh." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const input = (await request.json()) as {
      id?: string;
      name?: string;
      alt?: string;
      caption?: string;
    };
    if (!input.id) {
      return NextResponse.json({ error: "Media ID is required." }, { status: 400 });
    }
    const media = await prisma.media.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        alt: input.alt?.trim() || null,
        caption: input.caption?.trim() || null,
      },
    });
    return NextResponse.json(media);
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error("Error updating media:", error);
    return NextResponse.json({ error: "Không thể cập nhật hình ảnh." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Media ID is required." }, { status: 400 });

    const media = await prisma.media.findFirst({ where: { id, deletedAt: null } });
    if (!media) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const usage = await getMediaUsage(media.id, media.url);
    if (usage.count > 0) {
      return NextResponse.json({ error: "Hình ảnh đang được sử dụng.", usage }, { status: 409 });
    }

    if (media.storageKey) {
      const { filePath } = uploadsPath(media.storageKey);
      await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }

    await prisma.media.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Không thể xóa hình ảnh." }, { status: 500 });
  }
}
