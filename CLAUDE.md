# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

JK Aspirant (https://jkaspirant.in) — a mobile-first exam resource website for JKSSB and JKPSC candidates in J&K. Covers notifications, syllabi, previous papers, cut-off history, exam calendars and score/rank tools. Goal: the clean, fast, trustworthy alternative to spammy ad-heavy aggregator sites. The site covers JKSSB only for now; don't claim JKPSC coverage in copy or titles until it has JKPSC content.

The site is **operated by Claude Code sessions**, not by hand-entering data in the admin CRM. See "Operations" below.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Storage:** Supabase Storage (PDF papers, OG images)
- **Hosting:** Vercel, domain jkaspirant.in
- **Dark mode:** next-themes
- **Sitemap:** `src/app/sitemap.ts`, built from live exams, visible updates and rank tools

## Build & Dev Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
```

## Architecture

### Rendering Strategy
- Exam content pages (`/exams/[slug]/*`) use **SSG** via `generateStaticParams`
- Notifications pages use **ISR** — feed revalidates every 30 min, detail pages every 1 hour
- Admin CRM pages (`/admin/*`) are **client-side** with `"use client"` and Supabase client SDK
- No `use client` on public content pages — keep them server-rendered

### SEO (First-Class Concern)
Every public page must have: `<title>`, meta description, Open Graph tags, JSON-LD structured data, canonical URL, and breadcrumbs. Use `buildMetadata()` from `src/lib/seo.ts` for all page metadata. SEO fields (seo_title, seo_description, focus_keyword) are stored per-record in the database.

### Key Source Paths
- `src/app/` — Next.js App Router pages
- `src/components/` — Shared React components
- `src/lib/supabase/client.ts` — Browser Supabase client (anon key)
- `src/lib/supabase/server.ts` — Server Supabase client (service role, server-only)
- `src/lib/seo.ts` — Metadata builder, JSON-LD helpers
- `src/lib/types/database.ts` — TypeScript interfaces matching DB schema
- `src/config/site.ts` — Site constants (name, URL, keywords)

### URL Structure
```
/                                Home: exam in focus, coming up, latest updates (ISR)
/notifications                   Updates feed (ISR)
/notifications/[slug]            Update detail (ISR)
/exams                           Exam list
/exams/[slug]                    SSG exam overview
/exams/[slug]/syllabus           SSG (404 when the exam has no rows; same for the three tabs below)
/exams/[slug]/previous-papers    SSG
/exams/[slug]/cut-offs           SSG
/exams/[slug]/important-dates    SSG
/calendar                        Upcoming exam / admit card dates
/previous-papers                 All official JKSSB question papers (links to jkssb.nic.in PDFs)
/tools, /tools/[tool]            Rank predictors
/admin/*                         Client-side CRM (auth-protected)
```

### Design & UX rules
The site is one narrow reading column (`.page-shell`, max-w-3xl) built from a few parts in `src/components/ui.tsx`. Keep to them:
- **Anything tappable is a `Row` inside a `GroupList`, a `.btn-primary` / `.btn-secondary`, or a `.chip`.** No tiny inline links, no cards with several links inside. Tap targets are at least 44px tall.
- **One primary action per screen.** Everything else is a row or secondary.
- **Show the answer first, details on demand.** Extra detail goes in a collapsed `<details>` (see the rank predictor).
- **Navigation:** four bottom tabs on phones (Home, Updates, Exams, Tools) in `MobileBottomNav`, the same links in the desktop header, a back link via `Breadcrumb`, and sticky tabs inside an exam (`ExamHeader`). Don't add a hamburger menu.
- Page titles use `PageHeader`; section titles use `Section`. Serif for headings, mono for dates and numbers.
- Plain words. No marketing copy, no "kickers" on every section.

### Database Tables
`exams`, `notifications`, `papers`, `cutoffs`, `syllabus_sections`, `exam_dates` — all have UUID primary keys. Full schema in `claude-info/inititl-plan.md` section 5.

## Technical Rules

- Use Next.js 14 **App Router** — not Pages Router
- All Supabase service role operations must be **server-side only** (Server Actions or Route Handlers)
- Use `next/image` for all images — no raw `<img>` tags
- Tailwind CSS only — no CSS modules or styled-components
- Target **Lighthouse mobile score 90+**
- No ads, no popups — clean reading experience
- PDFs go to Supabase Storage, never in `/public` or the repo. One exception, at the owner's request: small official notices we link from an update (e.g. an answer key) may live in `public/notices/` when the session has no Storage access. Papers and study material still go to Storage.

## Environment Variables

Required env vars are documented in `.env.local.example`. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client (also used by `scripts/` on the operator machine)
- `VERCEL_REVALIDATION_SECRET` — ISR revalidation webhook
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHANNEL_ID` — channel posting from `scripts/` only

## Operations (how the site is maintained)

Claude Code sessions (scheduled or manual, on the owner's Mac or in the cloud) do the content work. No paid AI APIs; no GitHub Actions pipelines yet.

- **Repeatable jobs are skills** in `.claude/skills/` (e.g. `sync-notifications`). Scheduled runs invoke the skill rather than improvising, so output stays consistent.
- **Deterministic steps are scripts** in `scripts/`. When a session gets something working (a scraper, an import), it saves it as a script and commits it; later runs execute the script and only fix it when it breaks.
  - `scripts/publish-notification.mjs` — upsert a notification (draft by default), revalidate, announce on Telegram once. Run with `node --env-file=.env.local ...`.
  - `scripts/sources/*.mjs` — one scraper per official source, printing JSON lines `{title, url, date}`.
  - `scripts/sources/jkssb-papers.mjs` — reads JKSSB's official "Previous Question Papers" page and rewrites `src/content/papers.json`, which feeds `/previous-papers`. We only link the official PDFs, never re-host them. Papers tied to an exam go in that exam's `papers` list in `src/content/exams/data/*.json` (label stand-ins "(similar level)").
  - `ops/sync-state.json` — JKSSB notice URLs the sync has already handled (`seen_urls`). Committed so cloud runs share it; update it in the same PR as the site change.
  - `scripts/telegram-post.mjs` — posts updates that are already live on jkaspirant.in (read from the sitemap) to the channel in `TELEGRAM_CHANNEL_ID`, once each, max 3 per run. Dry run by default; `--send` posts; `--init` marks everything live as posted. Posted slugs are kept in `ops/telegram-posted.json` (committed, so every cloud run shares it). Currently pointed at a test channel (`@jkaspirant_in`); the site still links the partner channel.
- **Scratch output** (drafts, downloaded PDFs) goes in `tmp/` (gitignored). PDFs to keep go to Supabase Storage.
- **Accuracy over speed:** official sources only, link the original notice, never invent dates/numbers. New items are drafts until the owner approves, unless the owner has switched auto-publish on.
- **Ask the owner** when blocked on accounts, credentials, CAPTCHAs, or anything needing a judgement call — then wait.
- **Which exams are live** is set in `src/config/exams.ts` (an exam needs no database row to be listed; entries marked `awaited` have an advertisement out but no exam date). Exams not listed there are hidden everywhere, and so are updates tied to them. For listed exams, only the title, board, confirmed post count and one-line status from that file are shown; pay scale, eligibility and description from the database are not displayed. Syllabus / Papers / Cut-offs / Dates tabs appear only when the database has rows for them. Add an exam there only when its facts are confirmed.
- **File-backed content** (edit + commit; works from sessions with no database access):
  - `src/content/notifications.ts` — updates shown alongside rows from the `notifications` table (database wins on a slug clash). Each gets a full detail page.
  - `src/content/calendar.ts` — dated events for "Coming up" on the homepage and `/calendar`. Past dates drop off the homepage on their own.
  - `src/config/spotlight.ts` — the homepage "exam in focus" card: headline, one-line detail, stage tracker, buttons. Set to `null` when nothing is hot.
  - `src/config/rank-predictor.ts` — one entry per exam rank tool (`/tools/<toolSlug>`).
- **When an exam moves a stage** (answer key, objections, result): update the spotlight headline and stages, add an update in `src/content/notifications.ts` (or the database), adjust `src/content/calendar.ts`, update the exam's `status` line in `src/config/exams.ts`, and flip `answerKeyReleased` in the rank config.
- **Rank tool before the exam:** an entry with `isOpen: false` renders a locked page (no inputs, nothing saved, no database calls): when it opens with a live countdown, how it will work, exam date, marking and posts by category. The API also refuses submissions. On exam evening: set `model.anchorScore` and `appeared` from the best available estimate, then flip `isOpen` to true. The JK Police SI entry starts with placeholder model values.
- **Closing a rank tool** (when new scores have dried up): freeze the data into `src/content/rank-snapshots/<examKey>.json` (totals, per-day counts, the `rank_stats` histogram, category counts and medians, the masked top 10; see the FAA file and register it in `index.ts`), then set `isOpen: false` and `closedOn` in the rank config. The page becomes a results page at the same URL (says the predictor ran and is closed, expected cut-offs by category, charts, frozen leaderboard); people who saved a score still see it. The API refuses new scores once `isOpen` is false.
- **Rank predictor.** `src/app/api/rank/route.ts` stores scores in `score_submissions` (migrations `006`–`008`) and returns counts plus the leaderboard; the estimate is computed in the browser by `predict()` in `src/lib/rank.ts`.
  - *Estimate:* starts from the `model` in the rank config (expected score at a known rank, spread, uncertainty), shifts with shared scores, and is never better than the number of higher scores already shared. The headline range is deliberately tight (about 100 ranks, `shownRange()`); the honest wider band drives the verdict and sits under "See the details". Tune `model.anchorScore` as better cut-off information arrives; after the official result, set it to the real cut-off and `uncertainty` to about 1.
  - *How shared scores are used:* under 100 scores, only the median nudges the estimate (`selectionTilt`, `sampleDoubt`). From 100 scores, the open-merit cut-off is read from the top of the shared scores (`cutoffFromTopScores()`): `topBoost` says how over-represented top candidates are among sharers, and the weight on data is n / (n + 300). Scores at or above `ignoreScoresFrom` are treated as fake. If estimates look too harsh or too soft against outside evidence, `topBoost` is the setting to change (lower = softer).
  - *Category seats:* `openSeats` and `reserved` in the rank config hold the notification's post breakup. The top `openSeats` overall take open-merit seats whatever their category; reserved candidates below that line are ranked inside their category against its seats. Each reserved category has a `share` (of candidates) and `gap` (marks below average); both are estimates to tune. Categories not listed in `reserved` are treated as open merit.
  - *One score per phone:* a phone is recognised by an httpOnly cookie backed by a localStorage id. A saved score can be corrected once, and once more after `answerKeyReleased` is set. New phones per network address are capped per day. A returning visitor sees their saved rank instead of the form.
  - *Leaderboard:* opt-in, top 10. The full name is stored privately in `full_name` (migration `008`); the site only ever sends the masked form (`maskName()`, first two letters of up to three names, e.g. `Sh*** Ah*** Mi***`). Entries saved before migration 008 have only the older one-letter mask. Scores above `leaderboardMaxScore` are kept off the board. To remove a fake entry, set `on_leaderboard = false` (or delete the row) in Supabase.
- **Contact:** `/contact` (name (required) + a single message box + optional email/phone, migration `010`; `/feedback` redirects here) posts to `src/app/api/feedback/route.ts`, stored in Supabase `feedback` (migration `009`, service role only; honeypot field + 8 per network per day; `kind` is always `other` now). Exam and update pages have a "Contact us" row with the page prefilled. Scheduled runs read new rows (`status = 'new'`), summarise them for the owner and mark them `seen`; fix confirmed data errors through the normal flow.
- **About / Privacy:** `/about` (first-person "we": why the site exists and why it can be trusted; no owner name or social links, by the owner's choice) and `/privacy` (what's stored; disclaimer). Update `/privacy` whenever the site starts storing something new.
- **Old address redirect:** `src/middleware.ts` sends pages on `jkaspirants.vercel.app` to the main domain when `REDIRECT_TO_PRIMARY=1`, and carries the visitor's device id across so saved ranks and the one-score rule survive the move. API routes and files are not redirected.
- **Analytics:** Google Analytics 4 loads from `src/components/Analytics.tsx` (ID in `siteConfig.gaId`, not on `/admin`). Report an action with `track()` from `src/lib/analytics.ts`, or put `data-event="name"` on a link or button. Current events: `rank_predicted`, `score_corrected`, `leaderboard_join`, `leaderboard_leave`, `share`, `telegram_join_click`, `pdf_open`, `rank_details_open`, `contact_sent`. Never send names, scores or anything identifying.
- **Telegram:** the site promotes its updates channel (`telegramUrl` in `src/config/site.ts`) through `TelegramNudge`. Plain wording ("JKSSB updates on Telegram"), no "free notes" and no channel name on the site: one quiet card per page at most, after the main content (home, update pages, rank result) plus a footer link. Don't add more placements or pop-ups.
- Paid PDF bundles (Razorpay), `/search` and `/resources` were removed on 16 Nov 2026 (see git history to restore). `next.config.mjs` redirects their old URLs. The admin CRM keeps only the content pages.

## Implementation Plans

Original phase 1 plans are in `docs/superpowers/plans/` (historical; phase 1 is built). Master index: `2026-03-26-phase1-master-plan.md`.
