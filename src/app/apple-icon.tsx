import { ImageResponse } from "next/og";
import { LOGO_A_PATH, LOGO_NAVY, LOGO_RED } from "@/components/LogoMark";

// Home-screen icon for phones (iOS ignores SVG here, so this is a PNG).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        <svg width="132" height="132" viewBox="0 0 100 100">
          <path d={LOGO_A_PATH} fill={LOGO_NAVY} />
          <circle cx="50" cy="43" r="6" fill={LOGO_RED} />
        </svg>
      </div>
    ),
    size,
  );
}
