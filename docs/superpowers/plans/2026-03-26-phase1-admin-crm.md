# Phase 1 — Admin CRM Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the internal admin dashboard at `/admin` — protected by Supabase Auth — for managing exams, notifications, papers, cut-offs, syllabus sections, and exam dates.

**Architecture:** All admin pages are client components (`"use client"`) using the Supabase browser client. Auth uses Supabase email/password login. The admin layout wraps all `/admin/*` routes and redirects unauthenticated users to login. Admin pages are excluded from sitemap and robots.

**Tech Stack:** Next.js 14 (App Router, client components), TypeScript, Tailwind CSS, Supabase Auth + Client SDK

**Depends on:** Phase 1 — Foundation plan must be completed first.

---

## File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx                  # Auth guard + admin sidebar
│       ├── page.tsx                    # Dashboard home (stats)
│       ├── login/
│       │   └── page.tsx               # Login page
│       ├── notifications/
│       │   └── page.tsx               # Notification manager
│       ├── exams/
│       │   └── page.tsx               # Exam manager
│       ├── papers/
│       │   └── page.tsx               # Papers upload + manager
│       ├── cutoffs/
│       │   └── page.tsx               # Cut-off manager
│       ├── syllabus/
│       │   └── page.tsx               # Syllabus manager
│       └── dates/
│           └── page.tsx               # Exam dates manager
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx           # Sidebar navigation
│       ├── AdminAuthGuard.tsx         # Auth check wrapper
│       ├── NotificationForm.tsx       # Create/edit notification form
│       ├── ExamForm.tsx               # Create/edit exam form
│       ├── PaperUploadForm.tsx        # Paper upload form
│       ├── CutoffForm.tsx             # Create/edit cut-off form
│       ├── SyllabusForm.tsx           # Create/edit syllabus section form
│       └── ExamDateForm.tsx           # Create/edit exam date form
└── lib/
    └── queries/
        └── admin.ts                   # Admin-specific queries (all records, not just published)
```

---

### Task 1: Admin Query Functions

**Files:**
- Create: `src/lib/queries/admin.ts`

- [ ] **Step 1: Create admin query and mutation functions**

Create `src/lib/queries/admin.ts`:
```typescript
import { supabase } from "@/lib/supabase/client";
import type {
  Exam,
  Notification,
  Paper,
  Cutoff,
  SyllabusSection,
  ExamDate,
} from "@/lib/types/database";

// --- Exams ---

export async function getAdminExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("title");
  if (error) throw error;
  return data || [];
}

