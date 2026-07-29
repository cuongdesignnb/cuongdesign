import { z } from "zod";
import { globalContentDefaults } from "../defaults/global";
import { homeContentDefaults } from "../defaults/home";
import {
  aboutContentDefaults,
  blogContentDefaults,
  contactContentDefaults,
  footerContentDefaults,
  processContentDefaults,
  productsContentDefaults,
  projectsContentDefaults,
  reviewsContentDefaults,
  servicesContentDefaults,
  skillsContentDefaults,
  systemCopyDefaults,
} from "../defaults/pages";

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

function schemaFromDefault(value: unknown): z.ZodType<unknown> {
  if (typeof value === "string") return z.string();
  if (typeof value === "number") return z.number();
  if (typeof value === "boolean") return z.boolean();
  if (value === null) return z.null();

  if (Array.isArray(value)) {
    return z.array(value.length > 0 ? schemaFromDefault(value[0]) : jsonValueSchema);
  }

  if (value && typeof value === "object") {
    return z.object(
      Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, schemaFromDefault(child)]),
      ),
    );
  }

  return jsonValueSchema;
}

export const globalContentSchema = schemaFromDefault(globalContentDefaults);
export const homeContentSchema = schemaFromDefault(homeContentDefaults);
export const aboutContentSchema = schemaFromDefault(aboutContentDefaults);
export const servicesContentSchema = schemaFromDefault(servicesContentDefaults);
export const processContentSchema = schemaFromDefault(processContentDefaults);
export const skillsContentSchema = schemaFromDefault(skillsContentDefaults);
export const projectsContentSchema = schemaFromDefault(projectsContentDefaults);
export const productsContentSchema = schemaFromDefault(productsContentDefaults);
export const blogContentSchema = schemaFromDefault(blogContentDefaults);
export const reviewsContentSchema = schemaFromDefault(reviewsContentDefaults);
export const contactContentSchema = schemaFromDefault(contactContentDefaults);
export const footerContentSchema = schemaFromDefault(footerContentDefaults);
export const systemCopySchema = schemaFromDefault(systemCopyDefaults);

const titledItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
});

export const serviceContentSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  shortDescription: z.string().min(1),
  heroContent: z.string().min(1),
  iconKey: z.string().nullable().optional(),
  colorKey: z.enum(["pink", "purple", "blue", "emerald", "amber", "cyan", "violet"]).nullable().optional(),
  coverMediaId: z.string().nullable().optional(),
  priceText: z.string().nullable().optional(),
  durationText: z.string().nullable().optional(),
  features: z.array(titledItemSchema),
  process: z.array(titledItemSchema.extend({ step: z.coerce.number().int().positive() })),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })),
  ctaText: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
});
