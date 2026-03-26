# Phase 1 — Supabase Database Setup & Seed Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the full database schema in Supabase, configure storage buckets, set up Row Level Security (RLS), and seed data for the 5 launch exams.

**Architecture:** SQL migrations run directly in Supabase SQL editor (or via local seed scripts). RLS allows public read on published content, admin write via service role. Storage buckets for papers and OG images are public read.

**Tech Stack:** PostgreSQL (Supabase), SQL

**Depends on:** Supabase project must be created and env vars configured.

---

## File Structure

```
supabase/
├── migrations/
│   ├── 001_create_tables.sql          # Full schema
│   └── 002_enable_rls.sql             # RLS policies
└── seed/
    └── seed_exams.sql                 # Seed data for 5 launch exams
```

---

### Task 1: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_create_tables.sql`

- [ ] **Step 1: Write the full schema migration**

Create `supabase/migrations/001_create_tables.sql`:
```sql
-- EXAMS
create table if not exists exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  department    text,
  description   text,
  vacancy_count int,
  pay_scale     text,
  eligibility   text,
  is_active     boolean default true,
  seo_title       text,
  seo_description text,
  seo_keywords    text[],
  og_image_url    text,
  focus_keyword   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  body          text,
  source_url    text,
  exam_id       uuid references exams(id) on delete set null,
  category      text check (category in ('result', 'admit_card', 'notification', 'answer_key')),
  published_at  timestamptz,
  is_published  boolean default false,
  seo_title       text,
  seo_description text,
  focus_keyword   text,
  auto_fetched    boolean default false,
  source_raw      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- PAPERS
create table if not exists papers (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  title         text not null,
  year          int,
  subject       text,
  file_url      text,
  file_size_kb  int,
  downloads     int default 0,
  is_published  boolean default true,
  seo_title       text,
  seo_description text,
  created_at    timestamptz default now()
);

-- CUTOFFS
create table if not exists cutoffs (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  year          int not null,
  category      text not null,
  cutoff_score  numeric,
  total_posts   int,
  total_applied int,
  created_at    timestamptz default now()
);

-- SYLLABUS SECTIONS
create table if not exists syllabus_sections (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  section_title text not null,
  topics        text[],
  marks_weight  int,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- EXAM DATES
create table if not exists exam_dates (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  event_name    text not null,
  event_date    date,
  is_tentative  boolean default false,
  created_at    timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_exams_slug on exams(slug);
create index if not exists idx_exams_active on exams(is_active);
create index if not exists idx_notifications_slug on notifications(slug);
create index if not exists idx_notifications_published on notifications(is_published, published_at desc);
create index if not exists idx_papers_exam on papers(exam_id);
create index if not exists idx_cutoffs_exam_year on cutoffs(exam_id, year);
create index if not exists idx_syllabus_exam on syllabus_sections(exam_id);
create index if not exists idx_exam_dates_exam on exam_dates(exam_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger exams_updated_at before update on exams
  for each row execute function update_updated_at();

create trigger notifications_updated_at before update on notifications
  for each row execute function update_updated_at();
```

- [ ] **Step 2: Run this SQL in Supabase SQL Editor**

Go to Supabase Dashboard > SQL Editor > paste and run.
Expected: All tables, indexes, and triggers created.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_create_tables.sql
git commit -m "feat: add database schema migration for all tables"
```

---

### Task 2: Row Level Security Policies

**Files:**
- Create: `supabase/migrations/002_enable_rls.sql`

- [ ] **Step 1: Write RLS policies**

Create `supabase/migrations/002_enable_rls.sql`:
```sql
-- Enable RLS on all tables
alter table exams enable row level security;
alter table notifications enable row level security;
alter table papers enable row level security;
alter table cutoffs enable row level security;
alter table syllabus_sections enable row level security;
alter table exam_dates enable row level security;

-- Public read for active/published content
create policy "Public can read active exams"
  on exams for select using (is_active = true);

create policy "Public can read published notifications"
  on notifications for select using (is_published = true);

create policy "Public can read published papers"
  on papers for select using (is_published = true);

create policy "Public can read cutoffs"
  on cutoffs for select using (true);

create policy "Public can read syllabus"
  on syllabus_sections for select using (true);

create policy "Public can read exam dates"
  on exam_dates for select using (true);

-- Service role bypasses RLS automatically, so no admin write policies needed
-- Admin operations use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
```

- [ ] **Step 2: Run in Supabase SQL Editor**

Expected: RLS enabled with public read policies.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_enable_rls.sql
git commit -m "feat: add RLS policies for public read access"
```

---

### Task 3: Configure Storage Buckets

- [ ] **Step 1: Create storage buckets via Supabase Dashboard**

Go to Supabase Dashboard > Storage:
1. Create bucket `papers` — Public bucket, allowed MIME types: `application/pdf`
2. Create bucket `og-images` — Public bucket, allowed MIME types: `image/png, image/jpeg, image/webp`

- [ ] **Step 2: Document storage setup**

This is a manual step in the Supabase dashboard. No SQL file needed.

---

### Task 4: Seed Data for Launch Exams

**Files:**
- Create: `supabase/seed/seed_exams.sql`

- [ ] **Step 1: Write seed data for 5 launch exams**

