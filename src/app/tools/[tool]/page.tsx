import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RankPredictor } from "@/components/rank/RankPredictor";
import { CutoffCard } from "@/components/rank/CutoffCard";
import { expectedCutoffs } from "@/lib/rank";
import { getCutoffStats } from "@/lib/queries/rank";
import { OpensIn } from "@/components/rank/OpensIn";
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
