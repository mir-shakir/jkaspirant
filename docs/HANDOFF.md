# JK Aspirant — handoff (16 Nov 2026)

Written at the end of a long cloud session, for a new Claude Code session on the owner's Mac.
Read `CLAUDE.md` first: it holds the standing rules (design, operations, rank predictor). This file is the story, the current state and the plan.

## 1. What this is and what the owner wants

- **Site:** https://jkaspirant.in — exam updates and tools for JKSSB aspirants in Jammu & Kashmir. Next.js 14 on Vercel, Supabase database (project `jkaspirant`, id `nmpnbppivikvkezqdnwo`, Singapore region).
- **Owner:** Shakir, solo, often on his phone. Started the site in March 2026, abandoned it, restarted on 15 Nov 2026.
- **Goal:** the clean, fast, trustworthy alternative to ad-heavy aggregator sites, and a side venture that at least pays for itself.
- **How he wants to work:** Claude Code sessions run the site (his subscription; no paid AI APIs, no GitHub Actions yet). Minimal manual effort. He approves, Claude does.
- **What he cares about most right now:** keep the momentum from the FAA exam, win organic search traffic over the next few weeks, cover more exams, and make the workflow smoother with little human input.

## 2. Where things stand (checked 16 Nov, about 11 AM IST)

- **Everything is merged to `main` and live.** No pending work except this file.
- **Domain:** `jkaspirant.in` bought on GoDaddy 15 Nov (renews Nov 2027 at ₹899), connected to Vercel. Old `jkaspirants.vercel.app` links redirect to it and carry the visitor's saved-score identity (`src/middleware.ts`; `REDIRECT_TO_PRIMARY=1` is set in Vercel).
- **`www.jkaspirant.in` does not resolve yet.** The owner said he will add it in Vercel himself.
- **Rank predictor (FAA):** 583 saved scores (546 entered after the answer key), 286 on the leaderboard, 295 full names stored. At most 5 phones from one network, so no sign of bulk fakes. 4 obvious fake scores at 115+ (ignored by the estimate, hidden from the board).
- **Shared-score spread:** median 78.5, top tenth above 91.7, 81 scores at 90+, 43 at 95+. By category: OM 243, RBA 102, ST-1 61, SC 53, ST-2 43, OBC 34, EWS 25, ALC/IB 22.
- **Analytics (GA4, `G-FCTHK220S8`):** 715 users in the first ~13 hours, 1.6K views on the rank predictor, 1m13s average engagement. Almost all traffic is "direct" (links opened from Telegram); 1 visit from Google so far.
- **Google Search Console:** sitemap submitted by the owner on 16 Nov.
- **Database content is thin:** `exams` 5 rows, `notifications` 1 (old sample, hidden), `syllabus_sections` 5 (Junior Assistant sample only), `papers` 0, `cutoffs` 0, `bundles` 3 (paused). The site's visible content comes from files in the repo (section 5).

## 3. What was built in this session, in order

1. **Review and decision to restart.** Original problem: everything needed manual entry in an admin panel, so the site died.
2. **Operating model:** skills + scripts + file-backed content, run by Claude Code sessions (`CLAUDE.md` → Operations).
3. **Two redesigns.** First a "notice board" look; the owner then said the UX was poor (hard to navigate, too much on screen). The second pass rebuilt every page around one narrow column and one tappable-row pattern, four bottom tabs, no hamburger (`src/components/ui.tsx`, `CLAUDE.md` → Design & UX rules). He was happy with colours and type; structure was the issue.
4. **FAA rank predictor** `/tools/jkssb-faa-rank-predictor`, launched the evening of the exam (15 Nov) and shared in a few Telegram groups. This produced all the traffic.
5. **Trimmed content to confirmed facts only** after the owner said exam info was inaccurate.
6. **Answer key** published within about an hour of release (owner supplied the PDF).
7. **Telegram nudge, GA4 with events, domain move with redirect.**

## 4. Corrections made along the way (so they are not repeated)

- **Don't show unverified exam details.** Seed data in the database (pay, eligibility, descriptions, post counts) was wrong. Exam pages now show only what is in `src/config/exams.ts`.
- **"#1 rank" with one score was embarrassing.** The estimate now starts from past patterns and never depends on having data.
- **The owner wants a tight rank range (about 100 wide),** even though real uncertainty is wider. The honest band still drives the verdict and is shown under "See the details".
- **One score per phone,** one correction, one more after the answer key. Returning visitors see their saved rank.
- **Category-wise seats matter.** Open merit is 240 of 600; reserved candidates in the top 240 take open seats. Breakup confirmed from Annexure-A of Advertisement Notification 10 of 2025 (dated 24.11.2025, Item 271): OM 240, SC 48, ST-1 60, ST-2 60, OBC 48, ALC/IB 24, RBA 60, EWS 60.
- **Early shared scores come from top candidates.** Trusting the median made estimates far too harsh at 35 scores; trusting it too little made them too soft at 469. The current method reads the cut-off from how many high scores have been shared (`topBoost: 40`). Open-merit cut-off estimate is now about 89.5–95.5. The owner's view: these exams are competitive and cut-offs run high.
- **Leaderboard names:** the first version stored only a one-letter mask. The owner asked for full names stored privately and two letters shown (`Sh*** Ah*** Mi***`). Entries before migration 008 keep the old mask.
- **PwBD:** asked about, then dropped. The notification gives no PwBD post count (clause 7(b) leaves it to the department). Do not add it unless he raises it again.
- **Paid bundles and ads:** bundles paused, ads ruled out.
- **Supabase migrations were painful on a phone.** A session with the Supabase connector should apply them directly.

## 5. How content gets onto the site

