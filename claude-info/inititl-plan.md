# JKSSB Exam Hub — Full Project Context & Implementation Plan
> Version 2.0 — For use as Claude Code context

---

## 1. Project Overview

A clean, fast, mobile-first website for Kashmir's competitive exam audience — specifically JKSSB (Jammu & Kashmir Services Selection Board) and JKPSC candidates. The site is a one-stop resource for notifications, syllabi, previous papers, cut-off history, and exam calendars.

**Core philosophy:**
- No ads. Ever. This is a trust and traffic decision.
- SEO is a first-class citizen — planned from day one, not bolted on later
- Automation-first — content operations should run with minimal manual effort
- Monetization comes later via paid resource bundles (PDF packs via Razorpay)

---

## 2. Launch Scope (Phase 1)

**Go live with 4–5 exams only.** No mock tests, no user accounts, no payments yet.

**Target exams for launch (highest search volume + applicant base):**
1. Junior Assistant (342 vacancies, applications close Nov 2025)
2. Sub Inspector / JKPSI
3. Naib Tehsildar
4. Junior Engineer (Civil & Electrical — 800+ vacancies)
5. Finance Accounts Assistant (600 posts confirmed)

Each exam gets its own fully built-out page set: overview, syllabus, previous papers, cut-offs, and dates.

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SEO-friendly SSG/SSR, Vercel-native, great for Claude Code |
| Styling | Tailwind CSS | Fast, consistent, mobile-first |
| Database | Supabase (PostgreSQL) | Free tier, handles DB + auth + storage + full-text search |
| Hosting | Vercel | Free tier, auto-deploy from GitHub, custom domain |
| Domain | Free .tech domain | Already available |
| Automation | n8n (self-hosted on Render free tier) OR Make.com free tier | Workflows for scraping, content ops, social posting |
| AI (content ops) | Claude API (Anthropic) | SEO meta generation, syllabus structuring, content writing |
| Payments (Phase 3) | Razorpay | Indian payment integration, simple one-time purchases |

**Total monthly cost: ₹0**

---

## 4. SEO Strategy (First-Class, From Day One)

### Philosophy
Every page must be indexable, fast, and semantically correct from the first deploy. SEO is not a phase — it is baked into the architecture.

### Technical SEO (built into Next.js from day one)
- All exam content pages → **Static Site Generation (SSG)** via `generateStaticParams`
- Notifications page → **Incremental Static Regeneration (ISR)** with revalidation every 30 minutes
- `<title>` and `<meta description>` → dynamically generated per page from DB, AI-assisted
- Open Graph tags on every page
- JSON-LD structured data on exam pages (using `JobPosting` and `Event` schemas where applicable)
- XML sitemap auto-generated via `next-sitemap`
- `robots.txt` configured correctly from day one
- Canonical URLs on all pages
- No duplicate content — each exam/resource has one canonical URL

### On-Page SEO
- Every exam page targets a primary keyword e.g. "JKSSB Junior Assistant syllabus", "JKSSB JE previous papers"
- SEO title, meta description, slug, H1, focus keyword — all stored as columns in the DB
- AI auto-generates first draft of SEO fields; admin reviews and approves via CRM
- Internal linking — exam pages link to related resources, notifications link to relevant exam pages

### Content SEO
- Notifications published same-day — freshness signal for Google
- Each notification gets its own page (not just a feed) — individual indexable URLs
- Previous papers pages target queries like "JKSSB Junior Assistant previous year papers PDF"
- Cut-off pages target queries like "JKSSB JE cut off 2023 category wise"
- Breadcrumbs on all nested pages (also rendered as JSON-LD)

### Speed (Core Web Vitals)
- Target Lighthouse mobile score 90+ from day one
- Next.js `<Image>` for all images (automatic WebP + lazy loading)
- No heavy client-side JS on content pages — mostly server rendered
- Fonts loaded via `next/font` (no FOUT)

