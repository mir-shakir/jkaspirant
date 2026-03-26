# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

JK Aspirant — a mobile-first exam resource website for JKSSB and JKPSC candidates in Kashmir. Covers notifications, syllabi, previous papers, cut-off history, and exam calendars for 5 launch exams.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Storage:** Supabase Storage (PDF papers, OG images)
- **Hosting:** Vercel with custom .tech domain
- **Dark mode:** next-themes
- **Sitemap:** next-sitemap (runs as postbuild)

## Build & Dev Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also generates sitemap via postbuild)
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
/exams/[slug]                    SSG exam overview
/exams/[slug]/syllabus           SSG
/exams/[slug]/previous-papers    SSG
/exams/[slug]/cut-offs           SSG
/exams/[slug]/important-dates    SSG
/notifications                   ISR feed
/notifications/[slug]            ISR detail
/admin/*                         Client-side CRM (auth-protected)
```

### Database Tables
`exams`, `notifications`, `papers`, `cutoffs`, `syllabus_sections`, `exam_dates` — all have UUID primary keys. Full schema in `claude-info/inititl-plan.md` section 5.

## Technical Rules

- Use Next.js 14 **App Router** — not Pages Router
- All Supabase service role operations must be **server-side only** (Server Actions or Route Handlers)
- Use `next/image` for all images — no raw `<img>` tags
- Tailwind CSS only — no CSS modules or styled-components
- Target **Lighthouse mobile score 90+**
- No ads, no popups — clean reading experience
- PDFs go to Supabase Storage, never in `/public` or the repo

## Environment Variables

Required env vars are documented in `.env.local.example`. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client
- `VERCEL_REVALIDATION_SECRET` — ISR revalidation webhook

## Implementation Plans

Detailed phase 1 plans are in `docs/superpowers/plans/`. Master index: `2026-03-26-phase1-master-plan.md`. Execute sub-plans in order: database setup -> foundation -> core pages -> notifications -> admin CRM.
