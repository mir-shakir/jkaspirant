# Phase 1 — Foundation & Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js 14 project with TypeScript, Tailwind CSS, Supabase integration, reusable SEO component, site layout, and homepage shell — deployable to Vercel.

**Architecture:** Next.js 14 App Router with SSG for content pages. Supabase client created via a shared utility. Layout uses a sticky mobile header + footer. SEOHead component renders all meta/OG/JSON-LD tags per page via Next.js Metadata API.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase JS SDK v2, next-sitemap

---

## File Structure

```
jkaspirant/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (html, body, fonts, header, footer)
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Tailwind directives + CSS variables
│   │   └── not-found.tsx           # Custom 404 page
│   ├── components/
│   │   ├── Header.tsx              # Sticky header with nav
│   │   ├── Footer.tsx              # Site footer
│   │   ├── MobileNav.tsx           # Mobile hamburger menu
│   │   ├── ThemeProvider.tsx        # Dark mode provider
│   │   ├── ExamCard.tsx            # Exam listing card (homepage + /exams)
│   │   └── NotificationCard.tsx    # Notification listing card (homepage)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   └── server.ts           # Server-side Supabase client (service role)
│   │   ├── types/
│   │   │   └── database.ts         # TypeScript types matching DB schema
│   │   └── seo.ts                  # SEO metadata helper functions
│   └── config/
│       └── site.ts                 # Site-wide constants (name, URL, description)
├── public/
│   └── favicon.ico
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── next-sitemap.config.js
├── .env.local.example
└── package.json
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Scaffold Next.js 14 with TypeScript and Tailwind**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded in current directory with App Router, TypeScript, Tailwind, ESLint, `src/` directory.

- [ ] **Step 2: Verify the dev server starts**

Run:
```bash
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1
```

Expected: HTTP 200.

- [ ] **Step 3: Add Supabase SDK and other dependencies**

Run:
```bash
npm install @supabase/supabase-js next-sitemap
npm install -D @types/node
```

Expected: Packages installed successfully.

- [ ] **Step 4: Create `.env.local.example`**

Create file `.env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel ISR
VERCEL_REVALIDATION_SECRET=your-secret

# Site
NEXT_PUBLIC_SITE_URL=https://jkaspirant.tech
```

- [ ] **Step 5: Update `next.config.js` for images and security headers**

Replace `next.config.js` contents:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 14 project with TypeScript, Tailwind, Supabase SDK"
```

---

### Task 2: Site Config & TypeScript Types

**Files:**
- Create: `src/config/site.ts`
- Create: `src/lib/types/database.ts`

- [ ] **Step 1: Create site configuration constants**

Create `src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "JK Aspirant",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.tech",
  ogImage: "/og-default.png",
  creator: "JK Aspirant",
  keywords: [
    "JKSSB",
    "JKPSC",
    "Kashmir jobs",
    "JKSSB notifications",
    "JKSSB syllabus",
    "JKSSB previous papers",
    "JK government jobs",
  ],
} as const;
```

- [ ] **Step 2: Create database TypeScript types**

Create `src/lib/types/database.ts`:
```typescript
export interface Exam {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  description: string | null;
  vacancy_count: number | null;
  pay_scale: string | null;
  eligibility: string | null;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  source_url: string | null;
  exam_id: string | null;
  category: "result" | "admit_card" | "notification" | "answer_key" | null;
  published_at: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  auto_fetched: boolean;
  source_raw: string | null;
  created_at: string;
  updated_at: string;
  exam?: Exam;
}

export interface Paper {
  id: string;
  exam_id: string;
  title: string;
  year: number | null;
  subject: string | null;
  file_url: string | null;
  file_size_kb: number | null;
  downloads: number;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

export interface Cutoff {
  id: string;
  exam_id: string;
  year: number;
  category: string;
  cutoff_score: number | null;
  total_posts: number | null;
  total_applied: number | null;
  created_at: string;
}

export interface SyllabusSection {
  id: string;
  exam_id: string;
  section_title: string;
  topics: string[];
  marks_weight: number | null;
  sort_order: number;
  created_at: string;
}

export interface ExamDate {
  id: string;
  exam_id: string;
  event_name: string;
  event_date: string | null;
  is_tentative: boolean;
  created_at: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/config/site.ts src/lib/types/database.ts
git commit -m "feat: add site config constants and database TypeScript types"
```

