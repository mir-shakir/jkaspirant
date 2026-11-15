---
name: sync-notifications
description: Check official J&K exam sources for new notices, prepare site notifications, and publish after approval. Use for scheduled or manual "sync updates" runs.
---

# Sync notifications

Goal: every new official notice relevant to JKSSB/JKPSC aspirants appears on the site (and Telegram) quickly, accurately, and exactly once.

## Sources (official only — never copy aggregator sites)
| Source | Page |
|---|---|
| JKSSB | https://jkssb.nic.in/Whatsnew.html |
| JKPSC | https://jkpsc.nic.in (What's New / Notifications) |

Add more sources here (JKBOSE, KU, JU, JKP) only after a script exists for them.

## Steps
1. For each source, run its scraper in `scripts/sources/` (e.g. `node scripts/sources/jkssb.mjs`). If no scraper exists yet, or it fails because the page changed, inspect the page (browser or curl), write/fix the scraper, and commit it. Scrapers print JSON lines: `{title, url, date}`.
2. Dedupe: skip any item whose `source_url` or slug already exists in the `notifications` table. Do not rely on memory of previous runs.
3. For each new item, open the PDF/notice and extract: exam/post, notification number, category (`notification | admit_card | answer_key | result`), key dates, vacancies, fee, eligibility summary. Never guess a date or number — if it isn't in the source, leave it out.
4. Write `tmp/notifications/<slug>.json` (format in `scripts/publish-notification.mjs`). Slug rule: `<board>-<post>-<category>-<year>`, e.g. `jkssb-faa-answer-key-2026`. Body: short plain-language summary, a key-dates list, and "Official notice: <source_url>".
5. Save as drafts: `node --env-file=.env.local scripts/publish-notification.mjs tmp/notifications/<slug>.json`
6. Approval: list the drafts (title + one line each) to the owner and wait. Only after approval run again with `--publish --telegram`.
   (Once the owner says auto-publish is on, skip the wait for JKSSB/JKPSC items.)
7. Report: what was new, what was published, any source that failed.

## Rules
- Official sources and links only. Every item links to the original notice.
- Never re-announce an item on Telegram (the script handles this; don't bypass it).
- Big exams (lakh+ candidates): also update the exam hub page (`exams` / `exam_dates` tables) when dates change.
