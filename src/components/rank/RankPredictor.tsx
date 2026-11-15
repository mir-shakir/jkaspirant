"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUCKET_WIDTH,
  computeScore,
  maskName,
  niceRank,
  predict,
  validateCounts,
  type PredictExam,
  type Prediction,
  type ShareStats,
  type Verdict,
} from "@/lib/rank";
import { Leaderboard, type Board } from "./Leaderboard";

export interface RankPredictorExam extends PredictExam {
  examKey: string;
  name: string;
  registered: number;
  categories: string[];
}

/** The score on record for this phone. `local` means the server has not saved it (yet). */
export interface Mine {
  correct: number;
  wrong: number;
  category: string;
  score: number;
  name: string | null;
  onBoard: boolean;
  canCorrect: boolean;
  key: string | null;
  local?: boolean;
}

interface PublicData {
  total: number;
  histogram: ShareStats["histogram"];
  board: Board;
}

const fmt = (n: number) => n.toLocaleString("en-IN");
const lakh = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} lakh` : fmt(n));

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getDeviceId() {
  const ls = storage();
  let id = ls?.getItem("jka:device") ?? null;
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    try {
      ls?.setItem("jka:device", id);
    } catch {}
  }
  return id;
}

export function RankPredictor({ exam }: { exam: RankPredictorExam }) {
  const draftKey = `jka:rank:${exam.examKey}`;
  const [pub, setPub] = useState<PublicData | null>(null);
  const [mine, setMine] = useState<Mine | null>(null);
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [correct, setCorrect] = useState("");
  const [wrong, setWrong] = useState("");
  const [category, setCategory] = useState("");
  const [joinBoard, setJoinBoard] = useState(false);
  const [name, setName] = useState("");
  const scrollToResult = useRef(false);

  const remember = useCallback(
    (m: Mine) => {
      try {
        storage()?.setItem(draftKey, JSON.stringify({ correct: m.correct, wrong: m.wrong, category: m.category, score: m.score }));
      } catch {}
    },
    [draftKey]
  );

  const loadPublic = useCallback(() => {
    fetch(`/api/rank?exam=${encodeURIComponent(exam.examKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.histogram)) setPub({ total: d.total ?? 0, histogram: d.histogram, board: d.board ?? { ready: false, entries: [] } });
      })
      .catch(() => {});
  }, [exam.examKey]);

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: exam.examKey, deviceId: getDeviceId(), ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    [exam.examKey]
  );

  // On open: show the score this phone saved earlier, so the rank survives a refresh.
  useEffect(() => {
    let local: { correct: number; wrong: number; category: string; score: number } | null = null;
    try {
      local = JSON.parse(storage()?.getItem(draftKey) || "null");
    } catch {}
    if (local && typeof local.score === "number") {
      setMine({ ...local, name: null, onBoard: false, canCorrect: true, key: null, local: true });
    }
    loadPublic();

    const deviceId = storage()?.getItem("jka:device");
    fetch(`/api/rank?exam=${encodeURIComponent(exam.examKey)}&me=1`, { headers: deviceId ? { "x-device-id": deviceId } : {} })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (d) => {
        if (d?.mine) {
          setMine(d.mine);
          setStats(d.stats ?? null);
          remember(d.mine);
        } else if (local) {
          // Entered earlier but never reached the server: try once more, quietly.
          try {
            const again = await send({ correct: local.correct, wrong: local.wrong, category: local.category });
            if (again.mine) setMine(again.mine);
            if (again.stats) setStats(again.stats);
          } catch {}
        }
      })
      .catch(() => {});

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadPublic();
    }, 30000);
    return () => clearInterval(timer);
  }, [draftKey, exam.examKey, loadPublic, remember, send]);

  useEffect(() => {
    if (scrollToResult.current && mine && !editing) {
      scrollToResult.current = false;
      document.getElementById("rank-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mine, editing]);

  const c = correct === "" ? NaN : Number(correct);
  const w = wrong === "" ? 0 : Number(wrong);
  const validation = correct === "" ? null : validateCounts(exam, c, w);
  const score = correct !== "" && !validation ? computeScore(exam, c, w) : null;
  const boardReady = pub?.board.ready ?? false;
  const masked = maskName(name);

  // Stats for the saved score. Until the server answers, estimate "above" from the public chart.
  const effectiveStats = useMemo<ShareStats | null>(() => {
    if (stats) return stats;
    if (!pub || !mine) return null;
    const myBucket = Math.floor(mine.score / BUCKET_WIDTH) * BUCKET_WIDTH;
    const above = pub.histogram.filter((h) => h.bucket > myBucket).reduce((sum, h) => sum + h.count, 0);
    return { total: pub.total, above, catTotal: 0, catAbove: 0, histogram: pub.histogram };
  }, [stats, pub, mine]);

  const prediction = useMemo(() => (mine ? predict(exam, mine.score, effectiveStats) : null), [exam, mine, effectiveStats]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) return;
    if (!category) return setError("Choose your category to continue");
    if (joinBoard && !masked) return setError("Enter your name for the leaderboard, or untick it");
    setError(null);
    setNote(null);
    setBusy(true);

    const localMine: Mine = { correct: c, wrong: w, category, score, name: null, onBoard: false, canCorrect: true, key: null, local: true };
    try {
      const data = await send({ correct: c, wrong: w, category, ...(joinBoard && masked ? { name, board: true } : {}) });
      if (data.locked && data.mine) setNote("This phone has already used its one correction, so your saved score is shown.");
      setMine(data.mine ?? localMine);
      setStats(data.stats ?? null);
      if (data.board) setPub((prev) => (prev ? { ...prev, board: data.board, total: data.stats?.total ?? prev.total } : prev));
      remember(data.mine ?? localMine);
    } catch {
      // Still give the estimate; it just isn't counted yet.
      setMine(localMine);
      setStats(null);
      remember(localMine);
      setNote("We couldn't save your score just now, so it isn't counted yet. Reopen this page later and we'll try again.");
    }
    setBusy(false);
    setEditing(false);
    scrollToResult.current = true;
  }

  function startCorrection() {
    if (!mine) return;
    setCorrect(String(mine.correct));
    setWrong(String(mine.wrong));
    setCategory(mine.category);
    setJoinBoard(false);
    setError(null);
    setEditing(true);
  }

  async function setBoard(on: boolean, joinName?: string) {
    const data = await send({ action: "board", on, ...(joinName ? { name: joinName } : {}) });
    if (data.mine) setMine(data.mine);
    if (data.board) setPub((prev) => (prev ? { ...prev, board: data.board } : prev));
  }

  const showForm = !mine || editing;

  return (
    <div className="space-y-5">
      {showForm && (
        <form onSubmit={submit} className="surface-card p-4 sm:p-5">
          {editing && <p className="mb-3 text-[14px] font-medium">Correct your answers. You can do this once.</p>}
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="correct" label="Correct answers" value={correct} onChange={setCorrect} max={exam.totalQuestions} />
            <NumberField id="wrong" label="Wrong answers" value={wrong} onChange={setWrong} max={exam.totalQuestions} />
          </div>

          <p className="mt-2.5 flex items-center justify-between gap-3 text-[13px] text-[hsl(var(--muted))]" aria-live="polite">
            {validation ? (
              <span className="text-[hsl(var(--accent))]">{validation}</span>
            ) : (
              <span>
                +{exam.marksPerCorrect} right · −{exam.negativePerWrong} wrong · {exam.totalQuestions} questions
              </span>
            )}
            {score !== null && (
              <span className="shrink-0 font-mono-num text-[hsl(var(--foreground))]">
                Score <strong className="text-[15px]">{score}</strong>
              </span>
            )}
          </p>

          <label htmlFor="category" className="mb-1.5 mt-4 block text-[13px] font-medium">
            Category
          </label>
          <select id="category" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select your category</option>
            {exam.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {boardReady && !editing && (
            <div className="mt-4">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-[14.5px]">
                <input
                  type="checkbox"
                  checked={joinBoard}
                  onChange={(e) => setJoinBoard(e.target.checked)}
                  className="h-[18px] w-[18px] accent-[hsl(var(--accent-strong))]"
                />
                Put me on the leaderboard
              </label>
              {joinBoard && (
                <>
                  <input
                    id="name"
                    type="text"
                    autoComplete="given-name"
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    aria-label="Your name"
                    className="field mt-1"
                  />
                  <p className="mt-1.5 text-[13px] text-[hsl(var(--muted))]">
                    Your name stays hidden. Others see{" "}
                    <strong className="font-mono-num text-[hsl(var(--foreground))]">{masked ?? "S***"}</strong> only.
                  </p>
                </>
              )}
            </div>
          )}

          <button type="submit" disabled={score === null || busy} className="btn-primary mt-5 w-full">
            {busy ? "Working it out…" : editing ? "Save correction" : "Predict my rank"}
          </button>
          {error && <p className="mt-2 text-center text-[13px] text-[hsl(var(--accent))]">{error}</p>}
          {editing ? (
            <button type="button" onClick={() => setEditing(false)} className="mt-1 flex min-h-[44px] w-full items-center justify-center text-[14px] font-medium text-[hsl(var(--muted))]">
              Cancel
            </button>
          ) : (
            <p className="mt-3 text-center text-[12.5px] leading-5 text-[hsl(var(--muted))]">
              One score per phone, so count carefully. Saved without your phone number or roll number.
            </p>
          )}
        </form>
      )}

      {mine && prediction && !editing && (
        <>
          <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--panel-soft))] px-4 py-2">
            <p className="font-mono-num text-[13px]">
              <span className="text-[hsl(var(--muted))]">Your answers </span>
              {mine.correct} right · {mine.wrong} wrong · {mine.category}
            </p>
            {mine.canCorrect && (
              <button type="button" onClick={startCorrection} className="text-link shrink-0 text-[13px]">
                Correct
              </button>
            )}
          </div>
          {note && <p className="text-[13px] leading-5 text-[hsl(var(--muted))]">{note}</p>}
          <Result exam={exam} prediction={prediction} stats={effectiveStats} mine={mine} />
        </>
      )}

      {boardReady && pub && <Leaderboard board={pub.board} mine={mine} total={pub.total} onChange={setBoard} />}
    </div>
  );
}

