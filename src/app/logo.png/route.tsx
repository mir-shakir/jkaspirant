import { ImageResponse } from "next/og";
import { LOGO_A_PATH, LOGO_NAVY, LOGO_RED } from "@/components/LogoMark";

// Square logo for search engines (Organization structured data).
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        <svg width="400" height="400" viewBox="0 0 100 100">
          <path d={LOGO_A_PATH} fill={LOGO_NAVY} />
          <circle cx="50" cy="43" r="6" fill={LOGO_RED} />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
