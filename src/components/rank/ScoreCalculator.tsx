"use client";

import { useState } from "react";
import { NumberField } from "./RankPredictor";
import { computeScore } from "@/lib/rank";

/** Score only, saved nowhere. Used before a rank tool opens (e.g. before the exam). */
export function ScoreCalculator({
  exam,
}: {
  exam: { totalQuestions: number; marksPerCorrect: number; negativePerWrong: number };
}) {
  const [correct, setCorrect] = useState("");
  const [wrong, setWrong] = useState("");
  const c = Number(correct || 0);
  const w = Number(wrong || 0);
  const tooMany = c + w > exam.totalQuestions;
  const score = computeScore(exam, Math.min(c, exam.totalQuestions), Math.min(w, exam.totalQuestions));
  const max = exam.totalQuestions * exam.marksPerCorrect;

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3">
        <NumberField id="correct" label="Correct answers" value={correct} onChange={setCorrect} max={exam.totalQuestions} />
        <NumberField id="wrong" label="Wrong answers" value={wrong} onChange={setWrong} max={exam.totalQuestions} />
      </div>
      <p className="mt-2.5 text-[13px] text-[hsl(var(--muted))]" aria-live="polite">
        {tooMany ? (
          <span className="text-[hsl(var(--accent))]">
            Correct and wrong add up to more than {exam.totalQuestions} questions.
          </span>
        ) : (
          <>
            +{exam.marksPerCorrect} right · −{exam.negativePerWrong} wrong · {exam.totalQuestions} questions · {exam.totalQuestions - c - w} left blank
          </>
        )}
      </p>
      <div className="mt-4 flex items-baseline justify-between border-t pt-4">
        <span className="text-[15px] font-medium">Your score</span>
        <span className="font-mono-num text-[28px] font-semibold leading-none">
          {tooMany ? "–" : score}
          <span className="text-[15px] font-normal text-[hsl(var(--muted))]"> / {max}</span>
        </span>
      </div>
    </div>
  );
}
