"use server";

import { prisma } from "@/lib/db";

export async function createTestimonial(data: {
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating: number;
  quote: string;
  order?: number;
}) {
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role,
        company: data.company || null,
        avatar: data.avatar || "",
        rating: data.rating,
        quote: data.quote,
        order: data.order || 0,
        isPublished: true,
      },
    });
    return { success: true, data: testimonial };
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return { success: false, error: error.message };
  }
}

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, data: testimonials };
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTestimonialPublish(id: string) {
  try {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return { success: false, error: "Testimonial not found" };
    }
    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isPublished: !testimonial.isPublished },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error toggling testimonial publish:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTestimonial(
  id: string,
  data: {
    name?: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
    quote?: string;
    order?: number;
  }
) {
  try {
    const updated = await prisma.testimonial.update({
      where: { id },
      data,
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await prisma.testimonial.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return { success: false, error: error.message };
  }
}
