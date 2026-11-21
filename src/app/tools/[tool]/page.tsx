import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RankPredictor } from "@/components/rank/RankPredictor";
import { CutoffCard } from "@/components/rank/CutoffCard";
import { expectedCutoffs } from "@/lib/rank";
import { getCutoffStats } from "@/lib/queries/rank";
import { OpensIn } from "@/components/rank/OpensIn";
import { ScoreSpread, SharedPerDay } from "@/components/rank/ResultCharts";
import { SavedRank } from "@/components/rank/SavedRank";
import { getRankSnapshot, type RankSnapshot } from "@/content/rank-snapshots";
import { predict } from "@/lib/rank";
import { TelegramNudge } from "@/components/TelegramNudge";
import { CATEGORIES, getExamFacts } from "@/content/exams";
import { GroupList, PageHeader, Row } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getRankExam, rankExams } from "@/config/rank-predictor";

interface PageProps {
  params: { tool: string };
}

export function generateStaticParams() {
  return rankExams.map((e) => ({ tool: e.toolSlug }));
}

export const dynamicParams = false;

// Rebuilt at most every 15 minutes so the expected cut-offs stay fresh while the
// database sees one read per refresh, however many people open the page.
export const revalidate = 900;

export function generateMetadata({ params }: PageProps): Metadata {
  const exam = getRankExam(params.tool);
  if (!exam) return {};
  const year = exam.examDate.slice(0, 4);
  const snap = exam.closedOn ? getRankSnapshot(exam.examKey) : null;
  if (snap) {
    const om = expectedCutoffs(exam, snap, snap.catCounts).find((c) => c.category === "OM")?.cutoff;
    return buildMetadata({
      title: `${exam.board} ${exam.name} Expected Cut-off ${year}: Category-wise, From ${snap.total} Candidate Scores`,
      description: `Expected ${exam.fullName} ${year} cut-off for every category, from ${snap.total} scores checked against the provisional answer key: open merit about ${om} out of ${exam.totalQuestions * exam.marksPerCorrect}. Score spread, category medians and toppers. The rank predictor is now closed.`,
      canonicalPath: `/tools/${exam.toolSlug}`,
      keywords: [
        `${exam.board} ${exam.name} expected cut off ${year}`,
        `${exam.name} cut off ${year} category wise`,
        `${exam.fullName} cut off`,
        `${exam.board} ${exam.name} rank predictor`,
      ],
    });
  }
  if (!exam.isOpen) {
    const opens = new Date(exam.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
    return buildMetadata({
      title: `${exam.fullName} Rank Predictor ${year} (Opens ${opens})`,
      description: `The ${exam.name} ${year} rank predictor opens on ${opens}, after the exam. Enter your right and wrong answers to get your score out of ${exam.totalQuestions * exam.marksPerCorrect} and expected rank for the ${exam.posts} posts, category-wise.`,
      canonicalPath: `/tools/${exam.toolSlug}`,
      keywords: [`${exam.fullName} rank predictor ${year}`, `${exam.fullName} expected cut off ${year}`, `${exam.fullName} answer key ${year}`],
    });
  }
  return buildMetadata({
    title: `${exam.fullName} Expected Cut-off ${year} & Rank Predictor`,
    description: `Expected ${exam.name} ${year} cut-off for every category (OM, SC, ST, OBC, RBA, EWS and more), plus your score and expected rank for the ${exam.posts} posts. Free, no sign-up.`,
    canonicalPath: `/tools/${exam.toolSlug}`,
    keywords: [
      `${exam.board} ${exam.name} rank predictor`,
      `${exam.board} ${exam.name} score calculator`,
      `${exam.board} ${exam.name} expected cut off ${year}`,
      `${exam.board} ${exam.name} answer key ${year}`,
    ],
  });
}

export default async function RankToolPage({ params }: PageProps) {
  const exam = getRankExam(params.tool);
  if (!exam) notFound();

  const year = exam.examDate.slice(0, 4);
  const snap = exam.closedOn ? getRankSnapshot(exam.examKey) : null;
  if (snap) return <Closed exam={exam} year={year} snap={snap} />;
  if (!exam.isOpen) return <NotOpenYet exam={exam} year={year} />;
  const cutoffData = await getCutoffStats(exam.examKey);
  const cutoffs = cutoffData ? expectedCutoffs(exam, cutoffData.stats, cutoffData.catCounts) : null;
  const breadcrumbItems = [
    { name: "Tools", path: "/tools" },
    { name: `${exam.name} rank predictor`, path: `/tools/${exam.toolSlug}` },
  ];

  const faqs = [
    {
      q: `How is the ${exam.name} score calculated?`,
      a: `+${exam.marksPerCorrect} for each correct answer and −${exam.negativePerWrong} for each wrong answer. Unattempted questions carry no marks. The paper has ${exam.totalQuestions} questions.`,
    },
    {
      q: "Can I change my score?",
      a: "Each phone can save one score and correct it once, so count carefully. You can update it once more when the official answer key is out.",
    },
    {
      q: "How can you predict a rank before the result?",
      a: `We start from how scores have been spread in past JKSSB papers and the cut-off range expected for this one. As aspirants share their scores we check whether this paper ran easier or harder and adjust. It is an estimate and it gets sharper as more people share.`,
    },
    {
      q: "What do you save about me?",
      a: "Your answer counts, score and category, linked to this phone so you can see your rank again later and so each person counts once. No phone number or roll number. If you join the leaderboard we save your name, but other people only ever see the first two letters of each part, like Sh*** Mi***.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        kicker={`${exam.board} ${exam.name} ${year}`}
        title="What rank will you get?"
        lede={exam.answerKeyReleased ? "Check your answers against the official key, then count your right and wrong." : "Count your right and wrong answers. We'll do the rest."}
      />

      {exam.answerKeyReleased && exam.answerKeyUrl && (
        <GroupList className="mt-5">
          <Row href={exam.answerKeyUrl} external title="Official answer key (PDF)" sub="Provisional key for Series A, B, C and D" />
        </GroupList>
      )}

      <div className="mt-5">
        <RankPredictor
          exam={{
            examKey: exam.examKey,
            name: exam.name,
            totalQuestions: exam.totalQuestions,
            marksPerCorrect: exam.marksPerCorrect,
            negativePerWrong: exam.negativePerWrong,
            posts: exam.posts,
            openSeats: exam.openSeats,
            reserved: exam.reserved,
            registered: exam.registered,
            appeared: exam.appeared,
            categories: exam.categories,
            model: exam.model,
            answerKeyReleased: exam.answerKeyReleased,
          }}
          aboveBoard={
            cutoffs && cutoffData ? (
              <CutoffCard
                examLabel={`${exam.board} ${exam.name} ${year}`}
                cutoffs={cutoffs}
                shared={cutoffData.stats.total}
                updatedAt={new Date()}
                outOf={exam.totalQuestions * exam.marksPerCorrect}
              />
            ) : null
          }
        />
      </div>

      <GroupList className="mt-8">
        <Row
          href={`/exams/${exam.examSlug}`}
          title={`${exam.name} exam page`}
          sub={exam.answerKeyReleased ? "Answer key, objections and what comes next" : "Answer key awaited. We'll post it the day it's out."}
        />
      </GroupList>

      <section className="mt-9">
        <h2 className="text-[21px]">Common questions</h2>
        <div className="mt-1 divide-y border-b">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 py-2 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-[hsl(var(--muted))] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-[14.5px] leading-6 text-[hsl(var(--muted))]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Before the exam: nothing to enter yet. Say clearly that the tool is locked,
 * when it opens and how it will work, and give what's useful today.
 */
function NotOpenYet({ exam, year }: { exam: NonNullable<ReturnType<typeof getRankExam>>; year: string }) {
  const facts = getExamFacts(exam.examSlug);
  const totals = facts?.postTables.find((t) => t.label === "All posts" || t.label === "Total") ?? facts?.postTables[0];
  const admit = facts?.dates.find(([k]) => k === "Admit card")?.[1];
  const max = exam.totalQuestions * exam.marksPerCorrect;
  const opens = new Date(exam.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const breadcrumbItems = [
    { name: "Tools", path: "/tools" },
    { name: `${exam.name} rank predictor`, path: `/tools/${exam.toolSlug}` },
  ];
  const faqs = [
    {
      q: `When does the ${exam.name} rank predictor open?`,
      a: `On ${opens}, after the exam ends. Until then there is nothing to enter, because the answer key isn't out.`,
    },
    {
      q: `How is the ${exam.name} score calculated?`,
      a: `+${exam.marksPerCorrect} for each correct answer and −${exam.negativePerWrong} for each wrong answer, out of ${max}. Unattempted questions carry no marks. The paper has ${exam.totalQuestions} questions.`,
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const steps = [
    "Check your answers against the official answer key when it comes out.",
    "Enter how many you got right and wrong.",
    `See your score out of ${max} and your expected rank, overall and in your category.`,
  ];
  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />

      <section className="rounded-3xl bg-[hsl(var(--focus))] p-5 text-[hsl(var(--focus-fg))] sm:p-6" aria-labelledby="locked-title">
        <p className="flex items-center gap-2 font-mono-num text-[11px] uppercase tracking-[0.16em] opacity-75">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <rect x="4" y="9" width="12" height="8" rx="2" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          {exam.board} {exam.name} {year} · locked
        </p>
        <h1 id="locked-title" className="mt-3 text-[30px] leading-[1.1] sm:text-[36px]">
          Rank predictor opens {opens}
        </h1>
        <p className="mt-2 text-[14.5px] opacity-80">After the exam ends. There&apos;s nothing to enter until then.</p>
        <p className="mt-4 inline-flex rounded-full bg-[hsl(var(--focus-fg)/0.12)] px-3 py-1.5 text-[13.5px] font-semibold">
          <OpensIn iso={exam.examDate} />
        </p>
      </section>

      <section className="surface-card mt-5 p-4" aria-labelledby="how">
        <h2 id="how" className="text-[17px] leading-tight">
          How it will work
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14.5px]">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="surface-card mt-4 p-4" aria-labelledby="know">
        <h2 id="know" className="text-[17px] leading-tight">
          Good to know now
        </h2>
        <dl className="mt-3 divide-y text-[14.5px]">
          {(
            [
              ["Exam", new Date(exam.examDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })],
              ...(admit ? [["Admit card", admit]] : []),
              ["Marking", `+${exam.marksPerCorrect} right · −${exam.negativePerWrong} wrong · out of ${max} (${exam.totalQuestions} questions)`],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k} className="flex gap-3 py-2 first:pt-0 last:pb-0">
              <dt className="w-24 shrink-0 text-[hsl(var(--muted))]">{k}</dt>
              <dd className="min-w-0 flex-1">{v}</dd>
            </div>
          ))}
        </dl>
        {totals && (
          <>
            <p className="mb-2 mt-4 text-[13px] text-[hsl(var(--muted))]">{exam.posts} posts by category</p>
            <dl className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((c, i) => (
                <div key={c} className="rounded-xl bg-[hsl(var(--panel-soft))] px-2 py-1.5 text-center">
                  <dt className="text-[11px] text-[hsl(var(--muted))]">{c}</dt>
                  <dd className="font-mono-num text-[17px] font-semibold leading-snug">{totals.counts[i]}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <TelegramNudge className="mt-4" title="Get a message when it opens" sub="Exam updates, the answer key and this predictor, on Telegram" />

      <GroupList className="mt-6">
        <Row href={`/exams/${exam.examSlug}`} title={`${exam.fullName} exam page`} sub="Pattern, syllabus, selection steps and official notices" />
      </GroupList>

      <section className="mt-9">
        <h2 className="text-[21px]">Common questions</h2>
        <div className="mt-1 divide-y border-b">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 py-2 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-[hsl(var(--muted))] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-[14.5px] leading-6 text-[hsl(var(--muted))]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * After a rank tool closes: say clearly that it ran and is closed, then give the
 * answer people search for (the expected cut-off by category) from the frozen
 * snapshot, with the data behind it. Nothing here reads the database except the
 * visitor's own saved score.
 */
function Closed({ exam, year, snap }: { exam: NonNullable<ReturnType<typeof getRankExam>>; year: string; snap: RankSnapshot }) {
  const max = exam.totalQuestions * exam.marksPerCorrect;
  const cutoffs = expectedCutoffs(exam, snap, snap.catCounts);
  const omPred = predict(exam, 0, { total: snap.total, histogram: snap.histogram, above: 0, catAbove: 0, catTotal: snap.catCounts.OM ?? 0 }, "OM");
  const om = cutoffs.find((c) => c.category === "OM")?.cutoff ?? omPred.cutoff.mid;
  const d = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
    new Date(iso).toLocaleDateString("en-IN", { ...opts, timeZone: "Asia/Kolkata" });
  const ranFrom = d(exam.examDate);
  const ranTo = d(snap.lastScoreAt, { day: "numeric", month: "short", year: "numeric" });
  const fmt = (n: number) => n.toLocaleString("en-IN");
  const breadcrumbItems = [
    { name: "Tools", path: "/tools" },
    { name: `${exam.name} expected cut-off`, path: `/tools/${exam.toolSlug}` },
  ];
  const sorted = [...exam.categories].sort((a, b) => (snap.catCounts[b] ?? 0) - (snap.catCounts[a] ?? 0));

  const faqs = [
    {
      q: `What is the expected ${exam.name} cut-off ${year}?`,
      a: `Our final estimate for open merit (OM) is about ${om} out of ${max}, most likely between ${omPred.cutoff.low} and ${omPred.cutoff.high}. Category estimates: ${cutoffs
        .filter((c) => c.category !== "OM")
        .map((c) => `${c.category} ${c.cutoff}`)
        .join(", ")}. These come from ${snap.total} scores checked against the provisional answer key. They are estimates, not official cut-offs.`,
    },
    {
      q: `Is the ${exam.name} rank predictor still open?`,
      a: `No. It ran from ${ranFrom} to ${ranTo} and took ${snap.total} scores. New scores are no longer accepted. If you saved a score on this phone, you can still see it here.`,
    },
    {
      q: `When will the official ${exam.name} cut-off and result come out?`,
      a: `JKSSB has not announced a date. The final answer key comes first, then the result and the official cut-offs. We post each one the day JKSSB publishes it.`,
    },
    {
      q: "How were these estimates made?",
      a: `Aspirants entered their right and wrong answers after checking them against the provisional key. We combined how those ${snap.total} scores spread with the ${exam.posts} posts by category and the number of candidates (about ${fmt(exam.registered)} registered), allowing for the fact that people who share scores tend to have done well. ${snap.excludedAsFake} obviously fake scores were left out.`,
    },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${exam.fullName} ${year}: scores shared by candidates`,
      description: `${snap.total} self-reported scores for the ${exam.fullName} exam of ${d(exam.examDate, { day: "numeric", month: "long", year: "numeric" })}, with expected category-wise cut-offs. Estimates, not official.`,
      creator: { "@type": "Organization", name: "JK Aspirant" },
      temporalCoverage: `${exam.examDate}/${snap.lastScoreAt.slice(0, 10)}`,
      isAccessibleForFree: true,
    },
  ];

  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />

      <section className="rounded-3xl bg-[hsl(var(--focus))] p-5 text-[hsl(var(--focus-fg))] sm:p-6" aria-labelledby="closed-title">
        <p className="flex items-center gap-2 font-mono-num text-[11px] uppercase tracking-[0.16em] opacity-75">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <rect x="4" y="9" width="12" height="8" rx="2" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          Rank predictor closed
        </p>
        <h1 id="closed-title" className="mt-3 text-[30px] leading-[1.1] sm:text-[36px]">
          {exam.board} {exam.name} expected cut-off {year}
        </h1>
        <p className="mt-2 text-[14.5px] opacity-80">
          Our rank predictor ran here from {ranFrom} to {ranTo}. {fmt(snap.total)} aspirants shared their scores. It no longer takes new scores; these are the
          final estimates.
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-2">
          {(
            [
              [fmt(snap.total), "scores shared"],
              [String(om), `OM cut-off (of ${max})`],
              [String(snap.median), "median score"],
            ] as [string, string][]
          ).map(([v, k]) => (
            <div key={k} className="rounded-2xl bg-[hsl(var(--focus-fg)/0.1)] px-3 py-2">
              <dd className="font-mono-num text-[22px] font-semibold leading-tight">{v}</dd>
              <dt className="text-[11.5px] leading-tight opacity-75">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <SavedRank
        examKey={exam.examKey}
        exam={{
          totalQuestions: exam.totalQuestions,
          marksPerCorrect: exam.marksPerCorrect,
          negativePerWrong: exam.negativePerWrong,
          posts: exam.posts,
          appeared: exam.appeared,
          model: exam.model,
          openSeats: exam.openSeats,
          reserved: exam.reserved,
        }}
      />

      <div className="mt-4">
        <CutoffCard examLabel={`${exam.board} ${exam.name} ${year}`} cutoffs={cutoffs} shared={snap.total} updatedAt={new Date(snap.lastScoreAt)} outOf={max} />
        <p className="mt-2 text-[13px] leading-5 text-[hsl(var(--muted))]">
          Open merit most likely between {omPred.cutoff.low} and {omPred.cutoff.high}. Based on the provisional answer key; the final key may shift scores slightly.
          Official cut-offs come with the result.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="spread">
        <h2 id="spread" className="text-[21px]">
          How the {fmt(snap.total)} scores spread
        </h2>
        <p className="mb-3 mt-1 text-[14.5px] text-[hsl(var(--muted))]">
          Half scored {snap.median} or more; the top 10% scored {snap.p90} or more. On average people got {snap.avgCorrect} right and {snap.avgWrong} wrong out
          of {exam.totalQuestions}.
        </p>
        <ScoreSpread histogram={snap.histogram} cutoff={om} from={20} to={110} />
      </section>

      <section className="mt-8" aria-labelledby="by-category">
        <h2 id="by-category" className="text-[21px]">
          By category
        </h2>
        <div className="surface-card mt-3 overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b text-left text-[12px] text-[hsl(var(--muted))]">
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 text-right font-medium">Scores</th>
                <th className="px-3 py-2 text-right font-medium">Median</th>
                <th className="px-3 py-2 text-right font-medium">Cut-off</th>
                <th className="px-3 py-2 text-right font-medium">Posts</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((c) => {
                const co = cutoffs.find((x) => x.category === c);
                return (
                  <tr key={c}>
                    <td className="px-3 py-2 font-medium">{c}</td>
                    <td className="px-3 py-2 text-right font-mono-num">{fmt(snap.catCounts[c] ?? 0)}</td>
                    <td className="px-3 py-2 text-right font-mono-num">{snap.catMedian[c] !== undefined ? Math.round(snap.catMedian[c] * 10) / 10 : "–"}</td>
                    <td className="px-3 py-2 text-right font-mono-num">{co?.cutoff ?? "–"}</td>
                    <td className="px-3 py-2 text-right font-mono-num">{co?.seats ?? "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12.5px] text-[hsl(var(--muted))]">Median and cut-off out of {max}. OM posts are open merit, for everyone.</p>
      </section>

      <section className="mt-8" aria-labelledby="per-day">
        <h2 id="per-day" className="text-[21px]">
          When people shared
        </h2>
        <p className="mb-3 mt-1 text-[14.5px] text-[hsl(var(--muted))]">
          {fmt(snap.byDay[0][1])} on exam day alone. {fmt(snap.fromAnswerKey)} of the {fmt(snap.total)} were checked against the official key, from{" "}
          {fmt(snap.networks)} different networks.
        </p>
        <SharedPerDay days={snap.byDay} />
      </section>

      <section className="mt-8" aria-labelledby="toppers">
        <h2 id="toppers" className="text-[21px]">
          Top shared scores
        </h2>
        <p className="mb-3 mt-1 text-[14.5px] text-[hsl(var(--muted))]">
          {fmt(snap.onLeaderboard)} aspirants chose to show their score. Names are shortened for privacy.
        </p>
        <ol className="surface-card divide-y">
          {snap.board.map((b, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-[14.5px]">
              <span className="w-5 font-mono-num text-[hsl(var(--muted))]">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{b.name}</span>
              <span className="text-[12.5px] text-[hsl(var(--muted))]">{b.category}</span>
              <span className="w-14 text-right font-mono-num font-semibold">{b.score}</span>
            </li>
          ))}
        </ol>
      </section>

      <GroupList className="mt-8">
        {exam.answerKeyUrl && <Row href={exam.answerKeyUrl} external title="Provisional answer key (PDF)" sub="Series A, B, C and D" />}
        <Row href={`/exams/${exam.examSlug}`} title={`${exam.fullName} exam page`} sub="What's official so far, posts, pattern and notices" />
        <Row href="/notifications/jkssb-faa-exam-integrity-press-note-2026" title="JKSSB press note on the exam" sub="19 November 2026" />
        {rankExams
          .filter((t) => t.toolSlug !== exam.toolSlug && !t.closedOn)
          .map((t) => (
            <Row key={t.toolSlug} href={`/tools/${t.toolSlug}`} title={`${t.fullName} rank predictor`} sub={t.isOpen ? "Open now" : `Opens ${t.opensOn ?? "after the exam"}`} />
          ))}
      </GroupList>

      <TelegramNudge className="mt-4" title="Get the result the day it's out" sub="Final key, result and cut-offs, on Telegram" />

      <section className="mt-9">
        <h2 className="text-[21px]">Common questions</h2>
        <div className="mt-1 divide-y border-b">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 py-2 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-[hsl(var(--muted))] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-[14.5px] leading-6 text-[hsl(var(--muted))]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
