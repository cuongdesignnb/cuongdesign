"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: Record<string, string>) {
  try {
    const promises = Object.entries(data).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(promises);
    
    // Clear and refresh route caches sitewide
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi cập nhật cài đặt:", error);
    return { success: false, error: error.message };
  }
}