- `src/config/exams.ts` — which exams exist and their one-line status. No database row needed.
- `src/content/notifications.ts` — updates (each gets a page). Database rows also work via `scripts/publish-notification.mjs`.
- `src/content/calendar.ts` — dated events.
- `src/config/spotlight.ts` — the home card for the exam in focus.
- `src/config/rank-predictor.ts` — rank tool settings per exam.
- `public/notices/` — small official PDFs (the exception to the "PDFs in Storage" rule).

Currently listed: FAA, JK Police Sub-Inspector (29 Nov), JK Police Constable (13, 20, 27 Dec), and under "Date awaited" Class-IV MTS (2,863 posts, applications closed 12 Nov) and Advertisement 08 of 2026 (518 posts).

## 6. The cloud session's big limitation, and what the Mac session should do first

The cloud session could never open `jkssb.nic.in` or `jkpsc.nic.in` (they drop connections from outside India). Everything came from news sites and one mirrored PDF. **So the first job on the Mac is to verify against the official site:**

1. **Police exam dates** (from JKSSB's schedule notice of about 1–2 Aug 2026, as reported by Kashmir Life and Rising Kashmir): SI 29 Nov (Notification 02 of 2024, Item 07); Constable (Executive) 13 Dec (12 of 2025, Items 273–274); Constable (Armed/IRP/SDRF) 20 Dec (14 of 2025, Items 323–324); SI (Telecom) 23 Dec (11 of 2025, Item 272); Constable (Telecom) 27 Dec and Constable (Photographer) 30 Dec (15 of 2025). Check for rescheduling, and the exam mode (sources disagreed: CBT or OMR).
2. **The "official notice" buttons** on all four updates point to `https://jkssb.nic.in/Whatsnew.html`. Replace with the real PDF links.
3. **FAA answer key:** objections run for three working days from 16 Nov. Find the exact last date; watch for the final key and the result.
4. **SI admit card:** the calendar has it as "expected 22 Nov" (calculated, not announced). Confirm or correct.
5. **MTS closing date** (12 Nov, per the owner) and the **518-post advertisement** closing date (sources said 9 Oct or 24 Oct).
6. **Post count for Sub-Inspector** (not shown because unconfirmed; older reports said 669).
7. **Build the first real scraper** `scripts/sources/jkssb.mjs` and run the `sync-notifications` skill end to end. This has never been run.

## 7. Plan discussed with the owner (priority order)

**This week (FAA search interest is at its peak):**
- An **expected cut-off page** for FAA using the real score data (category-wise estimates, score spread). Nobody else has 580+ real scores.
- A **stats block** on the rank tool page that Google can read without entering a score.
- **SEO clean-up:** remove from the sitemap the paused `/bundles` pages, `/search`, and exam sub-pages that have no content (`/exams/*/syllabus`, `/previous-papers`, `/cut-offs`, `/important-dates`); add a share image (`siteConfig.ogImage` points to `/og-default.png`, which does not exist in `public/`); add Organization structured data with a logo.
- **Search Console:** check coverage and queries once data appears.

**Before 29 Nov:**
- **Sub-Inspector rank tool,** opened on exam day. Needs the SI paper pattern, negative marking and category breakup from the official notification. Add an entry in `src/config/rank-predictor.ts`; the page and API are generic.
- **A channel the owner controls.** The Telegram card currently promotes a friend's channel (JKExamSPARK, `t.me/JkExamSpark_jkssb`). Suggested: his own JK Aspirant channel with automatic posts (`scripts/publish-notification.mjs` posts to Telegram given a bot token), plus a "tell me when the result is out" prompt on the rank result. The owner has not decided.
- **Tap-in answer checker:** pick series A–D, tap answers for 120 questions, get right/wrong/score, send it into the rank tool. All four FAA series keys are in `public/notices/jkssb-faa-provisional-answer-key-2026.pdf`. The owner liked the idea. A photo-of-OMR reader was discussed and deferred as unreliable.

**Ongoing:**
- A rank tool for each Constable exam in December, and for MTS when dated (the largest audience).
- A scheduled daily sync of official notices, with little or no approval step once it proves accurate.
- A "How close were we?" page on FAA result day; then set `model.anchorScore` to the real cut-off.
- Syllabus and previous papers per exam (search traffic all year). A daily quiz was suggested as a later habit feature.

## 8. Open items and small risks

- **Supabase security advisor:** `increment_coupon_usage` (from the paused checkout) is callable by anyone; `rank_stats` and two other functions have a mutable search path. The owner chose to deal with this later. `score_submissions` is closed to public access (RLS on, no policies; only the service role reads it).
- **`rank_stats` fallback** in `src/app/api/rank/route.ts` samples only the latest 1,000 rows if the database function fails. Fine while the function works.
- **Leaderboard** shows scores up to 112; the top entries (105–109.5) may include inflated self-reports. Remove with `on_leaderboard = false` if needed.
- **Rank estimates got harsher** when the method changed on the night of 15 Nov. If people ask, the honest answer is that it was updated after 450+ real scores came in.
- **GA4 key events:** the owner was shown how to mark `rank_predicted` and `telegram_join_click` as key events; not confirmed done.
- **`.env.local` on the Mac** needs the Supabase keys, `VERCEL_REVALIDATION_SECRET`, and (if a channel is set up) `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHANNEL_ID`. See `.env.local.example`.

## 9. Working with this owner

- Give clear numbered steps for anything he must do in Vercel, GoDaddy, Supabase or Google; he often works from his phone.
- Report before acting when facts are involved: say what was found and where from, then add only confirmed items.
- Keep pages minimal. Answer first, details on demand.
- He moves fast and thinks in hours, not weeks. Ship, show a screenshot, adjust.
