# Phase 1 — Core Exam Pages (SSG)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all public-facing exam pages with Static Site Generation — exams index, exam overview, syllabus, previous papers, cut-offs, and important dates — all pulling data from Supabase at build time.

**Architecture:** Each exam page uses `generateStaticParams` for SSG. Data is fetched server-side using the Supabase service role client. Pages are server components (no `"use client"`). Breadcrumbs and JSON-LD are rendered on every nested page. Each page exports `generateMetadata` for SEO.

**Tech Stack:** Next.js 14 (App Router, SSG), TypeScript, Tailwind CSS, Supabase JS SDK

**Depends on:** Phase 1 — Foundation plan must be completed first.

---

## File Structure

```
src/
├── app/
│   └── exams/
│       ├── page.tsx                          # /exams index
│       └── [slug]/
│           ├── page.tsx                      # /exams/[slug] overview
│           ├── syllabus/
│           │   └── page.tsx                  # /exams/[slug]/syllabus
│           ├── previous-papers/
│           │   └── page.tsx                  # /exams/[slug]/previous-papers
│           ├── cut-offs/
│           │   └── page.tsx                  # /exams/[slug]/cut-offs
│           └── important-dates/
│               └── page.tsx                  # /exams/[slug]/important-dates
├── components/
│   ├── Breadcrumb.tsx
│   ├── SyllabusAccordion.tsx
│   ├── CutoffTable.tsx
│   ├── PapersList.tsx
│   ├── DateTimeline.tsx
│   └── ExamSubNav.tsx                        # Tab navigation between exam sub-pages
└── lib/
    └── queries/
        └── exams.ts                          # All Supabase queries for exam data
```

---

### Task 1: Exam Data Queries

**Files:**
- Create: `src/lib/queries/exams.ts`

- [ ] **Step 1: Create all exam-related Supabase query functions**

Create `src/lib/queries/exams.ts`:
```typescript
import { createServerClient } from "@/lib/supabase/server";
import type {
  Exam,
  SyllabusSection,
  Paper,
  Cutoff,
  ExamDate,
} from "@/lib/types/database";

export async function getAllExams(): Promise<Exam[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("is_active", true)
    .order("title");

  if (error) throw new Error(`Failed to fetch exams: ${error.message}`);
  return data || [];
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch exam: ${error.message}`);
  }
  return data;
}

export async function getExamSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("exams")
    .select("slug")
    .eq("is_active", true);

  if (error) throw new Error(`Failed to fetch exam slugs: ${error.message}`);
  return (data || []).map((row) => row.slug);
}

export async function getSyllabusSections(
  examId: string
): Promise<SyllabusSection[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("syllabus_sections")
    .select("*")
    .eq("exam_id", examId)
    .order("sort_order");

  if (error)
    throw new Error(`Failed to fetch syllabus: ${error.message}`);
  return data || [];
}

export async function getPapers(examId: string): Promise<Paper[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .eq("exam_id", examId)
    .eq("is_published", true)
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to fetch papers: ${error.message}`);
  return data || [];
}

export async function getCutoffs(examId: string): Promise<Cutoff[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cutoffs")
    .select("*")
    .eq("exam_id", examId)
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to fetch cutoffs: ${error.message}`);
  return data || [];
}

