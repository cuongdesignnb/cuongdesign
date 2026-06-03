import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "Cuong Design - Sản phẩm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatPrice(price: number, salePrice: number | null): string {
  const displayPrice = salePrice !== null ? salePrice : price;
  if (displayPrice === 0) return "Free";
  return new Intl.NumberFormat("vi-VN").format(displayPrice) + "đ";
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Cuong Design - Sản phẩm";
  let typeBadge = "Sản phẩm số";
  let priceDisplay = "";
  let hasProduct = false;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (product) {
      title = product.title;
      typeBadge = product.type;
      priceDisplay = formatPrice(product.price, product.salePrice);
      hasProduct = true;
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

        {/* Top section: brand + type badge */}
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

          {/* Type badge */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#a855f7",
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              background: "rgba(168, 85, 247, 0.1)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "flex",
            }}
          >
            {typeBadge}
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

        {/* Bottom section: price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {hasProduct && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.4)",
                  display: "flex",
                }}
              >
                Giá:
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: priceDisplay === "Free" ? "#34d399" : "#ec4899",
                  display: "flex",
                }}
              >
                {priceDisplay}
              </div>
            </div>
          )}

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
