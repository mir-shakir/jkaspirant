# Phase 1 — Master Implementation Plan

> **For agentic workers:** This is the master plan index. Execute sub-plans in the order listed below. Each sub-plan is self-contained and should be executed using superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Launch the JK Aspirant website — a clean, fast, mobile-first exam resource hub for JKSSB and JKPSC candidates with 5 exams, notifications, admin CRM, and full SEO.

---

## Execution Order

Execute these sub-plans sequentially. Each depends on the previous one.

### 1. Database Setup (run first — other plans need data)
**Plan:** [`2026-03-26-phase1-database-setup.md`](./2026-03-26-phase1-database-setup.md)
**Tasks:** 4 | **Scope:** Schema, RLS, storage buckets, seed data
**Deliverable:** Fully populated Supabase database with 5 exams + sample data

### 2. Foundation & Infrastructure
**Plan:** [`2026-03-26-phase1-foundation.md`](./2026-03-26-phase1-foundation.md)
**Tasks:** 10 | **Scope:** Next.js init, Supabase clients, SEO helpers, layout, homepage shell, sitemap, 404
**Deliverable:** Deployable Next.js app with layout, homepage, and infrastructure

### 3. Core Exam Pages (SSG)
**Plan:** [`2026-03-26-phase1-core-pages.md`](./2026-03-26-phase1-core-pages.md)
**Tasks:** 9 | **Scope:** Exam index, overview, syllabus, papers, cut-offs, dates — all SSG
**Deliverable:** All exam content pages live with data from Supabase

### 4. Notifications Pages (ISR)
**Plan:** [`2026-03-26-phase1-notifications.md`](./2026-03-26-phase1-notifications.md)
**Tasks:** 4 | **Scope:** Notifications feed (ISR 30min), detail pages (ISR 1hr), revalidation API
**Deliverable:** Notifications system with ISR and on-demand revalidation

### 5. Admin CRM Dashboard
**Plan:** [`2026-03-26-phase1-admin-crm.md`](./2026-03-26-phase1-admin-crm.md)
**Tasks:** 8 | **Scope:** Auth, dashboard, CRUD managers for all 6 entities
**Deliverable:** Full admin dashboard for content management

---

## Summary

| Sub-Plan | Tasks | Key Components |
|---|---|---|
| Database Setup | 4 | Schema, RLS, storage, seed data |
| Foundation | 10 | Next.js, layout, SEO, homepage, sitemap |
| Core Pages | 9 | 6 exam page types, 5 components, SSG |
| Notifications | 4 | Feed, detail, ISR, revalidation API |
| Admin CRM | 8 | Auth, 6 CRUD managers, sidebar |
| **Total** | **35 tasks** | |

## Out of Scope (Phase 2+)
- n8n/Make.com automation workflows (scraping, social posting)
- Google Search Console integration
- Razorpay payments
- Mock tests
- Telegram bot
- User accounts

These are documented in the original plan at `claude-info/inititl-plan.md` sections 7, 10 (Month 2+), and 13.
