import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(mediaList);
  } catch (error: any) {
    console.error("Lỗi lấy danh sách media:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách hình ảnh" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ID hình ảnh cần xóa" },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Hình ảnh không tồn tại trong hệ thống" },
        { status: 404 }
      );
    }

    // Try deleting from local storage first
    try {
      const filePath = path.join(process.cwd(), "public", media.url);
      await fs.unlink(filePath);
    } catch (fsError) {
      console.warn("Không tìm thấy file trên ổ đĩa, bỏ qua và tiến hành xóa trong DB:", fsError);
    }

    // Delete from DB
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa hình ảnh thành công" });
  } catch (error: any) {
    console.error("Lỗi xóa media:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa hình ảnh: " + error.message },
      { status: 500 }
    );
  }
}