---

## 5. Database Schema (Supabase / PostgreSQL)

```sql
-- EXAMS
create table exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,         -- e.g. "junior-assistant"
  title         text not null,                -- e.g. "Junior Assistant"
  department    text,
  description   text,
  vacancy_count int,
  pay_scale     text,
  eligibility   text,
  is_active     boolean default true,

  -- SEO fields
  seo_title       text,                       -- <title> tag (60 chars max)
  seo_description text,                       -- meta description (155 chars max)
  seo_keywords    text[],                     -- array of target keywords
  og_image_url    text,                       -- Open Graph image
  focus_keyword   text,                       -- primary target keyword

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,         -- for individual notification pages
  title         text not null,
  body          text,
  source_url    text,
  exam_id       uuid references exams(id),
  category      text,                         -- "result", "admit_card", "notification", "answer_key"
  published_at  timestamptz,
  is_published  boolean default false,        -- admin approval gate

  -- SEO fields
  seo_title       text,
  seo_description text,
  focus_keyword   text,

  -- Automation metadata
  auto_fetched    boolean default false,      -- was this pulled by automation?
  source_raw      text,                       -- raw content from scraper for audit

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- PAPERS (previous year question papers)
create table papers (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id),
  title         text not null,
  year          int,
  subject       text,
  file_url      text,                         -- Supabase storage URL
  file_size_kb  int,
  downloads     int default 0,
  is_published  boolean default true,

  -- SEO fields
  seo_title       text,
  seo_description text,

  created_at    timestamptz default now()
);

-- CUTOFFS
create table cutoffs (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id),
  year          int,
  category      text,                         -- "General", "OBC", "SC", "ST", "EWS", "PWD"
  cutoff_score  numeric,
  total_posts   int,
  total_applied int,
  created_at    timestamptz default now()
);

-- SYLLABUS SECTIONS
create table syllabus_sections (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id),
  section_title text not null,               -- e.g. "General Knowledge"
  topics        text[],                      -- array of topics
  marks_weight  int,                         -- percentage or marks
  sort_order    int,
  created_at    timestamptz default now()
);

-- EXAM DATES
create table exam_dates (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id),
  event_name    text not null,               -- "Application Start", "Last Date", "Exam Date", "Result"
  event_date    date,
  is_tentative  boolean default false,
  created_at    timestamptz default now()
);

-- ADMIN USERS (for CRM login via Supabase Auth)
-- Uses Supabase built-in auth — no custom table needed
```

**Supabase Storage Buckets:**
- `papers` — question paper PDFs (public read, admin write)
- `og-images` — Open Graph images per exam

---

## 6. Site Structure & URL Architecture

```
/                                    → Homepage
/notifications                       → All notifications feed
/notifications/[slug]                → Individual notification page (indexable)
/exams                               → Exam index
/exams/[slug]                        → Exam overview page
/exams/[slug]/syllabus               → Syllabus
/exams/[slug]/previous-papers        → Papers list + downloads
/exams/[slug]/cut-offs               → Cut-off history table
/exams/[slug]/important-dates        → Exam calendar
/admin                               → CRM dashboard (protected)
/admin/notifications                 → Manage notifications
/admin/exams                         → Manage exams
/admin/papers                        → Upload papers
/admin/cutoffs                       → Add cut-off data
/sitemap.xml                         → Auto-generated
/robots.txt                          → Configured
```

---

## 7. Automation Architecture

All automations run on **n8n** (self-hosted free on Render) or **Make.com free tier**.

### Automation 1: JKSSB Notification Scraper
- **Trigger:** Scheduled — runs every 6 hours
- **Source:** jkssb.nic.in/Whatsnew.html
- **Flow:**
  1. Fetch JKSSB "What's New" page
  2. Parse new entries not already in DB
  3. Insert into `notifications` table with `is_published = false` and `auto_fetched = true`
  4. Call Claude API → generate `seo_title`, `seo_description`, `focus_keyword` for each new notification
  5. Send push notification to admin (via email or Telegram) — "X new notifications pending review"