export async function getExamDates(examId: string): Promise<ExamDate[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("exam_dates")
    .select("*")
    .eq("exam_id", examId)
    .order("event_date");

  if (error)
    throw new Error(`Failed to fetch exam dates: ${error.message}`);
  return data || [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries/exams.ts
git commit -m "feat: add Supabase query functions for all exam data"
```

---

### Task 2: Breadcrumb & ExamSubNav Components

**Files:**
- Create: `src/components/Breadcrumb.tsx`
- Create: `src/components/ExamSubNav.tsx`

- [ ] **Step 1: Create Breadcrumb component**

Create `src/components/Breadcrumb.tsx`:
```typescript
import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white">{item.name}</span>
            ) : (
              <Link
                href={item.path}
                className="hover:text-gray-900 dark:hover:text-white"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Create ExamSubNav component**

Create `src/components/ExamSubNav.tsx`:
```typescript
import Link from "next/link";

interface ExamSubNavProps {
  examSlug: string;
  activeTab: "overview" | "syllabus" | "previous-papers" | "cut-offs" | "important-dates";
}

const tabs = [
  { key: "overview", label: "Overview", path: "" },
  { key: "syllabus", label: "Syllabus", path: "/syllabus" },
  { key: "previous-papers", label: "Papers", path: "/previous-papers" },
  { key: "cut-offs", label: "Cut-offs", path: "/cut-offs" },
  { key: "important-dates", label: "Dates", path: "/important-dates" },
] as const;

export function ExamSubNav({ examSlug, activeTab }: ExamSubNavProps) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/exams/${examSlug}${tab.path}`}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Breadcrumb.tsx src/components/ExamSubNav.tsx
git commit -m "feat: add Breadcrumb and ExamSubNav components"
```

---

### Task 3: Exams Index Page

**Files:**
- Create: `src/app/exams/page.tsx`

- [ ] **Step 1: Create exams index page**

Create `src/app/exams/page.tsx`:
```typescript
import { Metadata } from "next";
import { ExamCard } from "@/components/ExamCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";

export const metadata: Metadata = buildMetadata({
  title: "All Exams — JKSSB & JKPSC",
  description:
    "Browse all JKSSB and JKPSC exams with syllabus, previous papers, cut-offs, and important dates.",
  canonicalPath: "/exams",
  keywords: ["JKSSB exams", "JKPSC exams", "JK government exams list"],
});

export default async function ExamsPage() {
  const exams = await getAllExams();

  const breadcrumbItems = [{ name: "Exams", path: "/exams" }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        All Exams
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Select an exam to view syllabus, previous papers, cut-offs, and
        important dates.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {exams.length === 0 && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
          No exams available yet. Check back soon.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/exams/page.tsx
git commit -m "feat: add exams index page with SSG"
```

---

### Task 4: Exam Overview Page

**Files:**
- Create: `src/app/exams/[slug]/page.tsx`

- [ ] **Step 1: Create exam overview page with generateStaticParams and generateMetadata**

Create `src/app/exams/[slug]/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import {
  buildMetadata,
  buildExamJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { getExamBySlug, getExamSlugs } from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: exam.seo_title || `${exam.title} — Exam Details`,
    description:
      exam.seo_description ||
      `Complete details for ${exam.title} exam including syllabus, previous papers, cut-offs, and important dates.`,
    canonicalPath: `/exams/${exam.slug}`,
    keywords: exam.seo_keywords || undefined,
    ogImage: exam.og_image_url || undefined,
  });
}

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildExamJsonLd(exam)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="overview" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title}
      </h1>

      {exam.description && (
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {exam.description}
        </p>
      )}

      {/* Key details grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exam.department && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Department
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {exam.department}
            </p>
          </div>
        )}
        {exam.vacancy_count && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Vacancies
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {exam.vacancy_count}
            </p>
          </div>
        )}
        {exam.pay_scale && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Pay Scale
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {exam.pay_scale}
            </p>
          </div>
        )}
      </div>

      {exam.eligibility && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Eligibility
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {exam.eligibility}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/exams/\\[slug\\]/page.tsx
git commit -m "feat: add exam overview page with SSG and JSON-LD"
```

---

### Task 5: Syllabus Page & Accordion Component

**Files:**
- Create: `src/components/SyllabusAccordion.tsx`
- Create: `src/app/exams/[slug]/syllabus/page.tsx`

- [ ] **Step 1: Create SyllabusAccordion component**

Create `src/components/SyllabusAccordion.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { SyllabusSection } from "@/lib/types/database";

interface SyllabusAccordionProps {
  sections: SyllabusSection[];
}

export function SyllabusAccordion({ sections }: SyllabusAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (sections.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Syllabus details are not yet available for this exam.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            aria-expanded={openIndex === index}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {section.section_title}
              </span>
              {section.marks_weight && (
                <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  {section.marks_weight} marks
                </span>
              )}
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          {openIndex === index && (
            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              <ul className="space-y-1">
                {section.topics.map((topic, topicIndex) => (
                  <li
                    key={topicIndex}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    &bull; {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create syllabus page**

Create `src/app/exams/[slug]/syllabus/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { SyllabusAccordion } from "@/components/SyllabusAccordion";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getExamBySlug,
  getExamSlugs,
  getSyllabusSections,
} from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: `${exam.title} Syllabus`,
    description: `Complete syllabus for ${exam.title} exam — section-wise topics, marks distribution, and preparation guide.`,
    canonicalPath: `/exams/${exam.slug}/syllabus`,
    keywords: [
      `${exam.title} syllabus`,
      `JKSSB ${exam.title} syllabus`,
      `${exam.title} exam pattern`,
    ],
  });
}

export default async function SyllabusPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const sections = await getSyllabusSections(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Syllabus", path: `/exams/${exam.slug}/syllabus` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="syllabus" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title} — Syllabus
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Section-wise syllabus with topics and marks distribution.
      </p>

      <div className="mt-6">
        <SyllabusAccordion sections={sections} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SyllabusAccordion.tsx src/app/exams/\\[slug\\]/syllabus/page.tsx
git commit -m "feat: add syllabus page with accordion component"
```

---

### Task 6: Previous Papers Page & PapersList Component

**Files:**
- Create: `src/components/PapersList.tsx`
- Create: `src/app/exams/[slug]/previous-papers/page.tsx`

- [ ] **Step 1: Create PapersList component**

Create `src/components/PapersList.tsx`:
```typescript
import type { Paper } from "@/lib/types/database";

interface PapersListProps {
  papers: Paper[];
}

export function PapersList({ papers }: PapersListProps) {
  if (papers.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No previous papers available yet. Check back soon.
      </p>
    );
  }

  // Group by year
  const byYear = papers.reduce<Record<number, Paper[]>>((acc, paper) => {
    const year = paper.year || 0;
    if (!acc[year]) acc[year] = [];
    acc[year].push(paper);
    return acc;
  }, {});

  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {sortedYears.map((year) => (
        <div key={year}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {year === 0 ? "Other" : year}
          </h3>
          <div className="mt-2 space-y-2">
            {byYear[year].map((paper) => (
              <div
                key={paper.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {paper.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {paper.subject && <span>{paper.subject}</span>}
                    {paper.file_size_kb && (
                      <span>
                        {paper.file_size_kb > 1024
                          ? `${(paper.file_size_kb / 1024).toFixed(1)} MB`
                          : `${paper.file_size_kb} KB`}
                      </span>
                    )}
                  </div>
                </div>
                {paper.file_url && (
                  <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create previous papers page**

Create `src/app/exams/[slug]/previous-papers/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { PapersList } from "@/components/PapersList";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getExamBySlug,
  getExamSlugs,
  getPapers,
} from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: `${exam.title} Previous Year Papers`,
    description: `Download ${exam.title} previous year question papers PDF — year-wise and subject-wise.`,
    canonicalPath: `/exams/${exam.slug}/previous-papers`,
    keywords: [
      `${exam.title} previous papers`,
      `JKSSB ${exam.title} question papers PDF`,
      `${exam.title} previous year papers`,
    ],
  });
}

export default async function PreviousPapersPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const papers = await getPapers(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    {
      name: "Previous Papers",
      path: `/exams/${exam.slug}/previous-papers`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="previous-papers" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title} — Previous Year Papers
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Download question papers from previous years to prepare effectively.
      </p>

      <div className="mt-6">
        <PapersList papers={papers} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PapersList.tsx src/app/exams/\\[slug\\]/previous-papers/page.tsx
git commit -m "feat: add previous papers page with download links"
```

---

### Task 7: Cut-offs Page & CutoffTable Component

**Files:**
- Create: `src/components/CutoffTable.tsx`
- Create: `src/app/exams/[slug]/cut-offs/page.tsx`

- [ ] **Step 1: Create CutoffTable component**

Create `src/components/CutoffTable.tsx`:
```typescript
"use client";

import { useState, useMemo } from "react";
import type { Cutoff } from "@/lib/types/database";

interface CutoffTableProps {
  cutoffs: Cutoff[];
}

export function CutoffTable({ cutoffs }: CutoffTableProps) {
  const years = useMemo(
    () => [...new Set(cutoffs.map((c) => c.year))].sort((a, b) => b - a),
    [cutoffs]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[0] ?? null
  );

  if (cutoffs.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Cut-off data is not yet available for this exam.
      </p>
    );
  }

  const filtered = selectedYear
    ? cutoffs.filter((c) => c.year === selectedYear)
    : cutoffs;

  return (
    <div>
      {/* Year filter */}
      <div className="mb-4 flex gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selectedYear === year
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Cut-off Score
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Total Posts
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Applicants
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.map((cutoff) => (
              <tr key={cutoff.id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {cutoff.category}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {cutoff.cutoff_score ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {cutoff.total_posts ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {cutoff.total_applied ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create cut-offs page**

Create `src/app/exams/[slug]/cut-offs/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { CutoffTable } from "@/components/CutoffTable";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getExamBySlug,
  getExamSlugs,
  getCutoffs,
} from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: `${exam.title} Cut-off Marks — Category Wise`,
    description: `${exam.title} cut-off marks category wise — General, OBC, SC, ST, EWS. Year-wise cut-off history and analysis.`,
    canonicalPath: `/exams/${exam.slug}/cut-offs`,
    keywords: [
      `${exam.title} cut off`,
      `JKSSB ${exam.title} cut off category wise`,
      `${exam.title} cutoff marks`,
    ],
  });
}

export default async function CutoffsPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const cutoffs = await getCutoffs(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Cut-offs", path: `/exams/${exam.slug}/cut-offs` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="cut-offs" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title} — Cut-off Marks
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Category-wise cut-off history. Use the year filter to compare across
        years.
      </p>

      <div className="mt-6">
        <CutoffTable cutoffs={cutoffs} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CutoffTable.tsx src/app/exams/\\[slug\\]/cut-offs/page.tsx
git commit -m "feat: add cut-offs page with filterable table"
```

---

### Task 8: Important Dates Page & DateTimeline Component

**Files:**
- Create: `src/components/DateTimeline.tsx`
- Create: `src/app/exams/[slug]/important-dates/page.tsx`

- [ ] **Step 1: Create DateTimeline component**

Create `src/components/DateTimeline.tsx`:
```typescript
import type { ExamDate } from "@/lib/types/database";

interface DateTimelineProps {
  dates: ExamDate[];
}

export function DateTimeline({ dates }: DateTimelineProps) {
  if (dates.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Important dates have not been announced yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />

      {dates.map((date) => {
        const formattedDate = date.event_date
          ? new Date(date.event_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "TBA";

        return (
          <div key={date.id} className="relative flex items-start gap-4 py-3">
            {/* Dot */}
            <div className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-teal-600 bg-white dark:border-teal-400 dark:bg-gray-950" />

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {date.event_name}
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {formattedDate}
                {date.is_tentative && (
                  <span className="ml-2 rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Tentative
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create important dates page**

Create `src/app/exams/[slug]/important-dates/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { DateTimeline } from "@/components/DateTimeline";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getExamBySlug,
  getExamSlugs,
  getExamDates,
} from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: `${exam.title} Important Dates`,
    description: `${exam.title} exam important dates — application start, last date, admit card, exam date, and result dates.`,
    canonicalPath: `/exams/${exam.slug}/important-dates`,
    keywords: [
      `${exam.title} exam date`,
      `JKSSB ${exam.title} important dates`,
      `${exam.title} result date`,
    ],
  });
}

export default async function ImportantDatesPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const dates = await getExamDates(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    {
      name: "Important Dates",
      path: `/exams/${exam.slug}/important-dates`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="important-dates" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title} — Important Dates
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Key dates for application, exam, admit card, and result.
      </p>

      <div className="mt-6">
        <DateTimeline dates={dates} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DateTimeline.tsx src/app/exams/\\[slug\\]/important-dates/page.tsx
git commit -m "feat: add important dates page with timeline component"
```

---

### Task 9: Update Homepage to Fetch from Supabase

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/lib/queries/notifications.ts`

- [ ] **Step 1: Create notification query**

Create `src/lib/queries/notifications.ts`:
```typescript
import { createServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types/database";

export async function getLatestNotifications(
  limit: number = 5
): Promise<Notification[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error)
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  return data || [];
}
```

- [ ] **Step 2: Update homepage to use real data**

Replace `src/app/page.tsx` with:
```typescript
import Link from "next/link";
import { ExamCard } from "@/components/ExamCard";
import { NotificationCard } from "@/components/NotificationCard";
import { buildMetadata } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Exam Hub",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  canonicalPath: "/",
});

export default async function HomePage() {
  const [exams, notifications] = await Promise.all([
    getAllExams(),
    getLatestNotifications(5),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <section className="py-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Your JKSSB & JKPSC Exam Hub
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 dark:text-gray-400">
          Notifications, syllabi, previous papers, cut-offs, and exam dates
          &mdash; all in one place. No ads. No clutter.
        </p>
      </section>

      {/* Latest Notifications */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Latest Notifications
          </h2>
          <Link
            href="/notifications"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications yet. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* Exams */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exams
          </h2>
          <Link
            href="/exams"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/lib/queries/notifications.ts
git commit -m "feat: update homepage to fetch exams and notifications from Supabase"
```

---

## Final Verification

- [ ] **Verify all files exist:**

```bash
find src/app/exams src/components src/lib/queries -type f | sort
```

Expected output should show all files created in this plan.

- [ ] **Run build (requires Supabase env vars to be set):**

```bash
npm run build
```

Expected: Build succeeds with all exam pages statically generated.
