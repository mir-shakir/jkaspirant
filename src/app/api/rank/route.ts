import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";
import { getRankExamByKey, type RankExamConfig } from "@/config/rank-predictor";
import { BUCKET_WIDTH, cleanName, computeScore, maskName, validateCounts, type ShareStats } from "@/lib/rank";

// Rank predictor backend.
//
//   GET  ?exam=K        public, cached: totals, score chart, leaderboard
//   GET  ?exam=K&me=1   private: the score saved from this phone, if any
//   POST {exam, correct, wrong, category, name?, board?}   save a score
//   POST {exam, action: "board", on, name?}                join / leave leaderboard
//
// One score per phone. A phone is recognised by a long-lived cookie, backed by
// an id the page keeps in localStorage. A saved score can be corrected once
// (and once more after the official answer key is out). New phones per network
// address are capped per day to slow down bulk fake entries.
//
// The rank estimate itself is computed in the browser (src/lib/rank.ts), so
// the tool still works on past patterns alone if this endpoint is unreachable.

export const dynamic = "force-dynamic";

const DEVICE_COOKIE = "jka_did";
const DEVICE_RE = /^[a-zA-Z0-9-]{16,64}$/;
// Mobile carriers share addresses between many users, so this stays generous.
const MAX_NEW_DEVICES_PER_IP_PER_DAY = 12;
const LEADERBOARD_SIZE = 10;

type Db = ReturnType<typeof createServerClient>;

interface Row {
  id: string;
  category: string;
  correct: number;
  wrong: number;
  score: number;
  source: string;
  created_at: string;
  updated_at: string;
  display_name?: string | null;
  on_leaderboard?: boolean | null;
}

