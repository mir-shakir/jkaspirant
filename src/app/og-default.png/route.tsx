import { ImageResponse } from "next/og";
import { LOGO_A_PATH, LOGO_NAVY, LOGO_RED } from "@/components/LogoMark";

// Default share image (1200x630), referenced as siteConfig.ogImage.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "hsl(40, 33%, 96%)",
          color: "#1c1917",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            <path d={LOGO_A_PATH} fill={LOGO_NAVY} />
            <circle cx="50" cy="43" r="6" fill={LOGO_RED} />
          </svg>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -2 }}>JK Aspirant</div>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#57534e" }}>
          JKSSB exam updates, dates and rank tools
        </div>
        <div style={{ fontSize: 30, marginTop: 56, color: "hsl(8, 68%, 46%)" }}>jkaspirant.in</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
