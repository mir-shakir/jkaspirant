# Phase 1 — Notifications Pages (ISR)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the notifications feed page (ISR, revalidates every 30 minutes) and individual notification pages — each with its own indexable URL.

**Architecture:** Notifications feed uses ISR with `revalidate = 1800` (30 min). Individual notification pages use ISR with `revalidate = 3600` (1 hour). Both are server components fetching from Supabase.

**Tech Stack:** Next.js 14 (App Router, ISR), TypeScript, Tailwind CSS, Supabase JS SDK

**Depends on:** Phase 1 — Foundation and Core Pages plans must be completed first.

---

## File Structure

```
src/
├── app/
│   └── notifications/
│       ├── page.tsx                    # /notifications feed (ISR 30min)
│       └── [slug]/
│           └── page.tsx                # /notifications/[slug] detail (ISR 1hr)
└── lib/
    └── queries/
        └── notifications.ts            # Already created — will be extended
```

---

### Task 1: Extend Notification Queries

**Files:**
- Modify: `src/lib/queries/notifications.ts`

- [ ] **Step 1: Add queries for feed and individual notification pages**

Replace `src/lib/queries/notifications.ts` with:
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

export async function getAllPublishedNotifications(): Promise<Notification[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*, exam:exams(slug, title)")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  return data || [];
}

export async function getNotificationBySlug(
  slug: string
): Promise<Notification | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*, exam:exams(slug, title)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch notification: ${error.message}`);
  }
  return data;
}

export async function getNotificationSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("slug")
    .eq("is_published", true);

  if (error)
    throw new Error(`Failed to fetch notification slugs: ${error.message}`);
  return (data || []).map((row) => row.slug);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries/notifications.ts
git commit -m "feat: extend notification queries for feed and detail pages"
```

---

### Task 2: Notifications Feed Page

**Files:**
- Create: `src/app/notifications/page.tsx`

- [ ] **Step 1: Create notifications feed page with ISR**

Create `src/app/notifications/page.tsx`:
```typescript
import { Metadata } from "next";
import { NotificationCard } from "@/components/NotificationCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

export const metadata: Metadata = buildMetadata({
  title: "Notifications — JKSSB & JKPSC Updates",
  description:
    "Latest JKSSB and JKPSC notifications — results, admit cards, answer keys, and new recruitment updates.",
  canonicalPath: "/notifications",
  keywords: [
    "JKSSB notifications",
    "JKPSC notifications",
    "JKSSB results",
    "JKSSB admit card",
  ],
});

export default async function NotificationsPage() {
  const notifications = await getAllPublishedNotifications();

  const breadcrumbItems = [
    { name: "Notifications", path: "/notifications" },
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

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        Notifications
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Latest updates from JKSSB and JKPSC — results, admit cards, answer keys,
        and new notifications.
      </p>

      <div className="mt-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))
        ) : (
          <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
            No notifications yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/notifications/page.tsx
git commit -m "feat: add notifications feed page with ISR (30 min revalidation)"
```

---

### Task 3: Individual Notification Page

**Files:**
- Create: `src/app/notifications/[slug]/page.tsx`

- [ ] **Step 1: Create notification detail page with ISR**

Create `src/app/notifications/[slug]/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  getNotificationBySlug,
  getNotificationSlugs,
} from "@/lib/queries/notifications";

export const revalidate = 3600; // ISR: revalidate every 1 hour

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getNotificationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const notification = await getNotificationBySlug(params.slug);
  if (!notification) return {};

  return buildMetadata({
    title:
      notification.seo_title || notification.title,
    description:
      notification.seo_description ||
      `${notification.title} — Read the full notification details.`,
    canonicalPath: `/notifications/${notification.slug}`,
    keywords: notification.focus_keyword
      ? [notification.focus_keyword]
      : undefined,
  });
}

export default async function NotificationDetailPage({ params }: PageProps) {
  const notification = await getNotificationBySlug(params.slug);
  if (!notification) notFound();

  const formattedDate = notification.published_at
    ? new Date(notification.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const categoryLabels: Record<string, string> = {
    result: "Result",
    admit_card: "Admit Card",
    notification: "Notification",
    answer_key: "Answer Key",
  };

  const breadcrumbItems = [
    { name: "Notifications", path: "/notifications" },
    { name: notification.title, path: `/notifications/${notification.slug}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />

      {/* Meta info */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {notification.category && (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {categoryLabels[notification.category] || notification.category}
          </span>
        )}
        {formattedDate && <span>{formattedDate}</span>}
        {notification.exam && (
          <Link
            href={`/exams/${notification.exam.slug}`}
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            {notification.exam.title}
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {notification.title}
      </h1>

      {/* Body */}
      {notification.body && (
        <div className="prose prose-gray mt-6 max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: notification.body }} />
        </div>
      )}

      {/* Source link */}
      {notification.source_url && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Official source:{" "}
            <a
              href={notification.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 underline hover:text-teal-700 dark:text-teal-400"
            >
              View on official website
            </a>
          </p>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/notifications"
          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
        >
          &larr; All Notifications
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/notifications/\\[slug\\]/page.tsx
git commit -m "feat: add individual notification page with ISR and JSON-LD"
```

---

### Task 4: ISR Revalidation API Route

**Files:**
- Create: `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Create on-demand revalidation endpoint**

This endpoint allows automation workflows to trigger ISR revalidation when content is published.

Create `src/app/api/revalidate/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret");

  if (secret !== process.env.VERCEL_REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json();
  const { path } = body;

  if (!path || typeof path !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid path" },
      { status: 400 }
    );
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/revalidate/route.ts
git commit -m "feat: add ISR on-demand revalidation API route"
```

---

## Final Verification

- [ ] **Verify all notification files exist:**

```bash
find src/app/notifications src/app/api/revalidate -type f | sort
```

Expected: `page.tsx` files for feed and detail, plus `route.ts` for revalidation.

- [ ] **Run build:**

```bash
npm run build
```

Expected: Build succeeds with notifications pages generated via ISR.
