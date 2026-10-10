import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildProjectSchema } from "../project";
import { assertSchema } from "./helpers";

test("Project schema follows project type", () =>
  assertSchema(
    buildProjectSchema({
      slug: "web-app",
      title: "Web App",
      description: "Ứng dụng",
      image: "/images/og-image.jpg",
      projectType: "WEB_APPLICATION",
      techStack: ["Next.js"],
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    }),
    "SoftwareApplication",
  ));

const project = {
  slug: "date-fixture", title: "Fixture", description: "Test", image: "/fixture.webp",
  projectType: "CREATIVE_WORK" as const, techStack: [],
  createdAt: new Date("2026-08-02T00:00:00.000Z"), updatedAt: new Date("2026-10-10T00:00:00.000Z"),
};

test("project datePublished uses only supplied publication timestamp, not completion or creation", () => {
  const publishedAt = new Date("2026-09-30T23:45:00.000Z");
  for (const completedAt of [null, new Date("2001-05-14"), new Date("2026-05-15")]) {
    const input = { ...project, publishedAt, completedAt };
    const schema = buildProjectSchema(input);
    assert.equal(schema.datePublished, publishedAt.toISOString());
    assert.equal(schema.dateCreated, project.createdAt.toISOString());
    assert.equal(schema.dateModified, project.updatedAt.toISOString());
  }
});

test("unknown/invalid publication date omits datePublished without fallback", () => {
  for (const publishedAt of [undefined, null, new Date(NaN)]) {
    const schema = buildProjectSchema({ ...project, publishedAt });
    assert.equal(Object.hasOwn(schema, "datePublished"), false);
    assert.equal(Object.hasOwn(schema, "uploadDate"), false);
  }
});

test("public project passes publishedAt to its schema, with original cache invalidation intact", () => {
  const page = readFileSync("src/app/du-an/[slug]/page.tsx", "utf8");
  const action = readFileSync("src/app/actions/projects.ts", "utf8");
  assert.match(page, /publishedAt: project.publishedAt/);
  assert.doesNotMatch(page, /completedAt: project.completedAt/);
  assert.match(action, /revalidatePath\(`\/du-an\/\$\{project.slug\}`\)/);
});
