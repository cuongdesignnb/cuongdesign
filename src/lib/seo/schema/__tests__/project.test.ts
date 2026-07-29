import test from "node:test";
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
