import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";
import { getRankExamByKey } from "@/config/rank-predictor";
import { BUCKET_WIDTH, computeScore, validateCounts, type ShareStats } from "@/lib/rank";

// Stores anonymous scores and returns raw counts. The rank estimate itself is
// computed in the browser by predict() in src/lib/rank.ts, so the tool still
// works (on past patterns alone) if this endpoint is unreachable.

export const dynamic = "force-dynamic";

// Mobile carriers in J&K put many users behind one IP, so keep this generous.
const MAX_WRITES_PER_IP_PER_HOUR = 40;

type Db = ReturnType<typeof createServerClient>;

function hashIp(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = process.env.RANK_SALT || process.env.VERCEL_REVALIDATION_SECRET || "jkaspirant";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Short, non-sensitive error reference so failures can be diagnosed from a phone. */
function errRef(e: unknown) {
  if (e && typeof e === "object") {
    const o = e as { code?: string; message?: string };
    if (o.code) return o.code;
    if (o.message) return o.message.slice(0, 80);
  }
  return "unknown";
}

function envRef() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "missing-supabase-url";
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return "missing-service-role-key";
  return null;
}

async function getStats(supabase: Db, examKey: string, score: number, category: string): Promise<ShareStats> {
  const { data, error } = await supabase.rpc("rank_stats", {
    p_exam: examKey,
    p_score: score,
    p_category: category,
    p_cutoff_index: 0,
  });
  if (!error && data) {
    const s = data as ShareStats;
    return { total: s.total, above: s.above, catTotal: s.catTotal, catAbove: s.catAbove, histogram: s.histogram ?? [] };
  }
  console.error("rank_stats rpc failed, using fallback", error);
  return getStatsFallback(supabase, examKey, score, category);
}

/** Same numbers as rank_stats(), from plain table queries (histogram samples the latest 1,000 rows). */
async function getStatsFallback(supabase: Db, examKey: string, score: number, category: string): Promise<ShareStats> {
  const base = () => supabase.from("score_submissions").select("id", { count: "exact", head: true }).eq("exam_key", examKey);
  const [t, a, ct, ca, sample] = await Promise.all([
    base(),
    base().gt("score", score),
    base().eq("category", category),
    base().eq("category", category).gt("score", score),
    supabase.from("score_submissions").select("score").eq("exam_key", examKey).order("updated_at", { ascending: false }).limit(1000),
  ]);
  const firstError = [t, a, ct, ca, sample].find((r) => r.error)?.error;
  if (firstError) throw firstError;

  const buckets = new Map<number, number>();
  for (const row of (sample.data ?? []) as { score: number }[]) {
    const b = Math.floor(Number(row.score) / BUCKET_WIDTH) * BUCKET_WIDTH;
    buckets.set(b, (buckets.get(b) ?? 0) + 1);
  }
  return {
    total: t.count ?? 0,
    above: a.count ?? 0,
    catTotal: ct.count ?? 0,
    catAbove: ca.count ?? 0,
    histogram: Array.from(buckets, ([bucket, count]) => ({ bucket, count })).sort((x, y) => x.bucket - y.bucket),
  };
}

export async function GET(req: NextRequest) {
  const exam = getRankExamByKey(req.nextUrl.searchParams.get("exam") || "");
  if (!exam) return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  const missing = envRef();
  if (missing) return NextResponse.json({ total: 0, histogram: [], ref: missing });
  try {
    const stats = await getStats(createServerClient(), exam.examKey, 0, exam.categories[0]);
    return NextResponse.json(
      { total: stats.total, histogram: stats.histogram, ok: true },
      { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (e) {
    console.error("rank api GET", e);
    return NextResponse.json({ total: 0, histogram: [], ref: errRef(e) });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const exam = getRankExamByKey(String(body.exam || ""));
  if (!exam) return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  if (!exam.isOpen) return NextResponse.json({ error: "Submissions closed" }, { status: 403 });

  const { correct, wrong } = body;
  const invalid = validateCounts(exam, correct, wrong);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const category = String(body.category || "");
  if (!exam.categories.includes(category)) {
    return NextResponse.json({ error: "Pick a category" }, { status: 400 });
  }

  const deviceId = String(body.deviceId || "");
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(deviceId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const missing = envRef();
  if (missing) return NextResponse.json({ error: "Not configured", ref: missing }, { status: 503 });

  const share = body.share !== false;
  const score = computeScore(exam, correct as number, wrong as number);
  const supabase = createServerClient();

  try {
    if (share) {
      const ipHash = hashIp(req);
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("score_submissions")
        .select("id", { count: "exact", head: true })
        .eq("exam_key", exam.examKey)
        .eq("ip_hash", ipHash)
        .gte("updated_at", since);

      if ((count ?? 0) < MAX_WRITES_PER_IP_PER_HOUR) {
        const { error } = await supabase.from("score_submissions").upsert(
          {
            exam_key: exam.examKey,
            device_id: deviceId,
            ip_hash: ipHash,
            category,
            correct,
            wrong,
            score,
            source: exam.answerKeyReleased ? "answer_key" : "self_estimate",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "exam_key,device_id" }
        );
        if (error) throw error;
      }
    }

    const stats = await getStats(supabase, exam.examKey, score, category);
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("rank api", e);
    return NextResponse.json({ error: "Stats unavailable", ref: errRef(e) }, { status: 503 });
  }
}
