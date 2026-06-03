import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "Cuong Design - Dự án";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Cuong Design - Dự án";
  let category = "Dự án";
  let techStack: string[] = [];

  try {
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (project) {
      title = project.title;
      category = project.category;
      techStack = project.techStack.slice(0, 6);
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background:
            "linear-gradient(135deg, #030014 0%, #1a0533 50%, #0d0221 100%)",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background:
              "linear-gradient(90deg, #ec4899, #a855f7, #6366f1)",
            display: "flex",
          }}
        />

        {/* Top section: brand + category badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.5)",
              letterSpacing: "-0.5px",
              display: "flex",
            }}
          >
            CUONG DESIGN
          </div>

          {/* Category badge */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#ec4899",
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              background: "rgba(236, 72, 153, 0.1)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "flex",
            }}
          >
            {category}
          </div>
        </div>

        {/* Middle section: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 44 : 56,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              display: "flex",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Pink accent line */}
          <div
            style={{
              width: "120px",
              height: "4px",
              background: "linear-gradient(90deg, #ec4899, #a855f7)",
              borderRadius: "4px",
              display: "flex",
            }}
          />
        </div>

        {/* Bottom section: tech stack tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {techStack.map((tech) => (
            <div
              key={tech}
              style={{
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.7)",
                padding: "5px 14px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                display: "flex",
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