function NumberField({ id, label, value, onChange, max }: { id: string; label: string; value: string; onChange: (v: string) => void; max: number }) {
  const n = value === "" ? 0 : Number(value);
  const step = (d: number) => onChange(String(Math.min(max, Math.max(0, (Number.isFinite(n) ? n : 0) + d))));
  const stepBtn = "flex h-12 w-11 shrink-0 items-center justify-center text-xl text-[hsl(var(--muted))] active:bg-[hsl(var(--panel-soft))]";
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-xl border bg-[hsl(var(--panel))] focus-within:border-[hsl(var(--accent))]">
        <button type="button" onClick={() => step(-1)} className={stepBtn} aria-label={`One fewer: ${label}`}>
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="0"
          className="h-12 w-full min-w-0 bg-transparent text-center font-mono-num text-xl font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button type="button" onClick={() => step(1)} className={stepBtn} aria-label={`One more: ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

const verdictCopy: Record<Verdict, { label: string; tone: string; note: (posts: string) => string }> = {
  strong: {
    label: "Strong chance",
    tone: "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
    note: (p) => `Even on a cautious estimate you are inside the ${p} posts.`,
  },
  likely: {
    label: "Good chance",
    tone: "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
    note: (p) => `Your most likely rank is inside the ${p} posts.`,
  },
  edge: {
    label: "On the edge",
    tone: "bg-[hsl(var(--warm)/0.16)] text-[hsl(var(--warm))]",
    note: (p) => `You are close to the ${p}-post line. The official answer key will decide it.`,
  },
  unlikely: {
    label: "Tough this time",
    tone: "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]",
    note: (p) => `On what we know so far, your likely rank is beyond the ${p} posts.`,
  },
};

const confidenceCopy = {
  early: { bars: 1, label: "Early estimate" },
  improving: { bars: 2, label: "Getting sharper" },
  solid: { bars: 3, label: "Backed by shared scores" },
} as const;

function Result({ exam, prediction: p, stats, mine }: { exam: RankPredictorExam; prediction: Prediction; stats: ShareStats | null; mine: Mine }) {
  const verdict = verdictCopy[p.verdict];
  const conf = confidenceCopy[p.confidence];
  const reserved = mine.category !== "OM" && (p.verdict === "edge" || p.verdict === "unlikely");
  const pageUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const shareText = `I checked my expected rank for JKSSB ${exam.name}. Check yours: ${pageUrl}`;

  return (
    <section id="rank-result" className="reveal scroll-mt-20" aria-live="polite">
      <div className="surface-card overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="section-kicker">Expected rank</p>
            <p className="font-mono-num text-[13px] text-[hsl(var(--muted))]">
              Score <strong className="text-[hsl(var(--foreground))]">{p.score}</strong>
            </p>
          </div>

          <p className="mt-2 font-display text-[44px] font-semibold leading-none tracking-tight sm:text-[52px]">
            {fmt(p.shown.low)} – {fmt(p.shown.high)}
          </p>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[15px] leading-6">
            <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${verdict.tone}`}>{verdict.label}</span>
            <span>{verdict.note(fmt(exam.posts))}</span>
          </p>
          {reserved && (
            <p className="mt-2 text-[13.5px] leading-5 text-[hsl(var(--muted))]">
              {mine.category} has its own reserved posts and a lower cut-off, so your real chance is better than the overall
              rank suggests.
            </p>
          )}

          <Runway exam={exam} prediction={p} />
        </div>

        <div className="flex items-start gap-3 border-t bg-[hsl(var(--panel-soft)/0.5)] px-5 py-3.5 sm:px-6">
          <span className="mt-1 flex shrink-0 items-end gap-[3px]" aria-hidden>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-[5px] rounded-sm ${i <= conf.bars ? "bg-[hsl(var(--foreground))]" : "bg-[hsl(var(--foreground)/0.2)]"}`}
                style={{ height: 6 + i * 4 }}
              />
            ))}
          </span>
          <p className="text-[13.5px] leading-5 text-[hsl(var(--muted))]">
            <strong className="font-semibold text-[hsl(var(--foreground))]">{conf.label}.</strong>{" "}
            {p.confidence === "early"
              ? `Based on how past JKSSB papers have gone. ${p.shared > 0 ? `${fmt(p.shared)} ${p.shared === 1 ? "score" : "scores"} shared so far. ` : ""}It sharpens as more aspirants add theirs.`
              : `Based on past JKSSB papers and ${fmt(p.shared)} shared scores.`}
          </p>
        </div>
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn mt-3 w-full bg-[#25D366] text-[#06341a] hover:brightness-105"
      >
        Share with your batchmates on WhatsApp
      </a>

      <Details exam={exam} prediction={p} stats={stats} mine={mine} />
    </section>
  );
}

