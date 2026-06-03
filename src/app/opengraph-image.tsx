import { ImageResponse } from "next/og";

export const alt = "Cuong Design — Freelancer Developer & Thiết kế UI/UX Website";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030014 0%, #1a0533 50%, #0d0221 100%)",
          position: "relative",
        }}
      >
        {/* Decorative pink/purple gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #ec4899, #a855f7, #6366f1, #a855f7, #ec4899)",
            display: "flex",
          }}
        />

        {/* Glow effect behind text */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            display: "flex",
            marginBottom: "16px",
          }}
        >
          CUONG DESIGN
        </div>

        {/* Pink accent line */}
        <div
          style={{
            width: "200px",
            height: "4px",
            background: "linear-gradient(90deg, #ec4899, #a855f7)",
            borderRadius: "4px",
            marginBottom: "24px",
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 400,
            display: "flex",
          }}
        >
          Freelancer Developer & Thiết kế UI/UX Website
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #a855f7, #6366f1)",
            display: "flex",
          }}
        />

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "40px",
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.3)",
            display: "flex",
          }}
        >
          cuongdesign.com
        </div>
      </div>
    ),
    { ...size }
  );
}
