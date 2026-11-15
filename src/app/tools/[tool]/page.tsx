import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RankPredictor } from "@/components/rank/RankPredictor";
import { TelegramLink } from "@/components/TelegramLink";
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
    title: `${exam.fullName} Rank Predictor ${year} — Score Calculator`,
    description: `Calculate your ${exam.name} ${year} score with ${exam.negativePerWrong} negative marking and see your expected rank among ${exam.posts} posts. Free, no sign-up.`,
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
      q: "How is the rank estimated?",
      a: `We compare your score with scores shared by other aspirants and scale that to the roughly ${exam.appeared.toLocaleString("en-IN")} candidates who appeared. The range narrows as more people share. People who did well share more often, so your real rank is usually a little better than the estimate.`,
    },
    {
      q: "Is my data stored?",
      a: "Only your answer counts, score and category, with no name, phone or roll number. You can choose not to share and still see your score.",
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
    <div className="page-shell py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <p className="section-kicker">
            {exam.board} · Exam held{" "}
            {new Date(exam.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <h1 className="mt-2 text-[30px] leading-[1.1] sm:text-[40px]">
            {exam.name} {year} score &amp; rank predictor
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-7 text-[hsl(var(--muted))]">
            Enter how many you got right and wrong. You&apos;ll get your score instantly and an
            estimated rank based on scores shared by other aspirants.
          </p>

          <div className="mt-6">
            <RankPredictor
              exam={{
                examKey: exam.examKey,
                name: exam.name,
                totalQuestions: exam.totalQuestions,
                marksPerCorrect: exam.marksPerCorrect,
                negativePerWrong: exam.negativePerWrong,
                posts: exam.posts,
                appeared: exam.appeared,
                categories: exam.categories,
                answerKeyReleased: exam.answerKeyReleased,
                patternVerified: exam.patternVerified,
              }}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-4">
            <p className="section-kicker">Marking scheme</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center font-mono-num">
              <div className="rounded-lg bg-[hsl(var(--panel-soft))] p-2">
                <dt className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted))]">Qs</dt>
                <dd className="text-lg font-semibold">{exam.totalQuestions}</dd>
              </div>
              <div className="rounded-lg bg-[hsl(var(--panel-soft))] p-2">
                <dt className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted))]">Right</dt>
                <dd className="text-lg font-semibold text-[hsl(var(--success))]">+{exam.marksPerCorrect}</dd>
              </div>
              <div className="rounded-lg bg-[hsl(var(--panel-soft))] p-2">
                <dt className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted))]">Wrong</dt>
                <dd className="text-lg font-semibold text-[hsl(var(--accent))]">−{exam.negativePerWrong}</dd>
              </div>
            </dl>
            {!exam.patternVerified && (
              <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--muted))]">
                Based on the published pattern. We&apos;ll re-check it against the official answer key.
              </p>
            )}
          </div>

          <div className="surface-card p-4">
            <p className="section-kicker">Next for {exam.name}</p>
            <p className="mt-2 text-sm leading-6">
              {exam.answerKeyReleased
                ? "The answer key is out. Check your answers against it and update your counts here."
                : "Answer key not released yet. We'll post it the moment JKSSB does."}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <TelegramLink />
              <Link href={`/exams/${exam.examSlug}`} className="pill-link justify-center">
                {exam.name} exam hub →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-12 max-w-2xl">
        <h2 className="rule-double pt-3 text-[22px]">Questions</h2>
        <div className="mt-3 divide-y">
          {faqs.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-[hsl(var(--muted))] transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
