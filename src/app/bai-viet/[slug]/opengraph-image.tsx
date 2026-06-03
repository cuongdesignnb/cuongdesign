import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "Cuong Design - Bài viết";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Cuong Design - Bài viết";
  let authorName = "Cường Design";
  let publishDate = "";

  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (post) {
      title = post.title;
      authorName = "Cường Design";
      const dateObj = post.publishedAt || post.createdAt;
      publishDate = new Date(dateObj).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
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

        {/* Top section: brand + article badge */}
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

          {/* Article badge */}
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
            BÀI VIẾT
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
              fontSize: title.length > 50 ? 40 : title.length > 30 ? 48 : 56,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              display: "flex",
              maxWidth: "1000px",
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

        {/* Bottom section: author + date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Author avatar placeholder circle */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              C
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.85)",
                  display: "flex",
                }}
              >
                {authorName}
              </div>
              {publishDate && (
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.4)",
                    display: "flex",
                  }}
                >
                  {publishDate}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.3)",
              display: "flex",
            }}
          >
            cuongdesign.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
