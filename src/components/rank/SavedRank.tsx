"use client";

import { useEffect, useState } from "react";
import { niceRank, predict, shownRange, type PredictExam, type ShareStats } from "@/lib/rank";

interface Mine {
  score: number;
  category: string;
}

/**
 * After a rank tool closes: people who saved a score on this phone still see it,
 * with their expected rank against all the scores that were shared. Nothing is saved.
 */
export function SavedRank({ exam, examKey }: { exam: PredictExam; examKey: string }) {
  const [data, setData] = useState<{ mine: Mine; stats: ShareStats } | null>(null);

  useEffect(() => {
    let deviceId: string | null = null;
    try {
      deviceId = window.localStorage.getItem("jka:device");
    } catch {
      /* storage blocked: the cookie may still identify the phone */
    }
    fetch(`/api/rank?exam=${encodeURIComponent(examKey)}&me=1`, { headers: deviceId ? { "x-device-id": deviceId } : {} })
      .then((r) => r.json())
      .then((j) => {
        if (j?.mine && j?.stats) setData({ mine: { score: Number(j.mine.score), category: j.mine.category }, stats: j.stats });
      })
      .catch(() => {});
  }, [examKey]);

  if (!data) return null;
  const p = predict(exam, data.mine.score, data.stats, data.mine.category);
  const r = shownRange(p.rank.mid, 1, exam.appeared);
  return (
    <section className="surface-card mt-4 border-[hsl(var(--accent)/0.4)] p-4" aria-labelledby="your-score">
      <h2 id="your-score" className="text-[17px] leading-tight">
        Your saved score
      </h2>
      <p className="mt-2 text-[15px]">
        <span className="font-mono-num text-[22px] font-semibold">{data.mine.score}</span>
        <span className="text-[hsl(var(--muted))]"> · {data.mine.category}</span>
      </p>
      <p className="mt-1 text-[14.5px]">
        Expected rank: <strong className="font-mono-num">{niceRank(r.low)}–{niceRank(r.high)}</strong>
        {p.category && (
          <>
            {" "}
            overall, <strong className="font-mono-num">{niceRank(p.category.rank.mid)}</strong> in {p.category.name}
          </>
        )}
      </p>
    </section>
  );
}
