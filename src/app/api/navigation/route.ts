import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [
        { parentId: "asc" },
        { order: "asc" }
      ],
      include: {
        children: {
          orderBy: { order: "asc" }
        }
      }
    });

    // Filter to return only root-level items (which have parentId = null)
    // Prisma include: { children } automatically brings their nested items
    const rootItems = items.filter(item => !item.parentId);
    
    return NextResponse.json({ success: true, items: rootItems });
  } catch (error: any) {
    console.error("Lỗi API lấy Menu:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
