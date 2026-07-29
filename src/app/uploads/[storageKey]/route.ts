import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

const STORAGE_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/;
const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storageKey: string }> },
) {
  const { storageKey } = await params;
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadDirectory, storageKey);
  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(file.length),
        "Content-Type": MIME_TYPES[path.extname(storageKey).toLowerCase()] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Media not found." }, { status: 404 });
    }
    console.error("Error serving media:", error);
    return NextResponse.json({ error: "Unable to load media." }, { status: 500 });
  }
}
