import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PDFly by Murtuja - Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
          background: "linear-gradient(135deg, #05040e 0%, #0f0d1a 50%, #1a1040 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Purple glow orb */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.15)",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(79, 70, 229, 0.15)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.4)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a1 1 0 0 0 1 1h3" />
            <path d="M10 13H8" />
            <path d="M16 17H8" />
            <path d="M14 9H8" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            marginBottom: 16,
            letterSpacing: -1,
          }}
        >
          PDFly
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Every PDF tool you&apos;ll ever need - free, fast, and private.
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.35)",
          }}
        >
          pdfly.murtuja.in - by Murtuja
        </div>
      </div>
    ),
    { ...size }
  );
}
