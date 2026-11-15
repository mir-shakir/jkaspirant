"use client";

import { useState } from "react";
import { maskName } from "@/lib/rank";
import type { Mine } from "./RankPredictor";

export interface Board {
  /** False until the leaderboard columns exist in the database. */
  ready: boolean;
  entries: { key: string; name: string; score: number; category: string }[];
}

interface LeaderboardProps {
  board: Board;
  mine: Mine | null;
  total: number;
  onChange: (on: boolean, name?: string) => Promise<void>;
}

/** Top shared scores. Names are masked before they are stored, so no full name ever reaches the page. */
export function Leaderboard({ board, mine, total, onChange }: LeaderboardProps) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const masked = maskName(name);
  const canJoin = !!mine && !mine.local && !mine.onBoard;
  const inTop = !!mine?.key && board.entries.some((e) => e.key === mine.key);

  async function run(on: boolean) {
    if (on && !masked && !mine?.name) return setError("Enter your name");
    setError(null);
    setBusy(true);
    try {
      await onChange(on, on ? name : undefined);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <section aria-labelledby="leaderboard-title">
      <div className="mb-2 flex items-end justify-between gap-3">
        <h2 id="leaderboard-title" className="flex items-center gap-2 text-[21px] leading-tight">
          Leaderboard
          <span className="relative flex h-2 w-2" title="Updates live">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--success))] opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
          </span>
        </h2>
        {total > 0 && (
          <p className="pb-0.5 font-mono-num text-[12px] text-[hsl(var(--muted))]">
            {total.toLocaleString("en-IN")} {total === 1 ? "score" : "scores"} shared
          </p>
        )}
      </div>

      {board.entries.length > 0 ? (
        <ol className="group-list">
          {board.entries.map((entry, i) => {
            const you = !!mine?.key && entry.key === mine.key;
            return (
              <li key={entry.key} className={`flex min-h-[52px] items-center gap-3 px-4 py-2.5 ${you ? "bg-[hsl(var(--accent)/0.08)]" : ""}`}>
                <span className={`w-6 shrink-0 text-center font-mono-num text-[14px] ${i < 3 ? "font-semibold text-[hsl(var(--accent))]" : "text-[hsl(var(--muted))]"}`}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono-num text-[15px] font-medium tracking-wide">
                  {entry.name}
                  {you && <span className="tag tag-new ml-2 align-middle">You</span>}
                </span>
                <span className="tag shrink-0">{entry.category}</span>
                <span className="w-14 shrink-0 text-right font-mono-num text-[16px] font-semibold">{entry.score}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-sm text-[hsl(var(--muted))]">
          No one here yet. Be the first on the board.
        </p>
      )}

      {mine?.onBoard && !inTop && board.entries.length > 0 && (
        <p className="mt-2 text-[13px] text-[hsl(var(--muted))]">
          You&apos;re listed as <strong className="font-mono-num text-[hsl(var(--foreground))]">{mine.name}</strong> with {mine.score}, outside the top{" "}
          {board.entries.length} for now.
        </p>
      )}

      {canJoin && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            autoComplete="given-name"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name for the leaderboard"
            className="field min-w-0 flex-1"
          />
          <button type="button" disabled={busy} onClick={() => run(true)} className="btn-secondary shrink-0 px-4">
            Add me
          </button>
        </div>
      )}
      {canJoin && (
        <p className="mt-1.5 text-[13px] text-[hsl(var(--muted))]">
          Add your score of {mine!.score}. Others see <strong className="font-mono-num text-[hsl(var(--foreground))]">{masked ?? "S***"}</strong> only.
        </p>
      )}
      {error && <p className="mt-1.5 text-[13px] text-[hsl(var(--accent))]">{error}</p>}

      <p className="mt-2 flex items-center justify-between gap-3 text-[12.5px] text-[hsl(var(--muted))]">
        <span>Scores are self-reported and not verified.</span>
        {mine?.onBoard && (
          <button type="button" disabled={busy} onClick={() => run(false)} className="min-h-[36px] shrink-0 font-medium underline underline-offset-4">
            Remove me
          </button>
        )}
      </p>
    </section>
  );
}