---

### Task 3: Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create browser-side Supabase client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create server-side Supabase client (service role)**

Create `src/lib/supabase/server.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/supabase/server.ts
git commit -m "feat: add Supabase client utilities for browser and server"
```

---

### Task 4: SEO Metadata Helper

**Files:**
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Create SEO metadata builder function**

This uses the Next.js 14 Metadata API (not a component — Next.js App Router handles `<head>` via exported `metadata` / `generateMetadata`).

Create `src/lib/seo.ts`:
```typescript
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface SEOParams {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonicalPath,
  noIndex = false,
}: SEOParams): Metadata {
  const url = canonicalPath
    ? `${siteConfig.url}${canonicalPath}`
    : siteConfig.url;

  return {
    title,
    description,
    keywords: keywords || siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage || siteConfig.ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildExamJsonLd(exam: {
  title: string;
  description: string | null;
  slug: string;
  vacancy_count: number | null;
  department: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: exam.title,
    description: exam.description || `Details for ${exam.title} exam`,
    url: `${siteConfig.url}/exams/${exam.slug}`,
    provider: {
      "@type": "Organization",
      name: exam.department || "JKSSB",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/seo.ts
git commit -m "feat: add SEO metadata builder with JSON-LD support"
```

---

### Task 5: Theme Provider (Dark Mode)

**Files:**
- Create: `src/components/ThemeProvider.tsx`

- [ ] **Step 1: Install next-themes**

Run:
```bash
npm install next-themes
```

- [ ] **Step 2: Create ThemeProvider component**

Create `src/components/ThemeProvider.tsx`:
```typescript
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeProvider.tsx package.json package-lock.json
git commit -m "feat: add dark mode ThemeProvider using next-themes"
```

---

### Task 6: Header, MobileNav & Footer

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/MobileNav.tsx`
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create Header component**

Create `src/components/Header.tsx`:
```typescript
import Link from "next/link";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/exams", label: "Exams" },
  { href: "/notifications", label: "Notifications" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          JK Aspirant
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create MobileNav component**

Create `src/components/MobileNav.tsx`:
```typescript
"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-14 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create Footer component**

Create `src/components/Footer.tsx`:
```typescript
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              JK Aspirant
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your trusted resource for JKSSB & JKPSC exam preparation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/exams"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  All Exams
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Official Links
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href="https://jkssb.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  JKSSB Official
                </a>
              </li>
              <li>
                <a
                  href="https://jkpsc.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  JKPSC Official
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
          &copy; {new Date().getFullYear()} JK Aspirant. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/MobileNav.tsx src/components/Footer.tsx
git commit -m "feat: add Header with mobile nav, and Footer components"
```

---

### Task 7: Root Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css with Tailwind directives and CSS variables**

Replace `src/app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --accent: 185 84% 30%;
  }

  .dark {
    --accent: 185 70% 50%;
  }

  body {
    @apply bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100;
  }
}
```

- [ ] **Step 2: Update root layout with Header, Footer, ThemeProvider, fonts, and metadata**

Replace `src/app/layout.tsx` with:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — JKSSB & JKPSC Exam Hub`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify dev server still works**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: wire up root layout with header, footer, theme, and fonts"
```

---

### Task 8: Homepage (Static Shell)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/ExamCard.tsx`
- Create: `src/components/NotificationCard.tsx`

- [ ] **Step 1: Create ExamCard component**

