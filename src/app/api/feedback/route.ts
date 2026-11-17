import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";

// Visitor feedback. Stored in Supabase `feedback` (service role only) so the
// owner's Claude Code sessions can read and act on it.
//
// Spam: a hidden "website" field bots fill in, and a per-network daily cap.

export const dynamic = "force-dynamic";
const KINDS = ["wrong_info", "feature", "complaint", "other"] as const;
const MAX_PER_NETWORK_PER_DAY = 8;

function hashIp(req: NextRequest) {
  let ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (ip.includes(":")) ip = ip.split(":").slice(0, 4).join(":");
  const salt = process.env.RANK_SALT || process.env.VERCEL_REVALIDATION_SECRET || "jkaspirant";
  return createHash("sha256").update(`${salt}:feedback:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  // Bots fill every field; people never see this one. Pretend success.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  // The contact form no longer asks for a type; older clients may still send one.
  const kind = KINDS.includes(String(body.kind) as (typeof KINDS)[number]) ? String(body.kind) : "other";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 120) : "";
  const page = typeof body.page === "string" ? body.page.slice(0, 300) : "";
  if (message.length < 5) return NextResponse.json({ error: "Please write a little more" }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Please keep it under 2,000 characters" }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json({ error: "Feedback isn't available right now" }, { status: 503 });

  const supabase = createServerClient();
  const ipHash = hashIp(req);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("feedback").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_NETWORK_PER_DAY) return NextResponse.json({ error: "Thanks, we've got a lot from you today. Please try again tomorrow." }, { status: 429 });

  const { error } = await supabase.from("feedback").insert({ kind, message, contact: contact || null, page: page || null, ip_hash: ipHash });
  if (error) {
    console.error("feedback insert", error);
    return NextResponse.json({ error: "Couldn't send. Please try again." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