/** Rank 1 on the left, everyone on the right, on a log scale so the top is readable. */
function Runway({ exam, prediction: p }: { exam: RankPredictorExam; prediction: Prediction }) {
  const pos = (rank: number) => (Math.log(Math.max(1, rank)) / Math.log(exam.appeared)) * 100;
  const line = pos(exam.posts);
  const left = Math.min(pos(p.shown.low), 97);
  const width = Math.min(Math.max(3, pos(p.shown.high) - left), 100 - left);
  const inside = p.rank.mid <= exam.posts;

  return (
    <div className="mt-6" role="img" aria-label={`Your likely rank compared with the ${exam.posts} posts`}>
      <div className="relative h-3 rounded-full bg-[hsl(var(--foreground)/0.1)]">
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-[hsl(var(--success)/0.28)]" style={{ width: `${line}%` }} />
        <div
          className={`absolute -inset-y-[3px] rounded-full ${inside ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--accent))]"}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div className="absolute -inset-y-2 w-[2px] bg-[hsl(var(--foreground))]" style={{ left: `${line}%` }} />
      </div>
      <div className="relative mt-2.5 h-4 font-mono-num text-[11px] text-[hsl(var(--muted))]">
        <span className="absolute left-0">Rank 1</span>
        <span className="absolute -translate-x-1/2 font-semibold text-[hsl(var(--foreground))]" style={{ left: `${line}%` }}>
          {fmt(exam.posts)} posts
        </span>
        <span className="absolute right-0">{lakh(exam.appeared)}</span>
      </div>
    </div>
  );
}

function Details({ exam, prediction: p, stats, mine }: { exam: RankPredictorExam; prediction: Prediction; stats: ShareStats | null; mine: Mine }) {
  const myBucket = Math.floor(p.score / BUCKET_WIDTH) * BUCKET_WIDTH;
  const histogram = useMemo(() => {
    const raw = stats?.histogram ?? [];
    if (raw.length === 0) return [];
    const byBucket = new Map(raw.map((h) => [h.bucket, h.count]));
    const lo = Math.min(...raw.map((h) => h.bucket));
    const hi = Math.max(...raw.map((h) => h.bucket));
    const out = [];
    for (let b = lo; b <= hi; b += BUCKET_WIDTH) out.push({ bucket: b, count: byBucket.get(b) ?? 0 });
    return out;
  }, [stats]);
  const maxCount = Math.max(1, ...histogram.map((h) => h.count));
  const blank = exam.totalQuestions - mine.correct - mine.wrong;
  const showShared = stats !== null && stats.total >= 10;

  return (
    <details className="group mt-4 border-y">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between text-[15px] font-medium [&::-webkit-details-marker]:hidden">
        See the details
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-[hsl(var(--muted))] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m4.5 7.5 5.5 5.5 5.5-5.5" />
        </svg>
      </summary>

      <dl className="divide-y border-t text-[14.5px]">
        <Line label="Score">
          {mine.correct} × {exam.marksPerCorrect} − {mine.wrong} × {exam.negativePerWrong} = <strong>{p.score}</strong>
          <span className="text-[hsl(var(--muted))]"> · {blank} blank</span>
        </Line>
        <Line label="Most likely rank">
          about <strong>{fmt(niceRank(p.rank.mid))}</strong>
          <span className="text-[hsl(var(--muted))]"> · top {p.topPercent}%</span>
        </Line>
        <Line label="Could be anywhere from">
          <strong>
            {fmt(niceRank(p.rank.low))} – {fmt(niceRank(p.rank.high))}
          </strong>
        </Line>
        <Line label={`Score likely needed for top ${fmt(exam.posts)}`}>
          <strong>
            {p.cutoff.low} – {p.cutoff.high}
          </strong>
        </Line>
        {showShared && stats && (
          <Line label="Among shared scores">
            <strong>#{fmt(stats.above + 1)}</strong> of {fmt(stats.total)}
            {stats.catTotal >= 5 && (
              <span className="text-[hsl(var(--muted))]">
                {" "}
                · #{fmt(stats.catAbove + 1)} of {fmt(stats.catTotal)} in {mine.category}
              </span>
            )}
          </Line>
        )}
      </dl>

      {stats !== null && stats.total >= 30 && histogram.length > 1 && (
        <div className="mt-5">
          <p className="text-[13px] font-medium">Scores shared so far</p>
          <div className="mt-2 flex h-20 items-end gap-[3px]" role="img" aria-label="Chart of shared scores">
            {histogram.map((h) => (
              <div
                key={h.bucket}
                className={`flex-1 rounded-t-sm ${h.bucket === myBucket ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--foreground)/0.18)]"}`}
                style={{ height: `${h.count === 0 ? 0 : Math.max(4, (h.count / maxCount) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono-num text-[10.5px] text-[hsl(var(--muted))]">
            <span>{histogram[0].bucket}</span>
            <span className="text-[hsl(var(--accent))]">■ you</span>
            <span>{histogram[histogram.length - 1].bucket + BUCKET_WIDTH}</span>
          </div>
        </div>
      )}

      <div className="my-5 rounded-xl bg-[hsl(var(--panel-soft)/0.6)] p-4 text-[13.5px] leading-6 text-[hsl(var(--muted))]">
        <p className="font-semibold text-[hsl(var(--foreground))]">How we estimate this</p>
        <p className="mt-1">
          We start from how scores have been spread in past JKSSB papers and the cut-off range experts expect for this one.
          As aspirants share scores, we check whether this paper ran easier or harder and adjust. The range on top is our
          best guess; the wider range above is how far it could move until the official answer key is out.
        </p>
        <p className="mt-2">
          Assumes about {lakh(exam.appeared)} candidates appeared ({fmt(exam.registered)} registered). This is an estimate,
          not an official result.
        </p>
      </div>
    </details>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[hsl(var(--muted))]">{label}</dt>
      <dd className="shrink-0 text-right font-mono-num text-[13.5px]">{children}</dd>
    </div>
  );
}
