import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RankPredictor } from "@/components/rank/RankPredictor";
import { TelegramLink } from "@/components/TelegramLink";
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

export function generateMetadata({ params }: PageProps): Metadata {
  const exam = getRankExam(params.tool);
  if (!exam) return {};
  const year = exam.examDate.slice(0, 4);
  return buildMetadata({
    title: `${exam.fullName} Rank Predictor ${year} — Score & Expected Rank`,
    description: `Enter your correct and wrong answers to get your ${exam.name} ${year} score and expected rank for the ${exam.posts} posts. Free, no sign-up.`,
    canonicalPath: `/tools/${exam.toolSlug}`,
    keywords: [
      `${exam.board} ${exam.name} rank predictor`,
      `${exam.board} ${exam.name} score calculator`,
      `${exam.board} ${exam.name} expected cut off ${year}`,
      `${exam.board} ${exam.name} answer key ${year}`,
    ],
  });
}

export default function RankToolPage({ params }: PageProps) {
  const exam = getRankExam(params.tool);
  if (!exam) notFound();

  const year = exam.examDate.slice(0, 4);
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
      q: "How can you predict a rank before the result?",
      a: `We start from how scores have been spread in past JKSSB papers and the cut-off range expected for this one. As aspirants share their scores we check whether this paper ran easier or harder and adjust. The answer is always a range, and it narrows as more people share.`,
    },
    {
      q: "Is my data stored?",
      a: "Only your answer counts, score and category. No name, phone or roll number. You can untick sharing and still get your estimate.",
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
        lede="Count your right and wrong answers. We'll do the rest."
      />

      <div className="mt-5">
        <RankPredictor
          exam={{
            examKey: exam.examKey,
            name: exam.name,
            totalQuestions: exam.totalQuestions,
            marksPerCorrect: exam.marksPerCorrect,
            negativePerWrong: exam.negativePerWrong,
            posts: exam.posts,
            registered: exam.registered,
            appeared: exam.appeared,
            categories: exam.categories,
            model: exam.model,
          }}
        />
      </div>

      <GroupList className="mt-8">
        <Row
          href={`/exams/${exam.examSlug}`}
          title={`${exam.name} exam page`}
          sub={exam.answerKeyReleased ? "Answer key is out" : "Answer key awaited. We'll post it the day it's out."}
        />
      </GroupList>
      <TelegramLink className="mt-3 w-full justify-center" />

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
