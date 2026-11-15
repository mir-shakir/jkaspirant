"use client";

import { useEffect, useMemo, useState } from "react";
import { computeScore, validateCounts, MIN_SUBMISSIONS_FOR_ESTIMATE, type RankEstimate } from "@/lib/rank";

export interface RankPredictorExam {
  examKey: string;
  name: string;
  totalQuestions: number;
  marksPerCorrect: number;
  negativePerWrong: number;
  posts: number;
  appeared: number;
  categories: string[];
  answerKeyReleased: boolean;
  patternVerified: boolean;
}

interface ApiResult {
  estimate: RankEstimate;
  total: number;
  catTotal: number;
  histogram: { bucket: number; count: number }[];
}

const fmt = (n: number) => n.toLocaleString("en-IN");

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
  const [correct, setCorrect] = useState("");
  const [wrong, setWrong] = useState("");
  const [category, setCategory] = useState("");
  const [share, setShare] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [shared, setShared] = useState<number | null>(null);

  // restore last entry + fetch how many have shared
  useEffect(() => {
    try {
      const saved = JSON.parse(storage()?.getItem(draftKey) || "null");
      if (saved) {
        setCorrect(String(saved.correct ?? ""));
        setWrong(String(saved.wrong ?? ""));
        setCategory(saved.category ?? "");
      }
    } catch {}
    fetch(`/api/rank?exam=${encodeURIComponent(exam.examKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setShared(d.total))
      .catch(() => {});
  }, [draftKey, exam.examKey]);

  const c = correct === "" ? NaN : Number(correct);
  const w = wrong === "" ? 0 : Number(wrong);
  const validation = correct === "" ? null : validateCounts(exam, c, w);
  const score = correct !== "" && !validation ? computeScore(exam, c, w) : null;
  const unattempted = score !== null ? exam.totalQuestions - c - w : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) return;
    if (!category) {
      setError("Pick your category");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      storage()?.setItem(draftKey, JSON.stringify({ correct: c, wrong: w, category }));
    } catch {}
    try {
      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: exam.examKey, correct: c, wrong: w, category, share, deviceId: getDeviceId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
      setShared(data.total);
      setStatus("done");
      requestAnimationFrame(() =>
        document.getElementById("rank-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="surface-card p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="correct" label="Correct" tone="success" value={correct} onChange={setCorrect} max={exam.totalQuestions} />
          <NumberField id="wrong" label="Wrong" tone="accent" value={wrong} onChange={setWrong} max={exam.totalQuestions} />
        </div>

        <div className="mt-3">
          <label htmlFor="category" className="mb-1 block text-[13px] font-medium">
            Your category
          </label>
          <select id="category" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select</option>
            {exam.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* live score */}
        <div className="mt-4 flex items-end justify-between rounded-lg bg-[hsl(var(--panel-soft))] px-4 py-3">
          <div>
            <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
              Your score
            </p>
            <p className="font-display text-4xl font-semibold leading-none" aria-live="polite">
              {score !== null ? score : "—"}
              <span className="ml-1 text-base font-normal text-[hsl(var(--muted))]">
                / {exam.totalQuestions * exam.marksPerCorrect}
              </span>
            </p>
          </div>
          {unattempted !== null && (
            <p className="text-right font-mono-num text-[12px] text-[hsl(var(--muted))]">
              {unattempted} left blank
            </p>
          )}
        </div>
        {validation && <p className="mt-2 text-[13px] text-[hsl(var(--accent))]">{validation}</p>}

        <label className="mt-4 flex items-start gap-2.5 text-[13px] leading-5 text-[hsl(var(--muted))]">
          <input
            type="checkbox"
            checked={share}
            onChange={(e) => setShare(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent-strong))]"
          />
          <span>
            Add my score (anonymously) so everyone gets a better rank estimate. No name, phone or roll number.
          </span>
        </label>

        <button type="submit" disabled={score === null || status === "loading"} className="btn-primary mt-4 w-full py-3 text-[15px] disabled:opacity-50">
          {status === "loading" ? "Checking…" : "Predict my rank"}
        </button>
        {error && <p className="mt-2 text-[13px] text-[hsl(var(--accent))]">{error}</p>}

        {shared !== null && shared > 0 && (
          <p className="mt-3 text-center font-mono-num text-[11.5px] text-[hsl(var(--muted))]">
            {fmt(shared)} aspirants have shared their score
          </p>
        )}
      </form>

      {status === "done" && result && <ResultCard exam={exam} result={result} category={category} />}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  max,
  tone,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  tone: "success" | "accent";
}) {
  const n = value === "" ? 0 : Number(value);
  const step = (d: number) => onChange(String(Math.min(max, Math.max(0, (Number.isFinite(n) ? n : 0) + d))));
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-center gap-1.5 text-[13px] font-medium">
        <span className={`h-2 w-2 rounded-full ${tone === "success" ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--accent))]"}`} />
        {label}
      </label>
      <div className="flex overflow-hidden rounded-lg border bg-[hsl(var(--background))] focus-within:border-[hsl(var(--accent))]">
        <button type="button" onClick={() => step(-1)} className="w-10 shrink-0 text-lg text-[hsl(var(--muted))]" aria-label={`Decrease ${label}`}>
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="0"
          className="w-full min-w-0 bg-transparent py-2.5 text-center font-mono-num text-xl font-semibold outline-none focus-visible:ring-0"
        />
        <button type="button" onClick={() => step(1)} className="w-10 shrink-0 text-lg text-[hsl(var(--muted))]" aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

const chanceCopy = {
  strong: { label: "Strong position", tone: "text-[hsl(var(--success))]", note: "Your estimated rank is within the number of posts." },
  borderline: { label: "Borderline", tone: "text-[hsl(var(--warm))]", note: "You're close to the likely cut-off. Category merit and final answer key will decide." },
  tough: { label: "Tough", tone: "text-[hsl(var(--accent))]", note: "Your estimated rank is well beyond the number of posts on current data." },
} as const;

function ResultCard({ exam, result, category }: { exam: RankPredictorExam; result: ApiResult; category: string }) {
  const { estimate, total, catTotal } = result;
  const myBucket = Math.floor(estimate.score / 5) * 5;
  // fill empty buckets so the bars sit on a continuous axis
  const histogram = useMemo(() => {
    if (result.histogram.length === 0) return [];
    const byBucket = new Map(result.histogram.map((h) => [h.bucket, h.count]));
    const lo = Math.min(...result.histogram.map((h) => h.bucket));
    const hi = Math.max(...result.histogram.map((h) => h.bucket));
    const out = [];
    for (let b = lo; b <= hi; b += 5) out.push({ bucket: b, count: byBucket.get(b) ?? 0 });
    return out;
  }, [result.histogram]);
  const maxCount = Math.max(1, ...histogram.map((h) => h.count));
  const pageUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const shareText = `I scored ${estimate.score} in JKSSB ${exam.name}. Check your score & expected rank: ${pageUrl}`;

  return (
    <section id="rank-result" className="reveal surface-card scroll-mt-20 overflow-hidden">
      <div className="grid grid-cols-2 divide-x border-b">
        <Stat label="Score" value={String(estimate.score)} />
        <Stat label={`Rank · of ${fmt(total)}`} value={`#${fmt(estimate.rankAmongSubmissions)}`} />
      </div>
      <div className="grid grid-cols-2 divide-x border-b">
        <Stat label={`${category} rank · of ${fmt(catTotal)}`} value={`#${fmt(estimate.categoryRankAmongSubmissions)}`} small />
        <Stat label="Better than" value={`${estimate.percentile}%`} small />
      </div>

      <div className="p-4 sm:p-5">
        {estimate.estimatedRank ? (
          <>
            <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
              Estimated overall rank (of ~{fmt(exam.appeared)})
            </p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {fmt(estimate.estimatedRank.low)} – {fmt(estimate.estimatedRank.high)}
            </p>
            {estimate.chance && (
              <p className="mt-2 text-sm">
                <span className={`font-semibold ${chanceCopy[estimate.chance].tone}`}>{chanceCopy[estimate.chance].label}.</span>{" "}
                <span className="text-[hsl(var(--muted))]">{chanceCopy[estimate.chance].note}</span>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm leading-6 text-[hsl(var(--muted))]">
            We need at least {MIN_SUBMISSIONS_FOR_ESTIMATE} shared scores before estimating an overall rank (
            {fmt(total)} so far). Share this page and check back in a few hours.
          </p>
        )}

        {estimate.projectedCutoff !== null && (
          <p className="mt-3 rounded-lg bg-[hsl(var(--panel-soft))] px-3 py-2 text-sm">
            Score at rank ~{fmt(exam.posts)} on current data: <strong className="font-mono-num">{estimate.projectedCutoff}</strong>
          </p>
        )}

        {histogram.length > 1 && (
          <div className="mt-5">
            <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
              Score distribution
            </p>
            <div className="mt-2 flex h-24 items-end gap-[3px]" role="img" aria-label="Histogram of shared scores">
              {histogram.map((h) => (
                <div
                  key={h.bucket}
                  title={`${h.bucket}–${h.bucket + 4.75}: ${h.count}`}
                  className={`flex-1 rounded-t-sm ${h.bucket === myBucket ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--foreground)/0.18)]"}`}
                  style={{ height: `${h.count === 0 ? 0 : Math.max(4, (h.count / maxCount) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono-num text-[10px] text-[hsl(var(--muted))]">
              <span>{histogram[0].bucket}</span>
              <span className="text-[hsl(var(--accent))]">■ your range</span>
              <span>{histogram[histogram.length - 1].bucket + 5}</span>
            </div>
          </div>
        )}

        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-[15px] font-semibold text-[#073b1d]"
        >
          Share with friends on WhatsApp
        </a>
        <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--muted))]">
          Estimates come from scores aspirants choose to share, so they get more accurate as more people
          join. Not an official result.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="truncate font-mono-num text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">{label}</p>
      <p className={`mt-0.5 font-display font-semibold ${small ? "text-xl" : "text-3xl"}`}>{value}</p>
    </div>
  );
}