Create `src/components/ExamCard.tsx`:
```typescript
import Link from "next/link";
import type { Exam } from "@/lib/types/database";

interface ExamCardProps {
  exam: Pick<Exam, "slug" | "title" | "department" | "vacancy_count">;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link
      href={`/exams/${exam.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {exam.title}
      </h3>
      {exam.department && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {exam.department}
        </p>
      )}
      {exam.vacancy_count && (
        <p className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-400">
          {exam.vacancy_count} vacancies
        </p>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Create NotificationCard component**

Create `src/components/NotificationCard.tsx`:
```typescript
import Link from "next/link";
import type { Notification } from "@/lib/types/database";

interface NotificationCardProps {
  notification: Pick<
    Notification,
    "slug" | "title" | "category" | "published_at"
  >;
}

const categoryLabels: Record<string, string> = {
  result: "Result",
  admit_card: "Admit Card",
  notification: "Notification",
  answer_key: "Answer Key",
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const formattedDate = notification.published_at
    ? new Date(notification.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/notifications/${notification.slug}`}
      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {notification.category && (
            <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {categoryLabels[notification.category] || notification.category}
            </span>
          )}
          {formattedDate && (
            <span className="text-xs text-gray-400">{formattedDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Build homepage shell with static placeholder data**

Replace `src/app/page.tsx` with:
```typescript
import { ExamCard } from "@/components/ExamCard";
import { NotificationCard } from "@/components/NotificationCard";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Exam Hub",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  canonicalPath: "/",
});

// Placeholder data — will be replaced by Supabase queries in Task 9 (core pages plan)
const placeholderExams = [
  {
    slug: "junior-assistant",
    title: "Junior Assistant",
    department: "JKSSB",
    vacancy_count: 342,
  },
  {
    slug: "sub-inspector",
    title: "Sub Inspector (JKPSI)",
    department: "JK Police",
    vacancy_count: null,
  },
  {
    slug: "naib-tehsildar",
    title: "Naib Tehsildar",
    department: "JKPSC",
    vacancy_count: null,
  },
  {
    slug: "junior-engineer",
    title: "Junior Engineer (Civil & Electrical)",
    department: "JKSSB",
    vacancy_count: 800,
  },
  {
    slug: "finance-accounts-assistant",
    title: "Finance Accounts Assistant",
    department: "JKSSB",
    vacancy_count: 600,
  },
];

const placeholderNotifications = [
  {
    slug: "jkssb-junior-assistant-notification-2025",
    title: "JKSSB Junior Assistant Notification 2025 — 342 Vacancies",
    category: "notification" as const,
    published_at: "2025-11-01T10:00:00Z",
  },
  {
    slug: "jkssb-je-admit-card-2025",
    title: "JKSSB JE Admit Card Released — Download Now",
    category: "admit_card" as const,
    published_at: "2025-10-28T08:00:00Z",
  },
];

export default function HomePage() {
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Latest Notifications
        </h2>
        <div className="mt-4 space-y-3">
          {placeholderNotifications.map((n) => (
            <NotificationCard key={n.slug} notification={n} />
          ))}
        </div>
      </section>

      {/* Exams */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Exams
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderExams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run build
```

Expected: Build succeeds. Homepage renders at `/`.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/ExamCard.tsx src/components/NotificationCard.tsx
git commit -m "feat: add homepage shell with ExamCard and NotificationCard components"
```

---

### Task 9: Sitemap & Robots.txt Configuration

**Files:**
- Create: `next-sitemap.config.js`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create next-sitemap config**

Create `next-sitemap.config.js`:
```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.tech",
  generateRobotsTxt: false, // We use Next.js App Router robots.ts instead
  exclude: ["/admin", "/admin/**"],
  generateIndexSitemap: false,
};
```

- [ ] **Step 2: Add postbuild script to package.json**

In `package.json`, add to `"scripts"`:
```json
"postbuild": "next-sitemap"
```

- [ ] **Step 3: Create robots.ts**

Create `src/app/robots.ts`:
```typescript
import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Verify build with sitemap generation**

Run:
```bash
npm run build
ls -la public/sitemap*.xml
```

Expected: Build succeeds, `sitemap.xml` generated in public directory.

- [ ] **Step 5: Commit**

```bash
git add next-sitemap.config.js src/app/robots.ts package.json
git commit -m "feat: add sitemap generation and robots.txt configuration"
```

---

### Task 10: Custom 404 Page

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Create not-found page**

Create `src/app/not-found.tsx`:
```typescript
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Go Home
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat: add custom 404 page"
```

---

## Final Verification

- [ ] **Run full build and verify no errors:**

```bash
npm run build
```

Expected: All pages statically generated, no TypeScript errors, no build warnings.

- [ ] **Verify file structure matches plan:**

```bash
find src -type f | sort
```

Expected: All files from the File Structure section exist.
