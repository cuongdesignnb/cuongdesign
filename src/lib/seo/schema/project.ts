import type { ProjectSchemaKind } from "@prisma/client";
import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

const projectTypes: Record<ProjectSchemaKind, string> = {
  CREATIVE_WORK: "CreativeWork",
  SOFTWARE_SOURCE_CODE: "SoftwareSourceCode",
  WEB_SITE: "WebSite",
  WEB_APPLICATION: "SoftwareApplication",
};

export function buildProjectSchema(input: {
  slug: string;
  path?: string;
  title: string;
  description: string;
  image: string;
  projectType: ProjectSchemaKind;
  techStack: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}) {
  const path = input.path || `/du-an/${input.slug}`;
  return compact({
    "@context": "https://schema.org",
    "@type": projectTypes[input.projectType],
    "@id": schemaIds.entity(path, "project"),
    url: absoluteUrl(path),
    name: input.title,
    description: plainText(input.description),
    image: absoluteUrl(input.image),
    creator: { "@id": schemaIds.person() },
    dateCreated: input.createdAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    datePublished: input.completedAt?.toISOString(),
    keywords: input.techStack,
    programmingLanguage:
      input.projectType === "SOFTWARE_SOURCE_CODE" ? input.techStack : undefined,
    codeRepository: input.githubUrl,
    workExample: input.demoUrl,
  });
}
