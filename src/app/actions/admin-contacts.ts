"use server";

import { prisma } from "@/lib/db";

export async function getContacts() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: contacts };
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return { success: false, error: error.message };
  }
}

export async function markContactProcessed(id: string) {
  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: { isProcessed: true },
    });
    return { success: true, data: contact };
  } catch (error: any) {
    console.error("Error marking contact as processed:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteContact(id: string) {
  try {
    await prisma.contact.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    return { success: false, error: error.message };
  }
}