export async function upsertExam(
  exam: Partial<Exam> & { title: string; slug: string }
): Promise<Exam> {
  const { data, error } = await supabase
    .from("exams")
    .upsert(exam, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
}

// --- Notifications ---

export async function getAdminNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, exam:exams(slug, title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertNotification(
  notification: Partial<Notification> & { title: string; slug: string }
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .upsert(notification, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function approveNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// --- Papers ---

export async function getAdminPapers(): Promise<
  (Paper & { exam?: Pick<Exam, "title"> })[]
> {
  const { data, error } = await supabase
    .from("papers")
    .select("*, exam:exams(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertPaper(
  paper: Partial<Paper> & { title: string; exam_id: string }
): Promise<Paper> {
  const { data, error } = await supabase
    .from("papers")
    .upsert(paper, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePaper(id: string): Promise<void> {
  const { error } = await supabase.from("papers").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPaperFile(
  file: File,
  fileName: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("papers")
    .upload(fileName, file, { upsert: true });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("papers").getPublicUrl(data.path);
  return publicUrl;
}

// --- Cutoffs ---

export async function getAdminCutoffs(): Promise<
  (Cutoff & { exam?: Pick<Exam, "title"> })[]
> {
  const { data, error } = await supabase
    .from("cutoffs")
    .select("*, exam:exams(title)")
    .order("year", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertCutoff(
  cutoff: Partial<Cutoff> & {
    exam_id: string;
    year: number;
    category: string;
  }
): Promise<Cutoff> {
  const { data, error } = await supabase
    .from("cutoffs")
    .upsert(cutoff, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCutoff(id: string): Promise<void> {
  const { error } = await supabase.from("cutoffs").delete().eq("id", id);
  if (error) throw error;
}

// --- Syllabus Sections ---

export async function getAdminSyllabusSections(): Promise<
  (SyllabusSection & { exam?: Pick<Exam, "title"> })[]
> {
  const { data, error } = await supabase
    .from("syllabus_sections")
    .select("*, exam:exams(title)")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function upsertSyllabusSection(
  section: Partial<SyllabusSection> & {
    exam_id: string;
    section_title: string;
  }
): Promise<SyllabusSection> {
  const { data, error } = await supabase
    .from("syllabus_sections")
    .upsert(section, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSyllabusSection(id: string): Promise<void> {
  const { error } = await supabase
    .from("syllabus_sections")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// --- Exam Dates ---

export async function getAdminExamDates(): Promise<
  (ExamDate & { exam?: Pick<Exam, "title"> })[]
> {
  const { data, error } = await supabase
    .from("exam_dates")
    .select("*, exam:exams(title)")
    .order("event_date");
  if (error) throw error;
  return data || [];
}

export async function upsertExamDate(
  examDate: Partial<ExamDate> & { exam_id: string; event_name: string }
): Promise<ExamDate> {
  const { data, error } = await supabase
    .from("exam_dates")
    .upsert(examDate, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExamDate(id: string): Promise<void> {
  const { error } = await supabase.from("exam_dates").delete().eq("id", id);
  if (error) throw error;
}

// --- Stats ---

export async function getAdminStats(): Promise<{
  totalExams: number;
  totalNotifications: number;
  pendingNotifications: number;
  totalPapers: number;
}> {
  const [exams, notifs, pending, papers] = await Promise.all([
    supabase.from("exams").select("id", { count: "exact", head: true }),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    supabase.from("papers").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalExams: exams.count || 0,
    totalNotifications: notifs.count || 0,
    pendingNotifications: pending.count || 0,
    totalPapers: papers.count || 0,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries/admin.ts
git commit -m "feat: add admin CRUD query functions for all entities"
```

---

### Task 2: Admin Auth Guard & Sidebar

**Files:**
- Create: `src/components/admin/AdminAuthGuard.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Create AdminAuthGuard component**

Create `src/components/admin/AdminAuthGuard.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      setUser(user);
      setLoading(false);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/admin/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
```

- [ ] **Step 2: Create AdminSidebar component**

Create `src/components/admin/AdminSidebar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/papers", label: "Papers" },
  { href: "/admin/cutoffs", label: "Cut-offs" },
  { href: "/admin/syllabus", label: "Syllabus" },
  { href: "/admin/dates", label: "Exam Dates" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="p-4">
        <Link
          href="/admin"
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminAuthGuard.tsx src/components/admin/AdminSidebar.tsx
git commit -m "feat: add admin auth guard and sidebar navigation"
```

---

### Task 3: Admin Layout & Login Page

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create admin layout**

Create `src/app/admin/layout.tsx`:
```typescript
import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "JK Aspirant admin dashboard",
  noIndex: true,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Create login page**

Create `src/app/admin/login/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Login
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sign in to manage JK Aspirant content.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/login/page.tsx
git commit -m "feat: add admin layout and login page with Supabase Auth"
```

---

### Task 4: Admin Dashboard Page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create admin dashboard with stats**

Create `src/app/admin/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminStats } from "@/lib/queries/admin";

interface Stats {
  totalExams: number;
  totalNotifications: number;
  pendingNotifications: number;
  totalPapers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>

          {stats ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active Exams" value={stats.totalExams} />
              <StatCard
                label="Published Notifications"
                value={stats.totalNotifications}
              />
              <StatCard
                label="Pending Review"
                value={stats.pendingNotifications}
                highlight
              />
              <StatCard label="Papers Uploaded" value={stats.totalPapers} />
            </div>
          ) : (
            <p className="mt-6 text-gray-500">Loading stats...</p>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold ${
          highlight
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add admin dashboard page with stats overview"
```

---

### Task 5: Notifications Manager Page

**Files:**
- Create: `src/components/admin/NotificationForm.tsx`
- Create: `src/app/admin/notifications/page.tsx`

- [ ] **Step 1: Create NotificationForm component**

Create `src/components/admin/NotificationForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { Notification, Exam } from "@/lib/types/database";
import { upsertNotification } from "@/lib/queries/admin";

interface NotificationFormProps {
  exams: Pick<Exam, "id" | "title">[];
  notification?: Notification;
  onSaved: () => void;
  onCancel: () => void;
}

export function NotificationForm({
  exams,
  notification,
  onSaved,
  onCancel,
}: NotificationFormProps) {
  const [title, setTitle] = useState(notification?.title || "");
  const [slug, setSlug] = useState(notification?.slug || "");
  const [body, setBody] = useState(notification?.body || "");
  const [sourceUrl, setSourceUrl] = useState(notification?.source_url || "");
  const [examId, setExamId] = useState(notification?.exam_id || "");
  const [category, setCategory] = useState(notification?.category || "notification");
  const [seoTitle, setSeoTitle] = useState(notification?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    notification?.seo_description || ""
  );
  const [focusKeyword, setFocusKeyword] = useState(
    notification?.focus_keyword || ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await upsertNotification({
      ...(notification?.id ? { id: notification.id } : {}),
      title,
      slug,
      body: body || null,
      source_url: sourceUrl || null,
      exam_id: examId || null,
      category: category as Notification["category"],
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      focus_keyword: focusKeyword || null,
    });

    setSaving(false);
    onSaved();
  }

  function generateSlug() {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => !slug && generateSlug()}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Slug
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="notification">Notification</option>
            <option value="result">Result</option>
            <option value="admit_card">Admit Card</option>
            <option value="answer_key">Answer Key</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Related Exam
          </label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">None</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Body (HTML)
        </label>
        <textarea
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Source URL
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* SEO Fields */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          SEO Fields
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-500">
              SEO Title (max 60 chars)
            </label>
            <input
              type="text"
              maxLength={60}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              SEO Description (max 155 chars)
            </label>
            <textarea
              rows={2}
              maxLength={155}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              Focus Keyword
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create notifications manager page**

Create `src/app/admin/notifications/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationForm } from "@/components/admin/NotificationForm";
import {
  getAdminNotifications,
  approveNotification,
  deleteNotification,
  getAdminExams,
} from "@/lib/queries/admin";
import type { Notification, Exam } from "@/lib/types/database";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");

  function loadData() {
    getAdminNotifications().then(setNotifications);
    getAdminExams().then(setExams);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "pending") return !n.is_published;
    if (filter === "published") return n.is_published;
    return true;
  });

  async function handleApprove(id: string) {
    await approveNotification(id);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification?")) return;
    await deleteNotification(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <button
              onClick={() => {
                setCreating(true);
                setEditing(null);
              }}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              New Notification
            </button>
          </div>

          {/* Filter */}
          <div className="mt-4 flex gap-2">
            {(["all", "pending", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  filter === f
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? "Edit Notification" : "New Notification"}
              </h2>
              <NotificationForm
                exams={exams}
                notification={editing || undefined}
                onSaved={() => {
                  setCreating(false);
                  setEditing(null);
                  loadData();
                }}
                onCancel={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              />
            </div>
          )}

          {/* Table */}
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Source</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((n) => (
                  <tr key={n.id}>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {n.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {n.category || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          n.is_published
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {n.is_published ? "Published" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {n.auto_fetched ? "Auto" : "Manual"}
                    </td>
                    <td className="space-x-2 px-4 py-3">
                      {!n.is_published && (
                        <button
                          onClick={() => handleApprove(n.id)}
                          className="text-xs font-medium text-green-600 hover:text-green-700"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditing(n);
                          setCreating(false);
                        }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/NotificationForm.tsx src/app/admin/notifications/page.tsx
git commit -m "feat: add admin notifications manager with approve/edit/delete"
```

---

### Task 6: Exams Manager Page

**Files:**
- Create: `src/components/admin/ExamForm.tsx`
- Create: `src/app/admin/exams/page.tsx`

- [ ] **Step 1: Create ExamForm component**

Create `src/components/admin/ExamForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { Exam } from "@/lib/types/database";
import { upsertExam } from "@/lib/queries/admin";

interface ExamFormProps {
  exam?: Exam;
  onSaved: () => void;
  onCancel: () => void;
}

export function ExamForm({ exam, onSaved, onCancel }: ExamFormProps) {
  const [title, setTitle] = useState(exam?.title || "");
  const [slug, setSlug] = useState(exam?.slug || "");
  const [department, setDepartment] = useState(exam?.department || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [vacancyCount, setVacancyCount] = useState(
    exam?.vacancy_count?.toString() || ""
  );
  const [payScale, setPayScale] = useState(exam?.pay_scale || "");
  const [eligibility, setEligibility] = useState(exam?.eligibility || "");
  const [seoTitle, setSeoTitle] = useState(exam?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    exam?.seo_description || ""
  );
  const [focusKeyword, setFocusKeyword] = useState(exam?.focus_keyword || "");
  const [isActive, setIsActive] = useState(exam?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await upsertExam({
      ...(exam?.id ? { id: exam.id } : {}),
      title,
      slug,
      department: department || null,
      description: description || null,
      vacancy_count: vacancyCount ? parseInt(vacancyCount, 10) : null,
      pay_scale: payScale || null,
      eligibility: eligibility || null,
      is_active: isActive,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      focus_keyword: focusKeyword || null,
    });

    setSaving(false);
    onSaved();
  }

  function generateSlug() {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !slug && generateSlug()}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Vacancies
          </label>
          <input
            type="number"
            value={vacancyCount}
            onChange={(e) => setVacancyCount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pay Scale
          </label>
          <input
            type="text"
            value={payScale}
            onChange={(e) => setPayScale(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Eligibility
        </label>
        <textarea
          rows={2}
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label
          htmlFor="isActive"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Active (visible on site)
        </label>
      </div>

      {/* SEO Fields */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          SEO Fields
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-500">SEO Title</label>
            <input
              type="text"
              maxLength={60}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              SEO Description
            </label>
            <textarea
              rows={2}
              maxLength={155}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              Focus Keyword
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create exams manager page**

Create `src/app/admin/exams/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ExamForm } from "@/components/admin/ExamForm";
import { getAdminExams, deleteExam } from "@/lib/queries/admin";
import type { Exam } from "@/lib/types/database";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminExams().then(setExams);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam and all related data?")) return;
    await deleteExam(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exams
            </h1>
            <button
              onClick={() => {
                setCreating(true);
                setEditing(null);
              }}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              New Exam
            </button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? "Edit Exam" : "New Exam"}
              </h2>
              <ExamForm
                exam={editing || undefined}
                onSaved={() => {
                  setCreating(false);
                  setEditing(null);
                  loadData();
                }}
                onCancel={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Dept</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Vacancies
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {exam.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {exam.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {exam.vacancy_count || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          exam.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {exam.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="space-x-2 px-4 py-3">
                      <button
                        onClick={() => {
                          setEditing(exam);
                          setCreating(false);
                        }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ExamForm.tsx src/app/admin/exams/page.tsx
git commit -m "feat: add admin exams manager with CRUD"
```

---

### Task 7: Papers Manager Page

**Files:**
- Create: `src/components/admin/PaperUploadForm.tsx`
- Create: `src/app/admin/papers/page.tsx`

- [ ] **Step 1: Create PaperUploadForm component**

Create `src/components/admin/PaperUploadForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { Exam, Paper } from "@/lib/types/database";
import { upsertPaper, uploadPaperFile } from "@/lib/queries/admin";

interface PaperUploadFormProps {
  exams: Pick<Exam, "id" | "title">[];
  paper?: Paper;
  onSaved: () => void;
  onCancel: () => void;
}

export function PaperUploadForm({
  exams,
  paper,
  onSaved,
  onCancel,
}: PaperUploadFormProps) {
  const [title, setTitle] = useState(paper?.title || "");
  const [examId, setExamId] = useState(paper?.exam_id || "");
  const [year, setYear] = useState(paper?.year?.toString() || "");
  const [subject, setSubject] = useState(paper?.subject || "");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState(paper?.file_url || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let uploadedUrl = fileUrl;

    if (file) {
      const fileName = `${examId}/${year || "misc"}/${file.name}`;
      uploadedUrl = await uploadPaperFile(file, fileName);
    }

    await upsertPaper({
      ...(paper?.id ? { id: paper.id } : {}),
      title,
      exam_id: examId,
      year: year ? parseInt(year, 10) : null,
      subject: subject || null,
      file_url: uploadedUrl || null,
      file_size_kb: file ? Math.round(file.size / 1024) : paper?.file_size_kb || null,
    });

    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Exam
          </label>
          <select
            required
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          PDF File
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
        />
        {fileUrl && !file && (
          <p className="mt-1 text-xs text-gray-500">
            Current file: {fileUrl.split("/").pop()}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Uploading..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create papers manager page**

Create `src/app/admin/papers/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PaperUploadForm } from "@/components/admin/PaperUploadForm";
import {
  getAdminPapers,
  deletePaper,
  getAdminExams,
} from "@/lib/queries/admin";
import type { Paper, Exam } from "@/lib/types/database";

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<(Paper & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Paper | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminPapers().then(setPapers);
    getAdminExams().then(setExams);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this paper?")) return;
    await deletePaper(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Papers
            </h1>
            <button
              onClick={() => {
                setCreating(true);
                setEditing(null);
              }}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Upload Paper
            </button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? "Edit Paper" : "Upload Paper"}
              </h2>
              <PaperUploadForm
                exams={exams}
                paper={editing || undefined}
                onSaved={() => {
                  setCreating(false);
                  setEditing(null);
                  loadData();
                }}
                onCancel={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Downloads
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {papers.map((paper) => (
                  <tr key={paper.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {paper.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {paper.exam?.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {paper.year || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {paper.downloads}
                    </td>
                    <td className="space-x-2 px-4 py-3">
                      <button
                        onClick={() => {
                          setEditing(paper);
                          setCreating(false);
                        }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(paper.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/PaperUploadForm.tsx src/app/admin/papers/page.tsx
git commit -m "feat: add admin papers manager with upload to Supabase Storage"
```

---

### Task 8: Cut-offs, Syllabus & Dates Manager Pages

**Files:**
- Create: `src/components/admin/CutoffForm.tsx`
- Create: `src/app/admin/cutoffs/page.tsx`
- Create: `src/components/admin/SyllabusForm.tsx`
- Create: `src/app/admin/syllabus/page.tsx`
- Create: `src/components/admin/ExamDateForm.tsx`
- Create: `src/app/admin/dates/page.tsx`

- [ ] **Step 1: Create CutoffForm component**

Create `src/components/admin/CutoffForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { Cutoff, Exam } from "@/lib/types/database";
import { upsertCutoff } from "@/lib/queries/admin";

interface CutoffFormProps {
  exams: Pick<Exam, "id" | "title">[];
  cutoff?: Cutoff;
  onSaved: () => void;
  onCancel: () => void;
}

export function CutoffForm({ exams, cutoff, onSaved, onCancel }: CutoffFormProps) {
  const [examId, setExamId] = useState(cutoff?.exam_id || "");
  const [year, setYear] = useState(cutoff?.year?.toString() || "");
  const [category, setCategory] = useState(cutoff?.category || "");
  const [cutoffScore, setCutoffScore] = useState(cutoff?.cutoff_score?.toString() || "");
  const [totalPosts, setTotalPosts] = useState(cutoff?.total_posts?.toString() || "");
  const [totalApplied, setTotalApplied] = useState(cutoff?.total_applied?.toString() || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertCutoff({
      ...(cutoff?.id ? { id: cutoff.id } : {}),
      exam_id: examId,
      year: parseInt(year, 10),
      category,
      cutoff_score: cutoffScore ? parseFloat(cutoffScore) : null,
      total_posts: totalPosts ? parseInt(totalPosts, 10) : null,
      total_applied: totalApplied ? parseInt(totalApplied, 10) : null,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label>
          <select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
          <input type="number" required value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Select</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
            <option value="PWD">PWD</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cut-off Score</label>
          <input type="number" step="0.01" value={cutoffScore} onChange={(e) => setCutoffScore(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Posts</label>
          <input type="number" value={totalPosts} onChange={(e) => setTotalPosts(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicants</label>
          <input type="number" value={totalApplied} onChange={(e) => setTotalApplied(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create cutoffs manager page**

Create `src/app/admin/cutoffs/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CutoffForm } from "@/components/admin/CutoffForm";
import { getAdminCutoffs, deleteCutoff, getAdminExams } from "@/lib/queries/admin";
import type { Cutoff, Exam } from "@/lib/types/database";

export default function AdminCutoffsPage() {
  const [cutoffs, setCutoffs] = useState<(Cutoff & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Cutoff | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminCutoffs().then(setCutoffs);
    getAdminExams().then(setExams);
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this cut-off record?")) return;
    await deleteCutoff(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cut-offs</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Cut-off</button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <CutoffForm exams={exams} cutoff={editing || undefined} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Score</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {cutoffs.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{c.exam?.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.year}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.category}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.cutoff_score ?? "—"}</td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(c); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 3: Create SyllabusForm component**

Create `src/components/admin/SyllabusForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { SyllabusSection, Exam } from "@/lib/types/database";
import { upsertSyllabusSection } from "@/lib/queries/admin";

interface SyllabusFormProps {
  exams: Pick<Exam, "id" | "title">[];
  section?: SyllabusSection;
  onSaved: () => void;
  onCancel: () => void;
}

export function SyllabusForm({ exams, section, onSaved, onCancel }: SyllabusFormProps) {
  const [examId, setExamId] = useState(section?.exam_id || "");
  const [sectionTitle, setSectionTitle] = useState(section?.section_title || "");
  const [topicsText, setTopicsText] = useState(section?.topics?.join("\n") || "");
  const [marksWeight, setMarksWeight] = useState(section?.marks_weight?.toString() || "");
  const [sortOrder, setSortOrder] = useState(section?.sort_order?.toString() || "0");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertSyllabusSection({
      ...(section?.id ? { id: section.id } : {}),
      exam_id: examId,
      section_title: sectionTitle,
      topics: topicsText.split("\n").map((t) => t.trim()).filter(Boolean),
      marks_weight: marksWeight ? parseInt(marksWeight, 10) : null,
      sort_order: parseInt(sortOrder, 10) || 0,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label>
          <select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section Title</label>
          <input type="text" required value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topics (one per line)</label>
        <textarea rows={6} value={topicsText} onChange={(e) => setTopicsText(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marks Weight</label>
          <input type="number" value={marksWeight} onChange={(e) => setMarksWeight(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create syllabus manager page**

Create `src/app/admin/syllabus/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SyllabusForm } from "@/components/admin/SyllabusForm";
import { getAdminSyllabusSections, deleteSyllabusSection, getAdminExams } from "@/lib/queries/admin";
import type { SyllabusSection, Exam } from "@/lib/types/database";

export default function AdminSyllabusPage() {
  const [sections, setSections] = useState<(SyllabusSection & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<SyllabusSection | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminSyllabusSections().then(setSections);
    getAdminExams().then(setExams);
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this syllabus section?")) return;
    await deleteSyllabusSection(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Sections</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Section</button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <SyllabusForm exams={exams} section={editing || undefined} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold">Section</th>
                  <th className="px-4 py-3 text-left font-semibold">Topics</th>
                  <th className="px-4 py-3 text-left font-semibold">Marks</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.exam?.title || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.section_title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.topics?.length || 0} topics</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.marks_weight ?? "—"}</td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(s); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 5: Create ExamDateForm component**

Create `src/components/admin/ExamDateForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import type { ExamDate, Exam } from "@/lib/types/database";
import { upsertExamDate } from "@/lib/queries/admin";

interface ExamDateFormProps {
  exams: Pick<Exam, "id" | "title">[];
  examDate?: ExamDate;
  onSaved: () => void;
  onCancel: () => void;
}

export function ExamDateForm({ exams, examDate, onSaved, onCancel }: ExamDateFormProps) {
  const [examId, setExamId] = useState(examDate?.exam_id || "");
  const [eventName, setEventName] = useState(examDate?.event_name || "");
  const [eventDate, setEventDate] = useState(examDate?.event_date || "");
  const [isTentative, setIsTentative] = useState(examDate?.is_tentative ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertExamDate({
      ...(examDate?.id ? { id: examDate.id } : {}),
      exam_id: examId,
      event_name: eventName,
      event_date: eventDate || null,
      is_tentative: isTentative,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label>
          <select required value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Name</label>
          <input type="text" required value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Application Start, Exam Date" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isTentative} onChange={(e) => setIsTentative(e.target.checked)} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Tentative date</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 6: Create exam dates manager page**

Create `src/app/admin/dates/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ExamDateForm } from "@/components/admin/ExamDateForm";
import { getAdminExamDates, deleteExamDate, getAdminExams } from "@/lib/queries/admin";
import type { ExamDate, Exam } from "@/lib/types/database";

export default function AdminDatesPage() {
  const [dates, setDates] = useState<(ExamDate & { exam?: Pick<Exam, "title"> })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<ExamDate | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() {
    getAdminExamDates().then(setDates);
    getAdminExams().then(setExams);
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this date entry?")) return;
    await deleteExamDate(id);
    loadData();
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Dates</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Add Date</button>
          </div>

          {(creating || editing) && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <ExamDateForm exams={exams} examDate={editing || undefined} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold">Event</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {dates.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{d.exam?.title || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{d.event_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.event_date || "TBA"}</td>
                    <td className="px-4 py-3">{d.is_tentative ? <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Tentative</span> : <span className="text-xs text-gray-500">Confirmed</span>}</td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(d); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(d.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 7: Commit all admin manager pages**

```bash
git add src/components/admin/CutoffForm.tsx src/app/admin/cutoffs/page.tsx src/components/admin/SyllabusForm.tsx src/app/admin/syllabus/page.tsx src/components/admin/ExamDateForm.tsx src/app/admin/dates/page.tsx
git commit -m "feat: add admin managers for cutoffs, syllabus, and exam dates"
```

---

## Final Verification

- [ ] **Run build:**

```bash
npm run build
```

Expected: Build succeeds with all admin pages compiled as client components.
