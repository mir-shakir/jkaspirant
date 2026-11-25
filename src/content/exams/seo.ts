import type { ExamFacts } from "./index";

// Search titles, descriptions and FAQ answers built only from verified facts.

const fmt = (n: number) => n.toLocaleString("en-IN");

/** Search-friendly name: no "(518 posts)" suffix, "JKSSB" in front unless it's a JK Police post. */
function name(f: ExamFacts) {
  const t = f.title.replace(/\s*\(\d[\d,]* posts\)/, "");
  return t.startsWith("JK Police") ? t : `JKSSB ${t}`;
}

function examDate(f: ExamFacts) {
  return f.dates.filter(([k]) => k.startsWith("Exam")).map(([k, v]) => (k === "Exam date" ? v : `${v} (${k.replace(/^Exam \((.+)\)$/, "$1")})`));
}

function year(f: ExamFacts) {
  const d = examDate(f).join(" ").match(/20\d\d/) ?? f.advert.date.match(/20\d\d/);
  return d ? d[0] : "";
}

export function examSeoTitle(f: ExamFacts) {
  if (f.seoTitle) return f.seoTitle;
  const parts = [`${f.postsTotal.toLocaleString("en-IN")} Posts`, f.pattern ? "Exam Pattern" : "Eligibility", f.pastCutoffs ? "Cut-off" : "Dates"];
  return `${name(f)} ${year(f)}: ${parts.join(", ")}`;
}

export function examSeoDescription(f: ExamFacts) {
  const bits = [`${name(f)}: ${fmt(f.postsTotal)} posts (Advt ${f.advert.no}).`];
  const d = examDate(f).filter((x) => !/not announced/i.test(x));
  bits.push(d.length ? `Exam on ${d.join(", ")}.` : "Exam date awaited.");
  if (f.pattern) bits.push(`${f.pattern.total} marks, −${f.pattern.negative} per wrong answer.`);
  if (f.pastCutoffs) bits.push("Category-wise posts and past cut-offs.");
  else bits.push("Category-wise posts, eligibility and fee.");
  return bits.join(" ");
}

export function examFaqJsonLd(f: ExamFacts) {
  const qa: [string, string][] = [];
  const d = examDate(f);
  qa.push([`When is the ${f.title} exam?`, d.length && !/not announced/i.test(d.join()) ? `JKSSB has scheduled it for ${d.join(", ")}.` : "JKSSB has not announced the exam date yet."]);
  // Open merit seats: the "Total" table if there is one, else the sum of all tables.
  const totalTable = f.postTables.find((t) => t.label === "Total" || t.label === "All posts");
  const om = f.postTables.length ? (totalTable ? totalTable.counts[0] : f.postTables.reduce((s, t) => s + t.counts[0], 0)) : null;
  qa.push([`How many posts are there in ${f.title}?`, `${fmt(f.postsTotal)} posts under Advertisement ${f.advert.no}${om !== null ? `, of which ${fmt(om)} are open merit (OM)` : ""}.`]);
  if (f.pattern) {
    const p = f.pattern;
    qa.push([
      `What is the ${f.title} exam pattern?`,
      `${p.questions ? `${p.questions} objective questions, ` : ""}${p.total} marks${p.durationMin ? `, ${p.durationMin / 60} hours` : ""}, with ${p.negative} marks deducted for each wrong answer. Sections: ${p.sections.map(([s, n]) => `${s} (${n})`).join(", ")}.`,
    ]);
  }
  if (f.qualification?.length) qa.push([`What is the qualification for ${f.title}?`, f.qualification.map(([k, v]) => (k ? `${k}: ${v}` : v)).join(" ")]);
  if (f.age?.rows?.length) qa.push([`What is the age limit for ${f.title}?`, `As on ${f.age.asOn}: ${f.age.rows.map(([k, v]) => `maximum ${v} for ${k}`).join("; ")}${f.age.min ? `; minimum ${f.age.min}` : ""}.`]);
  if (f.fee?.length) qa.push([`What is the application fee for ${f.title}?`, f.fee.map(([k, v]) => `${v} for ${k}`).join(", ") + "."]);
  if (f.pastCutoffs) {
    const t = f.pastCutoffs.tables[0];
    const om = t.rows.find((r) => r[0] === "OM")?.[1];
    if (om !== undefined && om !== null)
      qa.push([`What was the last cut-off for ${f.title}?`, `In the last recruitment (${f.pastCutoffs.source}), the lowest open merit (OM) marks selected${f.pastCutoffs.tables.length > 1 ? ` for ${t.label}` : ""} were ${om} out of ${f.pastCutoffs.outOf}.`]);
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
