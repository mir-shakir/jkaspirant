"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export interface AgeRule {
  slug: string;
  title: string;
  asOn: string; // "1 Jan 2026"
  min: number;
  rows: [string, string][]; // [who, max years]
  applyStatus: "open" | "soon" | "closed";
  applyText: string;
}

const CATS = ["OM", "SC", "ST-1", "ST-2", "OBC", "ALC/IB", "RBA", "EWS"];
const KEY = "jka_age_checker";

/** Maximum age that applies to this candidate, from the advertisement's rows. */
function maxFor(rule: AgeRule, cat: string, police: boolean, pwbd: boolean) {
  const found: number[] = [];
  for (const [who, v] of rule.rows) {
    const w = who.toLowerCase();
    const n = Number(v);
    if (w.includes("all categories")) found.push(n);
    else if (w === "om" && cat === "OM") found.push(n);
    else if (w.includes("reserved") && cat !== "OM") found.push(n);
    else if (who.split("/").map((s) => s.replace("ALC-IB", "ALC/IB")).includes(cat) || (cat === "ALC/IB" && who.includes("ALC-IB"))) found.push(n);
    else if (w.includes("in-service police") && police) found.push(n);
    else if (w.includes("pwbd") && pwbd) found.push(n);
  }
  return found.length ? Math.max(...found) : null;
}

function addYears(d: Date, y: number) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() - y);
  return x;
}

function verdict(rule: AgeRule, dob: Date, cat: string, police: boolean, pwbd: boolean) {
  const asOn = new Date(rule.asOn);
  const max = maxFor(rule, cat, police, pwbd);
  if (max === null) return { ok: null as boolean | null, text: "Age rule for your category not listed; check the notice" };
  const oldest = addYears(asOn, max); // not born before this date
  const youngest = addYears(asOn, rule.min); // not born after this date
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (dob < oldest) return { ok: false, text: `Over the limit: maximum ${max} as on ${rule.asOn} (born ${fmt(oldest)} or later)` };
  if (dob > youngest) return { ok: false, text: `Under ${rule.min} as on ${rule.asOn}` };
  return { ok: true, text: `Within ${rule.min}–${max} years as on ${rule.asOn}` };
}

export function AgeChecker({ rules }: { rules: AgeRule[] }) {
  const [dob, setDob] = useState("");
  const [cat, setCat] = useState("OM");
  const [police, setPolice] = useState(false);
  const [pwbd, setPwbd] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(window.localStorage.getItem(KEY) || "{}");
      if (s.dob) setDob(s.dob);
      if (CATS.includes(s.cat)) setCat(s.cat);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ dob, cat }));
    } catch {}
  }, [dob, cat]);

  // Local midnight, to match the "1 Jan 2026" style dates (also local).
  const date = dob ? new Date(`${dob}T00:00:00`) : null;
  const results = useMemo(
    () => (date && !isNaN(date.getTime()) ? rules.map((r) => ({ r, v: verdict(r, date, cat, police, pwbd) })) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dob, cat, police, pwbd, rules]
  );
  const order = { open: 0, soon: 1, closed: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.r.applyStatus] - order[b.r.applyStatus]);

  return (
    <div>
      <div className="surface-card p-4">
        <label htmlFor="dob" className="mb-1.5 block text-[13px] font-medium">
          Date of birth
        </label>
        <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max="2012-12-31" min="1960-01-01" className="field" />
        <label htmlFor="cat" className="mb-1.5 mt-4 block text-[13px] font-medium">
          Category
        </label>
        <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)} className="field">
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap gap-x-5">
          <label className="flex min-h-[44px] items-center gap-2 text-[14px]">
            <input type="checkbox" checked={police} onChange={(e) => setPolice(e.target.checked)} className="h-[18px] w-[18px] accent-[hsl(var(--accent-strong))]" />
            In-service police
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-[14px]">
            <input type="checkbox" checked={pwbd} onChange={(e) => setPwbd(e.target.checked)} className="h-[18px] w-[18px] accent-[hsl(var(--accent-strong))]" />
            Person with disability
          </label>
        </div>
        <p className="mt-1 text-[12px] text-[hsl(var(--muted))]">Saved on this phone only, so you don&apos;t have to type it again.</p>
      </div>

      {sorted.length > 0 && (
        <ul className="group-list mt-5">
          {sorted.map(({ r, v }) => (
            <li key={r.slug}>
              <Link href={`/exams/${r.slug}`} className={`row ${r.applyStatus === "closed" ? "opacity-60" : ""}`}>
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                    v.ok === true ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]" : v.ok === false ? "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]" : "bg-[hsl(var(--panel-soft))] text-[hsl(var(--muted))]"
                  }`}
                >
                  {v.ok === true ? "✓" : v.ok === false ? "✕" : "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-snug">{r.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[hsl(var(--muted))]">{v.text}</span>
                  <span className={`mt-0.5 block text-[12px] ${r.applyStatus === "open" ? "font-semibold text-[hsl(var(--accent))]" : "text-[hsl(var(--muted))]"}`}>{r.applyText}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
