import { NextRequest, NextResponse } from "next/server";

// Moves visitors from the old address to the main domain, and carries their
// "one score per phone" identity across so nobody loses a saved rank or gets
// to enter a second score.
//
// Off by default. Turn on in Vercel only after the main domain is working:
//   REDIRECT_TO_PRIMARY=1
//   NEXT_PUBLIC_SITE_URL=https://jkaspirant.in
// LEGACY_HOST can override the old address (default jkaspirants.vercel.app).
// Preview deployments use other *.vercel.app names and are left alone.

const DEVICE_COOKIE = "jka_did";
const HANDOFF_PARAM = "_d";
const DEVICE_RE = /^[a-zA-Z0-9-]{16,64}$/;

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl;

  // Arriving on any host with a handed-over id: keep it as the cookie, then clean the address bar.
  const handed = url.searchParams.get(HANDOFF_PARAM);
  if (handed !== null) {
    const clean = url.clone();
    clean.searchParams.delete(HANDOFF_PARAM);
    const res = NextResponse.redirect(clean, 307);
    if (DEVICE_RE.test(handed) && !req.cookies.get(DEVICE_COOKIE)) {
      res.cookies.set(DEVICE_COOKIE, handed, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    return res;
  }

  if (process.env.REDIRECT_TO_PRIMARY !== "1") return NextResponse.next();
  const legacyHost = (process.env.LEGACY_HOST || "jkaspirants.vercel.app").toLowerCase();
  let primary: URL;
  try {
    primary = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
  } catch {
    return NextResponse.next();
  }
  if (host !== legacyHost || primary.host.toLowerCase() === legacyHost) return NextResponse.next();

  const target = new URL(url.pathname + url.search, primary);
  const device = req.cookies.get(DEVICE_COOKIE)?.value;
  if (device && DEVICE_RE.test(device)) target.searchParams.set(HANDOFF_PARAM, device);
  // Temporary redirect while the id travels with it; search engines follow the canonical tags.
  return NextResponse.redirect(target, device ? 307 : 308);
}

export const config = {
  // Pages only. API calls from tabs still open on the old address keep working.
  matcher: ["/((?!api|_next|notices|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]+$).*)"],
};
