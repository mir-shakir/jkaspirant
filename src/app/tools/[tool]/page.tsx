import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RankPredictor } from "@/components/rank/RankPredictor";
import { CutoffCard } from "@/components/rank/CutoffCard";
import { expectedCutoffs } from "@/lib/rank";
import { getCutoffStats } from "@/lib/queries/rank";
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
