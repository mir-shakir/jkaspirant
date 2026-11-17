import { GroupList, Row, Section } from "@/components/ui";
import { CATEGORIES, type ExamFacts } from "@/content/exams";

// Renders the verified facts of one exam: answer first (at a glance), then the
// details people come for, long text collapsed. No links inside text: every
// link is a Row.

const fmt = (n: number) => n.toLocaleString("en-IN");
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`surface-card p-4 ${className}`}>{children}</div>;
}

function Pairs({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y text-[14.5px]">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex gap-3 py-2 first:pt-0 last:pb-0">
          {k && <dt className="w-[38%] shrink-0 text-[hsl(var(--muted))] sm:w-44">{cap(k)}</dt>}
          <dd className="min-w-0 flex-1">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Categories down the side, one column per table; fits a phone screen. */
function CategoryTable({
  columns,
  values,
  unit,
}: {
  columns: string[];
  values: (string | number | null)[][]; // [column][category]
  unit?: string;
}) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b text-left text-[12px] text-[hsl(var(--muted))]">
            <th className="px-3 py-2 font-medium">Category</th>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-right font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {CATEGORIES.map((cat, i) => (
            <tr key={cat}>
              <td className="px-3 py-2 font-medium">{cat}</td>
              {values.map((col, j) => (
                <td key={j} className="px-3 py-2 text-right font-mono-num">
                  {col[i] === null || col[i] === undefined ? "–" : typeof col[i] === "number" ? fmt(col[i] as number) : col[i]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {unit && <p className="border-t px-3 py-2 text-[12px] text-[hsl(var(--muted))]">{unit}</p>}
    </div>
  );
}

/** True when a "29 Nov 2026 ..." style value is today or later (IST). Undated text counts as current. */
function upcoming(value: string) {
  const m = value.match(/^(\d{1,2} [A-Z][a-z]{2} \d{4})/);
  if (!m) return true;
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  today.setHours(0, 0, 0, 0);
  return new Date(m[1]) >= today;
}

export function AtAGlance({ facts }: { facts: ExamFacts }) {
  const lastDate = facts.dates.find(([k, v]) => (k === "Last date to apply" || k === "Applications open") && upcoming(v));
  const examDate = facts.dates.filter(([k]) => k.startsWith("Exam"));
  const rows: [string, string][] = [["Posts", fmt(facts.postsTotal)]];
  for (const [k, v] of examDate) rows.push([k, v]);
  if (lastDate) rows.push(lastDate);
  if (facts.pay) rows.push(["Pay", facts.pay]);
  if (facts.pattern) rows.push(["Paper", `${facts.pattern.total} marks · −${facts.pattern.negative} per wrong answer`]);
  rows.push(["Advertisement", `${facts.advert.no}, dated ${facts.advert.date}${facts.advert.items ? ` · Item ${facts.advert.items}` : ""}`]);
  return (
    <Card className="mt-5">
      <h2 className="mb-3 text-[17px] leading-tight">At a glance</h2>
      <Pairs rows={rows} />
      {facts.status && <p className="mt-3 border-t pt-3 text-[14px]">{facts.status}</p>}
    </Card>
  );
}

export function ExamFactsView({ facts }: { facts: ExamFacts }) {
  const p = facts.pattern;
  const sectionTotal = p ? p.sections.reduce((s, [, n]) => s + n, 0) : 0;

  return (
    <>
      <Section title="Important dates" id="dates">
        <Card>
          <Pairs rows={facts.dates} />
        </Card>
      </Section>

      <Section title={`Posts: ${fmt(facts.postsTotal)}`} id="posts">
        {facts.postsNote && <p className="mb-2 text-[14px] text-[hsl(var(--muted))]">{facts.postsNote}</p>}
        {facts.postList && (
          <Card className="mb-3">
            <Pairs rows={facts.postList.map(([k, n]) => [k, fmt(n)])} />
          </Card>
        )}
        {facts.postTables.length > 0 && (
          <CategoryTable columns={facts.postTables.map((t) => t.label)} values={facts.postTables.map((t) => t.counts)} />
        )}
      </Section>

      <Section title="Who can apply" id="eligibility">
        <Card>
          <Pairs
            rows={[
              ...(facts.qualification ?? []).map(([k, v]): [string, string] => [k ? `Qualification (${k})` : "Qualification", v]),
              ...(facts.age
                ? [[`Age (as on ${facts.age.asOn})`, [facts.age.min ? `Minimum ${facts.age.min}` : "", ...(facts.age.rows ?? []).map(([k, v]) => `maximum ${v} (${k})`)].filter(Boolean).join(" · ")] as [string, string]]
                : []),
              ...(facts.fee ? [["Application fee", facts.fee.map(([k, v]) => `${v} (${k})`).join(" · ")] as [string, string]] : []),
            ]}
          />
          {facts.age?.note && <p className="mt-3 border-t pt-3 text-[13px] text-[hsl(var(--muted))]">{facts.age.note}</p>}
        </Card>
      </Section>

      <Section title="Exam pattern" id="pattern">
        {p ? (
          <>
            <p className="mb-2 text-[14.5px]">
              {[p.questions && `${p.questions} questions`, `${p.total} marks`, p.durationMin && `${p.durationMin / 60} hours`, `−${p.negative} for each wrong answer`].filter(Boolean).join(" · ")}
            </p>
            <div className="surface-card overflow-hidden">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b text-left text-[12px] text-[hsl(var(--muted))]">
                    <th className="px-3 py-2 font-medium">Section</th>
                    <th className="px-3 py-2 text-right font-medium">{p.sectionUnit === "questions" ? "Questions" : "Marks"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {p.sections.map(([name, n]) => (
                    <tr key={name}>
                      <td className="px-3 py-2">{name}</td>
                      <td className="px-3 py-2 text-right font-mono-num">{n}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right font-mono-num">{sectionTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[13px] text-[hsl(var(--muted))]">Objective multiple choice, OMR sheet, questions in English.</p>
          </>
        ) : (
          <Card>
            <p className="text-[14.5px]">{facts.syllabusNote === "To be notified" ? "JKSSB hasn't published the syllabus yet. It usually comes out separately, before the exam date is announced." : facts.syllabusNote}</p>
            {facts.negativeText && <p className="mt-2 text-[14px] text-[hsl(var(--muted))]">Negative marking: {facts.negativeText.toLowerCase()}.</p>}
          </Card>
        )}
      </Section>

      {(facts.selection?.length || facts.physical || facts.extras.length > 0 || facts.weightage) && (
        <Section title="How selection works" id="selection">
          <Card>
            {facts.selection && (
              <ol className="list-decimal space-y-1.5 pl-5 text-[14.5px]">
                {facts.selection.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
            {facts.extras.length > 0 && (
              <div className={facts.selection ? "mt-3 border-t pt-3" : ""}>
                <Pairs rows={facts.extras} />
              </div>
            )}
            {facts.weightage && (
              <div className="mt-3 border-t pt-3">
                <p className="mb-2 text-[13px] text-[hsl(var(--muted))]">Marks out of 100 by cadre</p>
                <Pairs rows={facts.weightage} />
              </div>
            )}
          </Card>
          {facts.physical && (
            <details className="group mt-3 border-y">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                Physical standards (PST and PET)
                <span className="text-xl leading-none text-[hsl(var(--muted))] transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-4">
                <Pairs rows={facts.physical.map(([k, v]) => [k.replace(/_/g, " ").replace("PST", "Standard test,").replace("PET", "Endurance test,"), v])} />
              </div>
            </details>
          )}
        </Section>
      )}

      {facts.pastCutoffs && (
        <Section title="Past cut-offs" id="cut-offs">
          <p className="mb-2 text-[14px] text-[hsl(var(--muted))]">
            Lowest marks selected in each category, out of {facts.pastCutoffs.outOf}. From the {facts.pastCutoffs.source.replace(/^Final/, "final")}.
          </p>
          <CategoryTable
            columns={facts.pastCutoffs.tables.map((t) => t.label)}
            values={facts.pastCutoffs.tables.map((t) => CATEGORIES.map((c) => t.rows.find((r) => r[0] === c)?.[1] ?? null))}
          />
          {facts.pastCutoffs.tables.some((t) => t.rows.some((r) => r[2] !== null)) && (
            <details className="group mt-3 border-y">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                Women&apos;s list cut-offs
                <span className="text-xl leading-none text-[hsl(var(--muted))] transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-4">
                <CategoryTable
                  columns={facts.pastCutoffs.tables.map((t) => t.label)}
                  values={facts.pastCutoffs.tables.map((t) => CATEGORIES.map((c) => t.rows.find((r) => r[0] === c)?.[2] ?? null))}
                />
              </div>
            </details>
          )}
          {facts.pastCutoffs.note && <p className="mt-2 text-[13px] text-[hsl(var(--muted))]">{facts.pastCutoffs.note}</p>}
        </Section>
      )}

      <Section title="Official documents" id="documents">
        <GroupList>
          {facts.docs.map((d) => (
            <Row key={d.url} href={d.url} external title={d.label} sub="jkssb.nic.in" />
          ))}
          {facts.pastCutoffs && <Row href={facts.pastCutoffs.pdf} external title="Past final selection list (PDF)" sub="jkssb.nic.in" />}
          {facts.papers.map((d) => (
            <Row key={d.url} href={d.url} external title={`Previous paper: ${d.title}`} sub="jkssb.nic.in" />
          ))}
          <Row href={`/contact?page=${encodeURIComponent(`/exams/${facts.slug}`)}`} title="Contact us" sub="Questions or corrections about this page" />
        </GroupList>
        <p className="mt-3 text-[12.5px] text-[hsl(var(--muted))]">
          Checked against the official JKSSB documents on {new Date(facts.checked).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. If JKSSB issues a change, the notice wins.
        </p>
      </Section>
    </>
  );
}
