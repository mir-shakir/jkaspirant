// File-backed updates. These appear on the site next to rows from the Supabase
// `notifications` table, so a session with no database access can still publish
// by committing here. If a database row has the same slug, the database wins.
//
// Rules: official facts only, plain language, never guess a date or number.
// `body` is trusted HTML written by us (h2, p, ul, li, strong, a only).

import type { Notification } from "@/lib/types/database";

export interface ContentNotification {
  slug: string;
  title: string;
  category: NonNullable<Notification["category"]>;
  /** ISO date-time, IST */
  published_at: string;
  /** One or two sentences, shown in lists and used as meta description. */
  summary: string;
  body: string;
  source_url: string;
  exam?: { slug: string; title: string };
}

const JKSSB_WHATS_NEW = "https://jkssb.nic.in/Whatsnew.html";

export const contentNotifications: ContentNotification[] = [
  {
    slug: "jkssb-faa-exam-held-answer-key-awaited-2026",
    title: "JKSSB FAA exam held on 15 November: answer key awaited",
    category: "notification",
    published_at: "2026-11-15T18:00:00+05:30",
    summary:
      "The Accounts Assistant (Finance) written exam for 600 posts was held on 15 November 2026. The provisional answer key is awaited.",
    body: `
<p>JKSSB held the OMR-based written exam for <strong>Accounts Assistant (Finance Department)</strong> on Sunday, 15 November 2026, from 1:00 PM to 3:00 PM across all 20 districts.</p>
<h2>At a glance</h2>
<ul>
  <li><strong>Posts:</strong> 600 (Notification No. 10 of 2025, Item No. 271)</li>
  <li><strong>Candidates registered:</strong> 1,61,961</li>
  <li><strong>Paper:</strong> 120 marks, 2 hours, 0.25 negative marking for each wrong answer</li>
  <li><strong>Selection:</strong> written exam merit followed by document verification, no interview</li>
</ul>
<h2>What happens next</h2>
<ul>
  <li><strong>Provisional answer key</strong> from JKSSB. No date has been announced yet.</li>
  <li><strong>Objection window</strong> after the key is published.</li>
  <li><strong>Final key and result.</strong></li>
</ul>
<p>Until the key is out, you can estimate your score and likely rank with our <a href="/tools/jkssb-faa-rank-predictor">FAA rank predictor</a>.</p>`,
    source_url: JKSSB_WHATS_NEW,
    exam: { slug: "finance-accounts-assistant", title: "Finance Accounts Assistant" },
  },
  {
    slug: "jkssb-sub-inspector-exam-date-2026",
    title: "JK Police Sub-Inspector exam on 29 November",
    category: "notification",
    published_at: "2026-11-15T17:00:00+05:30",
    summary:
      "JKSSB has scheduled the JK Police Sub-Inspector written exam for 29 November 2026. Admit cards are expected about 7 days before.",
    body: `
<p>As per the JKSSB advance notice dated 1 August 2026, the written exam for <strong>Sub-Inspector (Notification 02 of 2024)</strong> is scheduled for <strong>Sunday, 29 November 2026</strong>.</p>
<h2>Admit card</h2>
<p>JKSSB has said admit cards will be available about 7 days before the exam, so around 22 November. Dates can change, so confirm on the official site before you travel.</p>`,
    source_url: JKSSB_WHATS_NEW,
    exam: { slug: "sub-inspector", title: "JK Police Sub-Inspector" },
  },
  {
    slug: "jkssb-police-constable-exam-dates-2026",
    title: "JK Police Constable exams from 13 December: full schedule",
    category: "notification",
    published_at: "2026-11-15T16:00:00+05:30",
    summary:
      "JKSSB has scheduled the JK Police Constable written exams for 13, 20, 27 and 30 December 2026, and Sub-Inspector (Telecommunication) for 23 December.",
    body: `
<p>JKSSB announced these Home Department exam dates in its schedule notice of early August 2026. Admit cards are issued seven days before each exam. Dates can change, so confirm on the official site before you travel.</p>
<h2>Exam dates</h2>
<ul>
  <li><strong>13 December 2026:</strong> Constable (Executive), Notification 12 of 2025, Items 273–274</li>
  <li><strong>20 December 2026:</strong> Constable (Armed / IRP / SDRF), Notification 14 of 2025, Items 323–324</li>
  <li><strong>23 December 2026:</strong> Sub-Inspector (Telecommunication), Notification 11 of 2025, Item 272</li>
  <li><strong>27 December 2026:</strong> Constable (Telecommunication), Notification 15 of 2025</li>
  <li><strong>30 December 2026:</strong> Constable (Photographer), Notification 15 of 2025</li>
</ul>`,
    source_url: JKSSB_WHATS_NEW,
    exam: { slug: "police-constable", title: "JK Police Constable" },
  },
];
