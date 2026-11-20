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


// Official JKSSB notices (all checked on jkssb.nic.in, 16 Nov 2026).
const PDF = "https://jkssb.nic.in/Pdf";
const HOME_EXAMS_NOTICE = `${PDF}/notice_01082026.pdf`;

export const contentNotifications: ContentNotification[] = [
  {
    slug: "jkssb-sub-inspector-admit-card-2026",
    title: "JK Police Sub-Inspector admit card from 26 November, exam on 29 November",
    category: "admit_card",
    published_at: "2026-11-20T14:45:00+05:30",
    summary:
      "JKSSB will release admit cards for the JK Police Sub-Inspector (Home Department) written exam from 26 November 2026. The OMR-based exam is on 29 November 2026.",
    body: `
<p>JKSSB has issued a notice on admit cards for the OMR-based written exam for <strong>Sub-Inspector, Home Department</strong> (Advertisement Notification 02 of 2024, Item 07).</p>
<h2>Key dates</h2>
<ul>
  <li><strong>Admit card available from:</strong> 26.11.2026</li>
  <li><strong>Exam date:</strong> 29.11.2026</li>
</ul>
<h2>How to download</h2>
<ul>
  <li>Go to jkssb.nic.in and open the E-Admit Card link on the homepage.</li>
  <li>Log in with your username and password, then enter the OTP sent to your registered email ID and mobile number.</li>
  <li>Download and print the admit card. Bring a clear printed copy to the exam.</li>
</ul>
<h2>On exam day</h2>
<ul>
  <li>Reach your centre at least <strong>two hours</strong> before the exam time for biometric/facial checks.</li>
  <li>After the exam, hand the admit card back to the invigilator, signed by you and the invigilator.</li>
</ul>
<h2>Can't download it?</h2>
<p>Email <strong>ssbjk-grievance@jk.gov.in</strong> with your name, father's name, mother's name, date of birth, application number, post name and advertisement number, or visit the Board two days before the exam with proof that you applied and paid the fee. The same applies if the photo on the admit card is wrong. No claims are taken on exam day.</p>
<p><a href="${PDF}/AdmitCard_Notice_20112026.pdf">Official notice (PDF)</a></p>
<p>Notice No. JKSSB-COE0EXAM (UT)/6/2026-03 (7990247), dated 20.11.2026.</p>`,
    source_url: `${PDF}/AdmitCard_Notice_20112026.pdf`,
    exam: { slug: "sub-inspector", title: "JK Police Sub-Inspector" },
  },
  {
    slug: "jkssb-junior-engineer-mechanical-apply-dates-2026",
    title: "JKSSB Junior Engineer (Mechanical): 127 posts, apply from 23 November to 22 December",
    category: "notification",
    published_at: "2026-11-20T11:00:00+05:30",
    summary:
      "JKSSB has announced fresh dates for the 127 Junior Engineer (Mechanical) posts in PWD (R&B): apply online from 23 November to 22 December 2026. A corrigendum also clarifies which degrees and diplomas count.",
    body: `
<p>JKSSB has announced fresh application dates for the <strong>127 posts of Junior Engineer (Mechanical)</strong> in the Public Works (R&amp;B) Department (Advertisement Notification No. 10 of 2026, Item No. 265, UT cadre). The earlier dates were postponed on 15 November.</p>
<h2>Key dates</h2>
<ul>
  <li><strong>Apply online:</strong> 23.11.2026 (12:00 AM) to 22.12.2026 (11:59 PM)</li>
  <li><strong>Fee online:</strong> same window, last date 22.12.2026 (11:59 PM)</li>
  <li><strong>Exam date:</strong> not announced yet</li>
</ul>
<h2>Qualification clarified</h2>
<p>A corrigendum dated 19.11.2026 says the qualification is read as in the J&amp;K Engineering (Subordinate) Service Recruitment Rules, 1997: a 3-year diploma in Mechanical Engineering from a government-recognised institute, or an Indian university degree in Mechanical Engineering, or AMIE (Sections A and B).</p>
<p>A degree or 3-year diploma in <strong>Aeronautical, Automobile or Production Engineering</strong> counts as equivalent to a degree or diploma in Mechanical Engineering.</p>
<h2>How to apply</h2>
<p>Online only, on jkssb.nic.in, through the "Log-in (Apply on Various Posts)" tab. You need a valid email ID and mobile number to register, and a valid domicile certificate. Other terms of the advertisement are unchanged.</p>
<p><a href="${PDF}/Corrigendum_Advt_10OF2026_19112026.pdf">Corrigendum with the new dates (PDF)</a> · <a href="${PDF}/Notice_10OF2026_19112026.pdf">Instructions for applying (PDF)</a> · <a href="${PDF}/Advt_notification_10OF2026_21102026.pdf">Full advertisement (PDF)</a></p>
<p>Notice No. JKSSB-PLAN/16/2022-03, dated 19.11.2026.</p>`,
    source_url: `${PDF}/Corrigendum_Advt_10OF2026_19112026.pdf`,
    exam: { slug: "junior-engineer-mechanical", title: "Junior Engineer (Mechanical)" },
  },
  {
    slug: "jkssb-faa-exam-integrity-press-note-2026",
    title: "JKSSB Accounts Assistant exam: Board says one cheating attempt did not affect the exam",
    category: "notification",
    published_at: "2026-11-20T11:00:00+05:30",
    summary:
      "In a press note, JKSSB says an isolated attempt to use unfair means in the 15 November Accounts Assistant exam was stopped by J&K Police and did not compromise the exam. Extra checks are being added for upcoming exams.",
    body: `
<p>JKSSB has issued a press note on the <strong>Accounts Assistant (Finance) exam held on 15 November 2026</strong>.</p>
<ul>
  <li>The exam was held in all 20 districts at 493 centres. 1,61,946 candidates were scheduled to appear for 600 posts.</li>
  <li>The Board says an isolated attempt to use unfair means <strong>did not compromise the exam</strong>. J&amp;K Police identified and caught those allegedly involved.</li>
  <li>For upcoming exams the Board is adding further measures: updated procedures, stricter access control at centres and halls, and more technical surveillance against gadgets.</li>
</ul>
<p>The press note does not change any date. The final answer key and result are still awaited.</p>`,
    source_url: `${PDF}/Press_Notice_19112026.pdf`,
    exam: { slug: "finance-accounts-assistant", title: "Finance Accounts Assistant" },
  },
  {
    slug: "jkssb-faa-provisional-answer-key-2026",
    title: "JKSSB FAA provisional answer key released: objections 16 to 18 November",
    category: "answer_key",
    published_at: "2026-11-15T21:30:00+05:30",
    summary:
      "JKSSB has released the provisional answer key for the Accounts Assistant (Finance) exam for Series A, B, C and D. Objections are accepted in person for three working days from Monday 16 November 2026.",
    body: `
<p>JKSSB released the <strong>provisional answer key</strong> for the Accounts Assistant (Finance Department) exam on 15 November 2026, the same day the exam was held. It covers all four question paper series: A, B, C and D.</p>
<p><a href="/notices/jkssb-faa-provisional-answer-key-2026.pdf">Download the answer key (PDF, 5 pages)</a>. It includes the objection form.</p>
<h2>How to raise an objection</h2>
<ul>
  <li><strong>When:</strong> three working days starting Monday 16 November 2026, so up to Wednesday 18 November unless there is a holiday. 11:00 AM to 5:00 PM.</li>
  <li><strong>Where:</strong> in person only, at the JKSSB office at Muthi, Akhnoor Road, Jammu or Zamzam Building, Rambagh, Srinagar.</li>
  <li><strong>Fee:</strong> ₹200 per question by demand draft in favour of the Accounts Officer, J&amp;K Services Selection Board. It is refunded if your objection is found correct.</li>
  <li><strong>What to bring:</strong> the form at Annexure B of the notice, one form per question, with hard copies of your supporting proof.</li>
</ul>
<h2>Good to know</h2>
<ul>
  <li>If an objection is accepted, the key is revised for all candidates.</li>
  <li>JKSSB will not tell candidates individually whether their objection was accepted.</li>
  <li>Objections sent after the window or by any other mode are not considered.</li>
</ul>
<p>Once you have checked your answers, see where you stand with the <a href="/tools/jkssb-faa-rank-predictor">FAA rank predictor</a>. If you saved a score earlier, you can correct it once now that the key is out.</p>
<p>Notice No. JKSSB-COE0EXAM(UT)/27/2026-03, dated 15.11.2026.</p>`,
    source_url: `${PDF}/PROV_ANSKEY_FAA_15112026.pdf`,
    exam: { slug: "finance-accounts-assistant", title: "Finance Accounts Assistant" },
  },
  {
    slug: "jkssb-faa-exam-held-answer-key-awaited-2026",
    title: "JKSSB FAA exam held on 15 November",
    category: "notification",
    published_at: "2026-11-15T14:00:00+05:30",
    summary:
      "The Accounts Assistant (Finance) written exam for 600 posts was held on 15 November 2026. The provisional answer key came out the same day.",
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
  <li><strong>Provisional answer key:</strong> released on 15 November. <a href="/notifications/jkssb-faa-provisional-answer-key-2026">See the key and how to object</a>.</li>
  <li><strong>Objection window:</strong> three working days from 16 November.</li>
  <li><strong>Final key and result.</strong></li>
</ul>
<p>Check your score against the key and see your likely rank with our <a href="/tools/jkssb-faa-rank-predictor">FAA rank predictor</a>.</p>`,
    source_url: `${PDF}/Admit_Card_Notice_15112026.pdf`,
    exam: { slug: "finance-accounts-assistant", title: "Finance Accounts Assistant" },
  },
  {
    slug: "jkssb-class-iv-mts-last-date-extended-2026",
    title: "JKSSB Class-IV (MTS) last date extended to 27 November",
    category: "notification",
    published_at: "2026-11-16T12:00:00+05:30",
    summary:
      "JKSSB has extended the last date to apply for the 2,863 Class-IV (MTS) and Sanitation Worker posts under Advertisement 09 of 2026 to 27 November 2026.",
    body: `
<p>Applications for the <strong>Class-IV (MTS) and Sanitation Worker</strong> posts under Advertisement Notification No. 09 of 2026 (dated 01.09.2026) are open again. The last date is now <strong>27 November 2026</strong>, instead of 12 November.</p>
<h2>At a glance</h2>
<ul>
  <li><strong>Posts:</strong> 2,863 (UT 105, Division Jammu 1,093, Division Kashmir 897, district cadres 768)</li>
  <li><strong>Pay:</strong> SL-1 (₹14,800–47,100)</li>
  <li><strong>Qualification:</strong> MTS: Matric to 10+2. Sanitation Worker: 8th pass to 10+2.</li>
  <li><strong>Apply:</strong> online at jkssb.nic.in, until 27 November 2026</li>
  <li><strong>Exam date:</strong> not announced yet</li>
</ul>
<p>Apply well before the last day. JKSSB warns that the site slows down under heavy load in the closing days.</p>
<p>Notice No. JKSSB-PLAN/6/2025-03, dated 11.11.2026.</p>`,
    source_url: `${PDF}/Extension_notice_09OF2026_11112026.pdf`,
    exam: { slug: "class-iv-mts", title: "Class-IV (MTS) & Sanitation Worker" },
  },
  {
    slug: "jkssb-advt-08-2026-edit-option",
    title: "JKSSB Junior Pharmacist, Staff Nurse, Lab Assistant & more (518 posts): edit your form by 20 November",
    category: "notification",
    published_at: "2026-11-16T12:00:00+05:30",
    summary:
      "Applied for Junior Pharmacist (211 posts), Junior Staff Nurse or any of the 518 posts under JKSSB Advertisement 08 of 2026? You can edit your form from 16 to 20 November 2026.",
    body: `
<p>If you applied for any of the <strong>518 posts</strong> in JKSSB's Advertisement Notification No. 08 of 2026 (dated 04.08.2026), you can now <strong>edit your application form</strong>.</p>
<ul>
  <li><strong>When:</strong> 16 November 2026 (12:00 AM) to 20 November 2026 (11:59 PM)</li>
  <li><strong>Cannot be changed:</strong> name, date of birth, category, posts applied for, phone number and email</li>
</ul>
<h2>Which posts this covers</h2>
<p>By department: Health and Medical Education 421, Higher Education 48, Agriculture Production 46, Labour and Employment 3.</p>
<ul>
  <li><strong>Junior Pharmacist:</strong> 211</li>
  <li><strong>Junior Staff Nurse:</strong> 48</li>
  <li><strong>Junior Laboratory Assistant:</strong> 48</li>
  <li><strong>FMPHW:</strong> 46 · <strong>MMPHW:</strong> 19</li>
  <li><strong>Horticulture Technician Grade-IV:</strong> 45</li>
  <li><strong>Junior Lab. Technician:</strong> 40</li>
  <li><strong>Junior Ophthalmic Technician:</strong> 17 · <strong>Health Educator:</strong> 15 · <strong>Sanitary Inspector:</strong> 14 · <strong>Junior Theatre Technician:</strong> 10</li>
  <li><strong>Others:</strong> Supervisor (3), Senior Canning Attendant (1)</li>
</ul>
<p>Applications closed on 24 October 2026. Exam dates have not been announced yet.</p>
<p><a href="${PDF}/Advertisement_08OF2026_04082026.pdf">Full advertisement with every post (PDF)</a></p>
<p>Notice No. JKSSB-PLAN/6/2025-03, dated 11.11.2026.</p>`,
    source_url: `${PDF}/Edit_option_08OF2026_11112026.pdf`,
    exam: { slug: "advt-08-2026", title: "Junior Pharmacist, Staff Nurse, Lab Assistant & more" },
  },
  {
    slug: "jkssb-junior-engineer-mechanical-notification-2026",
    title: "JKSSB Junior Engineer (Mechanical): 127 posts, application dates postponed",
    category: "notification",
    published_at: "2026-11-16T12:00:00+05:30",
    summary:
      "JKSSB has advertised 127 Junior Engineer (Mechanical) posts in PWD (R&B). Applications were to open on 16 November 2026 but have been postponed; new dates will be announced.",
    body: `
<p>JKSSB advertised <strong>127 posts of Junior Engineer (Mechanical)</strong> in the Public Works (R&amp;B) Department under Advertisement Notification No. 10 of 2026, dated 21.10.2026.</p>
<h2>Application dates postponed</h2>
<p>Applications were due to open on 16 November 2026. A notice dated 15.11.2026 postpones this, and JKSSB will announce fresh dates separately.</p>
<h2>At a glance</h2>
<ul>
  <li><strong>Posts:</strong> 127, UT cadre (OM 51, SC 10, ST-1 13, ST-2 13, OBC 10, ALC/IB 5, RBA 13, EWS 12), Item No. 265</li>
  <li><strong>Pay:</strong> Level-6 (₹35,400–1,12,400)</li>
  <li><strong>Qualification:</strong> 3-year diploma in Mechanical Engineering, or a degree in Mechanical Engineering, or AMIE (Sections A and B)</li>
  <li><strong>Age:</strong> as on 01.01.2026, up to 40 for open merit and 43 for reserved categories</li>
  <li><strong>Fee:</strong> ₹600; ₹500 for SC, ST-1, ST-2, EWS and PwBD</li>
  <li><strong>Selection:</strong> merit in an objective OMR written exam only</li>
</ul>
<p><a href="${PDF}/Advt_notification_10OF2026_21102026.pdf">Full advertisement (PDF)</a></p>`,
    source_url: `${PDF}/Notice_10OF2026_15112026.pdf`,
    exam: { slug: "junior-engineer-mechanical", title: "Junior Engineer (Mechanical)" },
  },
  {
    slug: "jkssb-junior-engineer-civil-notification-2026",
    title: "JKSSB Junior Engineer (Civil): 458 posts, apply from 30 November",
    category: "notification",
    published_at: "2026-11-16T12:00:00+05:30",
    summary:
      "JKSSB has advertised 458 Junior Engineer (Civil) posts in Jal Shakti and PWD (R&B). Online applications run from 30 November to 29 December 2026.",
    body: `
<p>JKSSB advertised <strong>458 posts of Junior Engineer (Civil)</strong> under Advertisement Notification No. 11 of 2026, dated 27.10.2026.</p>
<h2>Dates</h2>
<ul>
  <li><strong>Applications open:</strong> 30 November 2026</li>
  <li><strong>Last date:</strong> 29 December 2026</li>
</ul>
<h2>Posts</h2>
<ul>
  <li><strong>Jal Shakti Department:</strong> 282 (OM 113, SC 23, ST-1 28, ST-2 28, OBC 22, ALC/IB 11, RBA 28, EWS 29)</li>
  <li><strong>Public Works (R&amp;B) Department:</strong> 176 (OM 71, SC 14, ST-1 18, ST-2 18, OBC 14, ALC/IB 7, RBA 17, EWS 17)</li>
</ul>
<h2>At a glance</h2>
<ul>
  <li><strong>Pay:</strong> Level-6 (₹35,400–1,12,400), UT cadre</li>
  <li><strong>Qualification:</strong> 3-year diploma in Civil Engineering, or a degree in Civil Engineering, or AMIE (Sections A and B)</li>
  <li><strong>Age:</strong> as on 01.01.2026, up to 40 for open merit and 43 for reserved categories</li>
  <li><strong>Fee:</strong> ₹600; ₹500 for SC, ST-1, ST-2, EWS and PwBD</li>
  <li><strong>Selection:</strong> merit in an objective OMR written exam only</li>
</ul>`,
    source_url: `${PDF}/Advertisement_11OF2026_27102026.pdf`,
    exam: { slug: "junior-engineer-civil", title: "Junior Engineer (Civil)" },
  },
  {
    slug: "jkssb-sub-inspector-exam-date-2026",
    title: "JK Police Sub-Inspector exam on 29 November: 669 posts",
    category: "notification",
    published_at: "2026-11-15T17:00:00+05:30",
    summary:
      "JKSSB will hold the OMR-based written exam for 669 JK Police Sub-Inspector posts on 29 November 2026. Admit cards are available from 26 November.",
    body: `
<p>As per the JKSSB advance notice dated 1 August 2026, the OMR-based written exam for <strong>Sub-Inspector (Advertisement Notification 02 of 2024, Item 07)</strong> is scheduled for <strong>Sunday, 29 November 2026</strong>.</p>
<h2>Admit card</h2>
<p>Update, 20 November: JKSSB says admit cards will be available from <strong>26 November 2026</strong> on jkssb.nic.in (<a href="/notifications/jkssb-sub-inspector-admit-card-2026">details</a>).</p>
<h2>Posts</h2>
<p><strong>669</strong>, UT cadre, pay Level-6C (₹35,700–1,13,100): OM 267, SC 53, ST-1 67, ST-2 67, OBC 54, RBA 67, ALC/IB 27, EWS 67.</p>
<h2>How selection works</h2>
<ul>
  <li><strong>Written exam</strong> decides merit. NCC certificate holders get bonus marks as per S.O. 290 of 2021.</li>
  <li><strong>Physical Standard Test (PST):</strong> six times the vacancies in each category are called, in merit order. Qualifying only.</li>
  <li><strong>Physical Endurance Test (PET):</strong> for those who clear the PST. Qualifying only.</li>
</ul>
<p><a href="${PDF}/Advertisement_Notification_No_02_of_2024_22112024.pdf">Full advertisement (PDF)</a> · <a href="${PDF}/Syllabus_SI_Home_Department_26122024.pdf">Syllabus (PDF)</a></p>`,
    source_url: HOME_EXAMS_NOTICE,
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
<p>JKSSB announced these Home Department exam dates in its advance notice of 1 August 2026. All are OMR-based written exams. Admit cards are issued seven days before each exam. Dates can change, so confirm on the official site before you travel.</p>
<h2>Exam dates</h2>
<ul>
  <li><strong>13 December 2026:</strong> Constable (Executive), Notification 12 of 2025, Items 273–274</li>
  <li><strong>20 December 2026:</strong> Constable (Armed / IRP / SDRF), Notification 14 of 2025, Items 323–324</li>
  <li><strong>23 December 2026:</strong> Sub-Inspector (Telecommunication), Notification 11 of 2025, Item 272 (104 posts after the addendum of 31.12.2025)</li>
  <li><strong>27 December 2026:</strong> Constable (Telecommunication), Notification 15 of 2025, Item 325</li>
  <li><strong>30 December 2026:</strong> Constable (Photographer), Notification 15 of 2025, Item 326</li>
</ul>
<h2>Syllabus</h2>
<ul>
  <li><a href="${PDF}/Syllabus_Constable_Executive_21102026.pdf">Constable (Executive)</a></li>
  <li><a href="${PDF}/Syllabus_constable_ARMED_IRP_SDRF_21102026.pdf">Constable (Armed / IRP / SDRF)</a></li>
  <li><a href="${PDF}/Syllabus_Constable_Telecommunication_photographer_21102026.pdf">Constable (Telecommunication and Photographer)</a></li>
  <li><a href="${PDF}/Syllabus_SITELECOMMUNICATION_10042026.pdf">Sub-Inspector (Telecommunication)</a></li>
</ul>`,
    source_url: HOME_EXAMS_NOTICE,
    exam: { slug: "police-constable", title: "JK Police Constable" },
  },
];