function hashIp(req: NextRequest) {
  let ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // IPv6 phones rotate the last 64 bits, so identify the network, not the address.
  if (ip.includes(":")) ip = ip.split(":").slice(0, 4).join(":");
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

const withoutKeys = (obj: Record<string, unknown>, keys: string[]) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

const isMissingColumn = (e: unknown) => ["PGRST204", "42703"].includes((e as { code?: string })?.code ?? "");

function deviceFrom(req: NextRequest, fallback?: unknown) {
  const cookie = req.cookies.get(DEVICE_COOKIE)?.value;
  if (cookie && DEVICE_RE.test(cookie)) return cookie;
  const candidate = typeof fallback === "string" ? fallback : req.headers.get("x-device-id") || "";
  return DEVICE_RE.test(candidate) ? candidate : null;
}

function withDevice(res: NextResponse, deviceId: string) {
  res.cookies.set(DEVICE_COOKIE, deviceId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  res.headers.set("cache-control", "private, no-store");
  return res;
}

const boardKey = (rowId: string) => createHash("sha256").update(rowId).digest("hex").slice(0, 10);

/** A score can be corrected once, and once more when the official key arrives. */
function canCorrect(exam: RankExamConfig, row: Row) {
  const edited = Math.abs(Date.parse(row.updated_at) - Date.parse(row.created_at)) > 2000;
  return !edited || (exam.answerKeyReleased && row.source === "self_estimate");
}

function publicRow(exam: RankExamConfig, row: Row) {
  return {
    correct: row.correct,
    wrong: row.wrong,
    category: row.category,
    score: Number(row.score),
    name: row.display_name ?? null,
    onBoard: !!row.on_leaderboard,
    canCorrect: canCorrect(exam, row),
    key: boardKey(row.id),
  };
}

async function findRow(supabase: Db, examKey: string, deviceId: string) {
  const { data, error } = await supabase.from("score_submissions").select("*").eq("exam_key", examKey).eq("device_id", deviceId).maybeSingle();
  if (error) throw error;
  return (data as Row | null) ?? null;
}

async function getStats(supabase: Db, examKey: string, score: number, category: string): Promise<ShareStats> {
  const { data, error } = await supabase.rpc("rank_stats", { p_exam: examKey, p_score: score, p_category: category, p_cutoff_index: 0 });
  if (!error && data) {
    const s = data as ShareStats;
    return { total: s.total, above: s.above, catTotal: s.catTotal, catAbove: s.catAbove, histogram: s.histogram ?? [] };
  }
  console.error("rank_stats rpc failed, using fallback", error);
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

/** Top scores from people who chose to appear. `ready` is false until migration 007 has run. */
async function getLeaderboard(supabase: Db, exam: RankExamConfig) {
  const { data, error } = await supabase
    .from("score_submissions")
    .select("id, display_name, score, category")
    .eq("exam_key", exam.examKey)
    .eq("on_leaderboard", true)
    .lte("score", exam.leaderboardMaxScore)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(LEADERBOARD_SIZE);
  if (error) return { ready: !isMissingColumn(error), entries: [] };
  return {
    ready: true,
    entries: (data as { id: string; display_name: string | null; score: number; category: string }[]).map((r) => ({
      key: boardKey(r.id),
      name: r.display_name || "A***",
      score: Number(r.score),
      category: r.category,
    })),
  };
}

export async function GET(req: NextRequest) {
  const exam = getRankExamByKey(req.nextUrl.searchParams.get("exam") || "");
  if (!exam) return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  const personal = req.nextUrl.searchParams.has("me");
  const missing = envRef();
  if (missing) return NextResponse.json(personal ? { mine: null, ref: missing } : { total: 0, histogram: [], board: { ready: false, entries: [] }, ref: missing });

  const supabase = createServerClient();
  try {
    if (personal) {
      const deviceId = deviceFrom(req);
      const row = deviceId ? await findRow(supabase, exam.examKey, deviceId) : null;
      if (!row || !deviceId) return NextResponse.json({ mine: null }, { headers: { "cache-control": "private, no-store" } });
      const stats = await getStats(supabase, exam.examKey, Number(row.score), row.category);
      return withDevice(NextResponse.json({ mine: publicRow(exam, row), stats }), deviceId);
    }
    const [stats, board] = await Promise.all([getStats(supabase, exam.examKey, 0, exam.categories[0]), getLeaderboard(supabase, exam)]);
    return NextResponse.json(
      { total: stats.total, histogram: stats.histogram, board, ok: true },
      { headers: { "cache-control": "public, max-age=10, s-maxage=20, stale-while-revalidate=60" } }
    );
  } catch (e) {
    console.error("rank api GET", e);
    return NextResponse.json(personal ? { mine: null, ref: errRef(e) } : { total: 0, histogram: [], board: { ready: false, entries: [] }, ref: errRef(e) });
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

  const deviceId = deviceFrom(req, body.deviceId);
  if (!deviceId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const missing = envRef();
  if (missing) return NextResponse.json({ error: "Not configured", ref: missing }, { status: 503 });
  const supabase = createServerClient();

  // The full name is stored privately; the leaderboard only ever shows the masked form.
  const fullName = typeof body.name === "string" ? cleanName(body.name) : "";
  const masked = fullName ? maskName(fullName) : null;
  const nameFields = masked ? { display_name: masked, full_name: fullName } : {};

  try {
    const existing = await findRow(supabase, exam.examKey, deviceId);

    // --- Join or leave the leaderboard with the score already saved ---
    if (body.action === "board") {
      if (!existing) return NextResponse.json({ error: "Save your score first" }, { status: 409 });
      const on = body.on !== false;
      if (on && !masked && !existing.display_name) return NextResponse.json({ error: "Enter your name" }, { status: 400 });
      const patch = on ? { on_leaderboard: true, ...nameFields } : { on_leaderboard: false };
      let { error } = await supabase.from("score_submissions").update(patch).eq("id", existing.id);
      // full_name column not created yet (migration 008): save without it.
      if (error && isMissingColumn(error)) ({ error } = await supabase.from("score_submissions").update(withoutKeys(patch, ["full_name"])).eq("id", existing.id));
      if (error) throw error;
      const row = { ...existing, ...patch };
      const board = await getLeaderboard(supabase, exam);
      return withDevice(NextResponse.json({ mine: publicRow(exam, row), board }), deviceId);
    }

    // --- Save a score ---
    const { correct, wrong } = body;
    const invalid = validateCounts(exam, correct, wrong);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const category = String(body.category || "");
    if (!exam.categories.includes(category)) return NextResponse.json({ error: "Pick a category" }, { status: 400 });

    const score = computeScore(exam, correct as number, wrong as number);
    const boardFields = body.board === true && masked ? { ...nameFields, on_leaderboard: true } : {};
    const source = exam.answerKeyReleased ? "answer_key" : "self_estimate";
    let row: Row | null = existing;
    let saved = true;
    let locked = false;

    if (!existing) {
      const ipHash = hashIp(req);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("score_submissions")
        .select("id", { count: "exact", head: true })
        .eq("exam_key", exam.examKey)
        .eq("ip_hash", ipHash)
        .gte("created_at", since);
      if ((count ?? 0) >= MAX_NEW_DEVICES_PER_IP_PER_DAY) {
        saved = false;
      } else {
        const base = { exam_key: exam.examKey, device_id: deviceId, ip_hash: ipHash, category, correct, wrong, score, source };
        let res = await supabase.from("score_submissions").insert({ ...base, ...boardFields }).select("*").single();
        // Newer columns may not exist yet (migrations 007 / 008): drop them step by step.
        if (res.error && isMissingColumn(res.error)) res = await supabase.from("score_submissions").insert({ ...base, ...withoutKeys(boardFields, ["full_name"]) }).select("*").single();
        if (res.error && isMissingColumn(res.error)) res = await supabase.from("score_submissions").insert(base).select("*").single();
        // Two taps at once: the other request won, so read what it saved.
        if (res.error && (res.error as { code?: string }).code === "23505") row = await findRow(supabase, exam.examKey, deviceId);
        else if (res.error) throw res.error;
        else row = res.data as Row;
      }
    } else {
      const changed = existing.correct !== correct || existing.wrong !== wrong || existing.category !== category;
      if (changed && !canCorrect(exam, existing)) {
        locked = true;
      } else if (changed || Object.keys(boardFields).length > 0) {
        const patch = changed
          ? { category, correct, wrong, score, source, updated_at: new Date(Math.max(Date.now(), Date.parse(existing.created_at) + 5000)).toISOString(), ...boardFields }
          : boardFields;
        let res = await supabase.from("score_submissions").update(patch).eq("id", existing.id).select("*").single();
        if (res.error && isMissingColumn(res.error)) {
          res = await supabase.from("score_submissions").update(withoutKeys(patch, ["full_name"])).eq("id", existing.id).select("*").single();
        }
        if (res.error && isMissingColumn(res.error)) {
          // Leaderboard columns not created yet (migration 007): save the score part only.
          const scoreOnly = withoutKeys(patch, ["display_name", "on_leaderboard", "full_name"]);
          res = changed
            ? await supabase.from("score_submissions").update(scoreOnly).eq("id", existing.id).select("*").single()
            : await supabase.from("score_submissions").select("*").eq("id", existing.id).single();
        }
        if (res.error) throw res.error;
        row = res.data as Row;
      }
    }

    // Stats are for the score that is actually on record for this phone.
    const effectiveScore = row ? Number(row.score) : score;
    const effectiveCategory = row ? row.category : category;
    const [stats, board] = await Promise.all([getStats(supabase, exam.examKey, effectiveScore, effectiveCategory), getLeaderboard(supabase, exam)]);
    const res = NextResponse.json({ stats, board, saved, locked, mine: row ? publicRow(exam, row) : null });
    return row ? withDevice(res, deviceId) : res;
  } catch (e) {
    console.error("rank api", e);
    return NextResponse.json({ error: "Stats unavailable", ref: errRef(e) }, { status: 503 });
  }
}