Create `supabase/seed/seed_exams.sql`:
```sql
-- Seed 5 launch exams
INSERT INTO exams (slug, title, department, description, vacancy_count, pay_scale, eligibility, is_active, seo_title, seo_description, focus_keyword) VALUES
(
  'junior-assistant',
  'Junior Assistant',
  'JKSSB',
  'Junior Assistant recruitment under JKSSB for various departments across Jammu & Kashmir. Includes clerical and administrative duties.',
  342,
  'Pay Level 4 (₹25,500–₹81,100)',
  'Graduate from a recognized university. Typing speed of 35 WPM in English or 25 WPM in Hindi/Urdu.',
  true,
  'JKSSB Junior Assistant 2025 — Syllabus, Papers & Cut-offs',
  'Complete guide for JKSSB Junior Assistant exam — syllabus, previous papers, cut-off marks, and important dates for 342 vacancies.',
  'JKSSB Junior Assistant'
),
(
  'sub-inspector',
  'Sub Inspector (JKPSI)',
  'JK Police',
  'Sub Inspector recruitment in Jammu & Kashmir Police. Involves law enforcement, investigation, and maintaining public order.',
  null,
  'Pay Level 6 (₹35,400–₹1,12,400)',
  'Graduate from a recognized university. Physical fitness standards as per J&K Police norms.',
  true,
  'JKPSI Sub Inspector 2025 — Complete Exam Guide',
  'JKPSI Sub Inspector exam guide with syllabus, previous papers, and preparation tips.',
  'JKPSI Sub Inspector'
),
(
  'naib-tehsildar',
  'Naib Tehsildar',
  'JKPSC',
  'Naib Tehsildar recruitment through JKPSC for revenue administration roles across Jammu & Kashmir.',
  null,
  'Pay Level 8 (₹47,600–₹1,51,100)',
  'Graduate from a recognized university. Knowledge of J&K revenue laws preferred.',
  true,
  'JKPSC Naib Tehsildar 2025 — Exam Details',
  'JKPSC Naib Tehsildar exam syllabus, previous papers, cut-off marks, and important dates.',
  'JKPSC Naib Tehsildar'
),
(
  'junior-engineer',
  'Junior Engineer (Civil & Electrical)',
  'JKSSB',
  'Junior Engineer recruitment for Civil and Electrical engineering positions under JKSSB across multiple departments.',
  800,
  'Pay Level 6 (₹35,400–₹1,12,400)',
  'Diploma or B.E./B.Tech in Civil Engineering or Electrical Engineering from a recognized institution.',
  true,
  'JKSSB Junior Engineer 2025 — 800+ Vacancies',
  'JKSSB JE Civil & Electrical exam guide — syllabus, previous papers, cut-offs for 800+ vacancies.',
  'JKSSB Junior Engineer'
),
(
  'finance-accounts-assistant',
  'Finance Accounts Assistant',
  'JKSSB',
  'Finance Accounts Assistant recruitment under JKSSB for finance and accounts departments across J&K.',
  600,
  'Pay Level 5 (₹29,200–₹92,300)',
  'Graduate with Commerce/Accounting background. Knowledge of Tally/accounting software preferred.',
  true,
  'JKSSB Finance Accounts Assistant — 600 Posts',
  'Complete guide for JKSSB Finance Accounts Assistant exam — 600 confirmed posts with syllabus and cut-offs.',
  'JKSSB Finance Accounts Assistant'
);

-- Seed sample syllabus for Junior Assistant
INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'General Knowledge', ARRAY['History of India and J&K', 'Geography of India and J&K', 'Indian Polity and Constitution', 'Current Affairs (National & International)', 'Economy of India and J&K', 'Awards and Honours'], 25, 1
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'English Language', ARRAY['Grammar (Tenses, Articles, Prepositions)', 'Vocabulary (Synonyms, Antonyms, One-word substitution)', 'Comprehension Passages', 'Sentence Correction', 'Fill in the Blanks', 'Idioms and Phrases'], 25, 2
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'Mathematics', ARRAY['Number System', 'Percentage', 'Ratio and Proportion', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Data Interpretation'], 25, 3
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'General Science & Computer Basics', ARRAY['Physics (Basic concepts)', 'Chemistry (Basic concepts)', 'Biology (Human body, Diseases)', 'Computer Fundamentals', 'MS Office (Word, Excel, PowerPoint)', 'Internet and Email basics'], 25, 4
FROM exams WHERE slug = 'junior-assistant';

-- Seed sample important dates for Junior Assistant
INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Notification Released', '2025-09-15', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Application Start Date', '2025-10-01', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Last Date to Apply', '2025-11-30', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Admit Card Release', '2026-01-15', true FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Exam Date', '2026-02-15', true FROM exams WHERE slug = 'junior-assistant';

-- Seed sample notification
INSERT INTO notifications (slug, title, body, exam_id, category, is_published, published_at, seo_title, seo_description, focus_keyword)
SELECT
  'jkssb-junior-assistant-notification-2025',
  'JKSSB Junior Assistant Notification 2025 — 342 Vacancies Announced',
  '<p>The Jammu & Kashmir Services Selection Board (JKSSB) has officially released the notification for <strong>342 Junior Assistant</strong> vacancies across various departments.</p><p>Eligible candidates can apply online through the official JKSSB portal. The last date to apply is November 30, 2025.</p>',
  id,
  'notification',
  true,
  now(),
  'JKSSB Junior Assistant 2025 Notification — 342 Vacancies',
  'JKSSB has announced 342 Junior Assistant vacancies. Check eligibility, application dates, and how to apply.',
  'JKSSB Junior Assistant notification 2025'
FROM exams WHERE slug = 'junior-assistant';
```

- [ ] **Step 2: Run seed SQL in Supabase SQL Editor**

Expected: 5 exams, 4 syllabus sections, 5 exam dates, and 1 notification inserted.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed/seed_exams.sql
git commit -m "feat: add seed data for 5 launch exams with syllabus and dates"
```

---

## Final Verification

- [ ] **Verify all tables exist in Supabase:**

Check via Supabase Dashboard > Table Editor — all 6 tables should appear with data.

- [ ] **Verify RLS is working:**

Use the Supabase API from a browser (anon key) — should only see active exams and published notifications.