### Automation 2: Auto-Publish Gate
- **Trigger:** Webhook from admin CRM "Approve" button
- **Flow:**
  1. Set `is_published = true` on the notification
  2. Trigger Vercel revalidation for the notifications page via revalidation webhook
  3. Proceed to Automation 3 (social posting)

### Automation 3: Social Media Posting
- **Trigger:** After notification is approved and published
- **Flow:**
  1. Format post copy using Claude API (short, punchy, relevant hashtags like #JKSSB #JKJobs #Kashmir)
  2. Post to configured social channels (Telegram channel, WhatsApp channel, Twitter/X)

### Automation 4: SEO Meta Generation
- **Trigger:** On creation of any new exam, paper, or cut-off record in DB
- **Flow:**
  1. Webhook fires from Supabase (via pg_net or n8n Supabase trigger)
  2. Call Claude API with record context
  3. Generate `seo_title`, `seo_description`, `focus_keyword`
  4. Write back to the DB record

### Automation 5: Sitemap Revalidation
- **Trigger:** After any new content is published
- **Flow:**
  1. Ping Vercel deploy hook to trigger ISR revalidation
  2. Ping Google Search Console indexing API for new URLs

---

## 8. Admin CRM (Internal Dashboard)

A simple, solo-use internal dashboard at `/admin` — protected by Supabase Auth.

**Pages and features:**

### Dashboard / Home
- Stats: total exams, total notifications (published / pending), total papers, last scraper run time

### Notifications Manager
- Table view of all notifications (pending + published)
- Columns: title, exam, category, source URL, auto_fetched, published_at, is_published
- Actions: Approve (publishes + triggers social), Edit SEO fields, Delete
- SEO fields editable inline: seo_title, seo_description, focus_keyword
- Filter by: status (pending/published), exam, category, date range

### Exams Manager
- List of all exams
- Edit exam details: title, description, vacancy count, pay scale, eligibility
- Edit SEO fields per exam
- Toggle is_active

### Papers Manager
- Upload PDF → goes to Supabase storage
- Fill in: exam, year, subject, title
- View download counts per paper

### Cut-offs Manager
- Add/edit cut-off rows per exam per year
- Table view filterable by exam and year

### Exam Dates Manager
- Add/edit important dates per exam
- Flag tentative dates

### Syllabus Manager
- Add/edit syllabus sections per exam
- Reorder sections via sort_order

---

## 9. Design System

### Principles
- **Mobile-first** — 80%+ users on phones, many on 4G/slow connections
- **Content-first** — typography and readability over decoration
- **Zero ads, zero popups** — clean reading experience always
- **Dark mode** — supported via Tailwind `dark:` classes and CSS variables
- **Fast** — Lighthouse mobile 90+ target

### Visual Direction
- Avoid generic exam-site aesthetic (blue/yellow, cluttered sidebars)
- Clean whites/greys with a single accent color (deep teal or indigo suggested)
- Large readable font sizes — users are reading dense exam content
- Card-based layout for exam and notification listings
- Sticky header with exam quick-links on mobile

### Component List (to build)
- `ExamCard` — used on homepage and /exams index
- `NotificationCard` — used on homepage and /notifications feed
- `SyllabusAccordion` — expandable sections on syllabus page
- `CutoffTable` — filterable by year/category
- `PapersList` — downloadable papers with year/subject labels
- `DateTimeline` — important dates in chronological visual order
- `Breadcrumb` — all nested pages, also rendered as JSON-LD
- `SEOHead` — reusable component that renders all meta, OG, JSON-LD tags

---

## 10. Build Sequence

### Week 1 — Foundation
- [ ] Init Next.js 14 project with Tailwind, ESLint, TypeScript
- [ ] Set up Supabase project — run full schema migrations
- [ ] Configure Supabase Storage buckets
- [ ] Deploy to Vercel, connect .tech domain, configure env variables
- [ ] Build `SEOHead` component (title, description, OG, JSON-LD)
- [ ] Build site layout: header, footer, nav
- [ ] Build homepage (static shell, no data yet)

### Week 2 — Core Pages
- [ ] `/exams` index page
- [ ] `/exams/[slug]` overview page (SSG)
- [ ] `/exams/[slug]/syllabus` (SSG)
- [ ] `/exams/[slug]/previous-papers` (SSG)
- [ ] `/exams/[slug]/cut-offs` (SSG)
- [ ] `/exams/[slug]/important-dates` (SSG)
- [ ] Seed all data for 4–5 launch exams into Supabase

### Week 3 — Notifications + Admin CRM
- [ ] `/notifications` feed page (ISR, revalidate 30 min)
- [ ] `/notifications/[slug]` individual page (ISR)
- [ ] Build full Admin CRM (all pages listed in Section 8)
- [ ] Supabase Auth setup for admin login

### Week 4 — Automation + SEO Finishing
- [ ] Build n8n/Make.com scraper workflow (Automation 1)
- [ ] Build auto-publish + social posting workflow (Automations 2 & 3)
- [ ] Build SEO meta generation workflow (Automation 4)
- [ ] `next-sitemap` setup → auto XML sitemap
- [ ] `robots.txt` config
- [ ] Submit sitemap to Google Search Console
- [ ] Full Lighthouse audit, fix any issues
- [ ] Final content review for all 5 exams

### Month 2+ — Growth
- [ ] Monitor GSC for keyword rankings and click-through rates
- [ ] Add more exams based on search demand
- [ ] Begin mock test infrastructure
- [ ] Evaluate adding Telegram bot for notification alerts

---

## 11. Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only, never expose to client

# Vercel
VERCEL_REVALIDATION_SECRET=      # for ISR revalidation webhook

# Anthropic (for automation SEO generation)
ANTHROPIC_API_KEY=

# Social (for automation posting)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
```

---

## 12. Key Technical Rules for Claude Code

- Use **Next.js 14 App Router** — not Pages Router
- Use **TypeScript** throughout
- Use **Tailwind CSS** for all styling — no CSS modules, no styled-components
- Exam content pages → **`generateStaticParams` + SSG** — no `use client` on content pages
- Notifications page → **ISR with `revalidate`** — not full SSR
- Admin CRM pages → **`use client`** with Supabase client SDK
- Store all PDFs in **Supabase Storage** — never in `/public` or repo
- All Supabase service role operations → **server-side only** (Server Actions or Route Handlers)
- SEO component renders: `<title>`, `<meta name="description">`, Open Graph tags, JSON-LD — on every page
- Target **Lighthouse mobile score 90+** — check before each phase ships
- Use `next/image` for every image — no raw `<img>` tags
- No hardcoded API keys — all via env variables

---

## 13. Monetization Roadmap (Phase 3 — not in scope for launch)

- Sell curated PDF bundles at ₹99–₹299 (one-time, no subscriptions)
  - "Junior Assistant Complete Pack" — syllabus + 5 years papers + cut-off analysis
  - Subject-wise question banks
- Payment via Razorpay
- Delivery via Supabase Storage time-limited signed URLs (expire after 24 hours)
- No user accounts required for Phase 1 or Phase 2

---

## 14. Competitor Landscape (for reference)

| Site | Weakness |
|---|---|
| prepmart.in | Generic, heavy ads, poor mobile UX |
| jkexamlibrary.in | Cluttered, slow, ad-heavy |
| jkssbedge.com | Content is decent but design is poor, no automation evident |
| jkinfo.in | Pure aggregator, no added value |

**Our edge:** Clean design + fast mobile experience + same-day notifications + SEO from day one + automation-driven ops.